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

  constructor() {
    super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
    this.endpoint = config.templateVariablePlugin.endpoint;
    this.zonalLocationCodelistUri =
      config.templateVariablePlugin.zonalLocationCodelistUri;
    this.nonZonalLocationCodelistUri =
      config.templateVariablePlugin.nonZonalLocationCodelistUri;
    this.args.controller.onEvent('selectionChanged', this.selectionChanged);
  }

  @action
  insert() {
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
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
    this.args.controller.executeCommand(
      'insert-and-collapse',
      this.args.controller,
      textToInsert,
      mappingContentNode
    );
  }

  wrapVariableInHighlight(text) {
    return text.replace(
      /\$\{(.+?)\}/g,
      '<span class="mark-highlight-manual">${$1}</span>'
    );
  }

  @action
  selectionChanged() {
    this.showCard = false;
    this.selectedVariable = undefined;
    const fullDatastore = this.args.controller.datastore;
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
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
          if (codelistTriple) {
            this.showCard = true;
            const codelistUri = codelistTriple.object.value;
            this.fetchCodeListOptions.perform(codelistUri);
          }
        } else if (mappingType === 'location') {
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
              this.zonalLocationCodelistUri,
              true
            );
          } else {
            this.fetchCodeListOptions.perform(
              this.nonZonalLocationCodelistUri,
              true
            );
          }
          this.showCard = true;
        }
      }
    }
  }

  @action
  updateVariable(variable) {
    this.selectedVariable = variable;
  }

  @task
  *fetchCodeListOptions(codelistUri, isLocation) {
    const { type, options } = yield fetchCodeListOptions(
      this.endpoint,
      codelistUri
    );
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
    }
  }
  wrapInLocation(value) {
    return `
      <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
        ${value}
      </span>
    `;
  }
}
