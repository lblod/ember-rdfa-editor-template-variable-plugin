import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { task } from 'ember-concurrency';

import fetchCodeListOptions from '../../utils/fetchData';
import { LOCATIE_OPTIONS } from '../../utils/locatieOptions';

export default class EditorPluginsTemplateVariableCardComponent extends Component {
  @tracked variableOptions = [];
  @tracked selectedVariable;
  @tracked showCard = false;
  mappingUri;

  constructor() {
    super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
    this.endpoint = config.templateVariablePlugin.endpoint;
    this.args.controller.onEvent('contentChanged', this.modelWrittenHandler);
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
      'insert-text',
      this.selectedVariable.label,
      range
    );
  }

  @action
  modelWrittenHandler() {
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
        } else if (mappingType === 'locatie') {
          this.showCard = true;
          this.variableOptions = LOCATIE_OPTIONS;
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
