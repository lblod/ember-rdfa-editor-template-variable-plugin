import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { task } from 'ember-concurrency';

import fetchCodeListOptions from '../../utils/fetchData';
import { LOCATIE_OPTIONS } from '../../utils/locatieOptions';

const variableType = 'locatie';

export default class EditorPluginsTemplateVariableCardComponent extends Component {
  @tracked variableOptions = [];
  @tracked selectedVariable;
  @tracked showCard = false;

  constructor() {
    super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
    this.endpoint = config.roadsignRegulationPlugin.endpoint;
    if (variableType === 'codelist') {
      this.fetchCodeListOptions.perform();
    } else if (variableType === 'locatie') {
      this.variableOptions = LOCATIE_OPTIONS;
    }
    this.args.controller.onEvent('contentChanged', this.modelWrittenHandler);
  }

  @action
  modelWrittenHandler() {
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
      'rangeIsInside'
    );
    const mapping = limitedDatastore
      .match(null, 'a', 'ext:Mapping')
      .asQuads()
      .next().value;
    console.log(mapping);
    if (mapping) {
      this.showCard = true;
      const mappingUri = mapping.subject.value;
      console.log(mappingUri);
      const allTriples = [
        ...limitedDatastore.match(`>${mappingUri}`, null, null).asQuads(),
      ];
      console.log(allTriples);
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
            const codelistUri = codelistTriple.object.value;
            this.fetchCodeListOptions.perform(codelistUri);
          } else {
            this.showCard = false;
          }
        } else if (mappingType === 'locatie') {
          this.variableOptions = LOCATIE_OPTIONS;
        } else {
          this.showCard = false;
        }
      } else {
        this.showCard = false;
      }
    } else {
      this.showCard = false;
    }
  }

  @action
  updateVariable(variable) {
    this.selectedVariable = variable;
  }

  @task
  *fetchCodeListOptions(codelistUri) {
    console.log(codelistUri)
    const options = yield fetchCodeListOptions(this.endpoint, codelistUri);
    console.log(options);
    this.variableOptions = options;
  }
}
