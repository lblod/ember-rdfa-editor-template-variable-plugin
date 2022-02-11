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
import { ZONAL_URI } from '../../utils/constants';

export default class EditorPluginsTemplateVariableCardComponent extends Component {
  @tracked variableOptions = [];
  @tracked selectedVariable;
  @tracked showCard = false;
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
    const range = this.args.controller.rangeFactory.fromInNode(
      mappingContentNode,
      0,
      mappingContentNode.getMaxOffset()
    );
    this.args.controller.executeCommand(
      'insert-html',
      this.selectedVariable.value,
      range
    );
  }

  @action
  selectionChanged() {
    this.showCard = false;
    this.selectedVariable = undefined;
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
      const mappingTypeTriple = limitedDatastore
        .match(`>${mappingUri}`, 'dct:type', null)
        .asQuads()
        .next().value;
      if (mappingTypeTriple) {
        const mappingType = mappingTypeTriple.object.value;
        if (mappingType === 'codelist') {
          const codelistTriple = limitedDatastore
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
          const zonalityTriple = limitedDatastore
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
  }

  @task
  *fetchCodeListOptions(codelistUri) {
    const options = yield fetchCodeListOptions(this.endpoint, codelistUri);
    this.variableOptions = options;
  }
}
