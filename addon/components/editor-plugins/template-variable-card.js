import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { task } from 'ember-concurrency';

import fetchCodeListOptions from '../../utils/fetchData';
import { MULTI_SELECT_CODELIST_TYPE, ZONAL_URI } from '../../utils/constants';

export default class EditorPluginsTemplateVariableCardComponent extends Component {
  @tracked variableOptions = [];
  @tracked selectedVariable;
  @tracked showCard = false;
  @tracked multiSelect = false;
  mappingUri;
  liveMarkRule;

  constructor() {
    super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
    this.zonalLocationCodelistUri =
      config.templateVariablePlugin.zonalLocationCodelistUri;
    this.endpoint = config.templateVariablePlugin.endpoint;
    this.nonZonalLocationCodelistUri =
      config.templateVariablePlugin.nonZonalLocationCodelistUri;
    this.liveMarkRule = {
      matcher: (datastore) => {
        const limitedDataset = datastore.transformDataset(
          (dataset, termconverter) => {
            const mappings = dataset.match(
              null,
              termconverter('a'),
              termconverter('ext:Mapping')
            );
            const locations = dataset.match(
              null,
              termconverter('>http://purl.org/dc/terms/type'),
              termconverter('@en-US"location')
            );
            const codelists = dataset.match(
              null,
              termconverter('>http://purl.org/dc/terms/type'),
              termconverter('@en-US"codelist')
            );
            const supportedMappings = locations.union(codelists);
            return mappings.filter(
              (quad) => supportedMappings.match(quad.subject).size !== 0
            );
          }
        );
        const matches = limitedDataset.searchTextIn(
          'subject',
          new RegExp('.*')
        );
        return matches;
      },
      liveSpecs: ['highlighted'],
    };
    this.args.controller.perform((tr) => {
      tr.addTransactionDispatchListener(this.onTransactionUpdate);
      tr.commands.addLiveMarkRule({
        rule: this.liveMarkRule,
      });
    });
  }

  willDestroy() {
    this.args.controller.perform((tr) => {
      tr.removeTransactionDispatchListener(this.onTransactionUpdate);
      tr.commands.removeLiveMarkRule({
        rule: this.liveMarkRule,
      });
    });
    super.willDestroy();
  }

  get controller() {
    return this.args.controller;
  }

  @action
  insert() {
    const selectedRange = this.args.controller.selection.lastRange;
    if (!selectedRange) {
      return;
    }
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      selectedRange,
      'rangeIsInside'
    );
    const mapping = limitedDatastore
      .match(`>${this.mappingUri}`, 'ext:content', null)
      .asSubjectNodes()
      .next().value;
    const mappingNode = [...mapping.nodes][0];
    let mappingContentNode;
    for (let child of mappingNode.children) {
      if (child.attributeMap.get('property') === 'ext:content') {
        mappingContentNode = child;
        break;
      }
    }
    let textToInsert = '';
    if (this.selectedVariable.length) {
      textToInsert = this.selectedVariable
        .map((variable) => variable.value)
        .join(', ');
    } else {
      textToInsert = this.selectedVariable.value;
    }
    textToInsert = this.wrapVariableInHighlight(textToInsert);
    this.args.controller.perform((tr) => {
      tr.commands.insertAndCollapse({
        htmlString: textToInsert,
        node: mappingContentNode,
      });
    });
  }

  modifiesSelection(steps) {
    return steps.some(
      (step) => step.type === 'selection-step' || step.type === 'operation-step'
    );
  }

  onTransactionUpdate = (transaction) => {
    if (this.modifiesSelection(transaction.steps)) {
      console.log('TRANSACTION DISPATCH');
      this.showCard = false;
      this.selectedVariable = undefined;
      const selectedRange = this.controller.selection.lastRange;
      if (!selectedRange) {
        return;
      }
      const fullDatastore = this.controller.datastore;
      const limitedDatastore = fullDatastore.limitToRange(
        selectedRange,
        'rangeIsInside'
      );
      const mapping = limitedDatastore
        .match(null, 'a', 'ext:Mapping')
        .asQuads()
        .next().value;
      if (mapping) {
        const mappingUri = mapping.subject.value;
        this.mappingUri = mappingUri;
        const mappingTypeTriple = fullDatastore
          .match(`>${mappingUri}`, 'dct:type', null)
          .asQuads()
          .next().value;
        if (mappingTypeTriple) {
          const mappingType = mappingTypeTriple.object.value;
          if (mappingType === 'codelist') {
            const codelistTriple = fullDatastore
              .match(`>${mappingUri}`, 'ext:codelist', null)
              .asQuads()
              .next().value;
            const codelistSource = this.getCodelistSource(
              fullDatastore,
              mappingUri
            );
            this.showCard = true;
            const codelistUri = codelistTriple.object.value;
            this.fetchCodeListOptions.perform(codelistSource, codelistUri);
          } else if (mappingType === 'location') {
            const codelistSource = this.getCodelistSource(
              fullDatastore,
              mappingUri
            );
            const measureTriple = limitedDatastore
              .match(
                null,
                'a',
                '>https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitsmaatregel'
              )
              .asQuads()
              .next().value;
            const measureUri = measureTriple.subject.value;
            const zonalityTriple = fullDatastore
              .match(`>${measureUri}`, 'ext:zonality', null)
              .asQuads()
              .next().value;
            const zonalityUri = zonalityTriple.object.value;
            if (zonalityUri === ZONAL_URI) {
              this.fetchCodeListOptions.perform(
                codelistSource,
                this.zonalLocationCodelistUri,
                true
              );
            } else {
              this.fetchCodeListOptions.perform(
                codelistSource,
                this.nonZonalLocationCodelistUri,
                true
              );
            }
            this.showCard = true;
          }
        }
      }
    }
  };

  getCodelistSource(fullDatastore, mappingUri) {
    const codelistSourceTriple = fullDatastore
      .match(`>${mappingUri}`, 'dct:source', null)
      .asQuads()
      .next();

    if (codelistSourceTriple && codelistSourceTriple.value) {
      const codelistSourceTripleValue = codelistSourceTriple.value;
      return codelistSourceTripleValue.object.value;
    } else {
      return this.endpoint;
    }
  }

  @action
  updateVariable(variable) {
    this.selectedVariable = variable;
  }

  @task
  *fetchCodeListOptions(endpoint, codelistUri, isLocation) {
    const { type, options } = yield fetchCodeListOptions(endpoint, codelistUri);
    if (isLocation) {
      this.variableOptions = options.map((option) => ({
        label: option.label,
        value: this.wrapInLocation(option.value),
      }));
    } else {
      this.variableOptions = options;
    }
    if (type === MULTI_SELECT_CODELIST_TYPE) {
      this.multiSelect = true;
    } else {
      this.multiSelect = false;
    }
  }

  wrapVariableInHighlight(text) {
    return text.replace(
      /\$\{(.+?)\}/g,
      '<span class="mark-highlight-manual">${$1}</span>'
    );
  }

  wrapInLocation(value) {
    return `
      <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
        ${value}
      </span>
    `;
  }
}
