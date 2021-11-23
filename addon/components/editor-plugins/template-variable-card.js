import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { task } from 'ember-concurrency';

import fetchCodeListOptions from '../../utils/fetchData';

export default class EditorPluginsTemplateVariableCardComponent extends Component {
  @tracked variableOptions = ['variable1', 'variable2', 'variable3'];
  @tracked selectedVariable;

  constructor() {
    super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
    this.endpoint = config.roadsignRegulationPlugin.endpoint;
    this.fetchCodeListOptions.perform();
  }

  @action
  updateVariable(variable) {
    this.selectedVariable = variable;
  }

  @task
  *fetchCodeListOptions() {
    const options = yield fetchCodeListOptions(
      this.endpoint,
      'http://lblod.data.gift/concept-schemes/02ce247f-566c-4b8c-afd7-67a06c94b9db'
    );
    console.log(options);
    this.variableOptions = options;
  }
}
