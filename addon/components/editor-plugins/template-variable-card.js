import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { task } from 'ember-concurrency';

import fetchCodeListOptions from '../../utils/fetchData';
import {
  LOCATIE_OPTIONS,
  LOCATIE_OPTIONS_ZONAL,
} from '../../utils/locatieOptions';
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
    this.args.controller.executeCommand(
      'insert-and-collapse',
      this.args.controller,
      textToInsert,
      mappingContentNode
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
      .asQuadResultSet()
      .single();
    if (mapping) {
      const mappingUri = mapping.subject.value;
      this.mappingUri = mappingUri;
      const mappingTypeTriple = fullDatastore
        .match(`>${mappingUri}`, 'dct:type', null)
        .asQuadResultSet()
        .single();

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
            this.variableOptions = LOCATIE_OPTIONS_ZONAL;
          } else {
            this.variableOptions = LOCATIE_OPTIONS;
          }
          this.showCard = true;
        }
      }
    }
  }

  @action
  updateVariable(variable) {
    this.selectedVariable = variable;
    this.insert();
  }

  @task
  *fetchCodeListOptions(codelistUri) {
    const { type, options } = yield fetchCodeListOptions(
      this.endpoint,
      codelistUri
    );
    this.variableOptions = options;
    if (type === MULTI_SELECT_CODELIST_TYPE) {
      this.multiSelect = true;
    }
  }
}
