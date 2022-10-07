import InsertAndCollapseCommand from './commands/insertAndCollapse';

/**
 * Entry point for TemplateVariable
 *
 * @module editor-roadsign-regulation-plugin
 * @class TemplateVariablePlugin
 * @constructor
 * @extends EmberService
 */
export default class TemplateVariablePlugin {
  get name() {
    return 'template-variable-plugin';
  }

  initialize(transaction, controller) {
    transaction.registerWidget(
      {
        componentName: 'editor-plugins/template-variable-card',
        identifier: 'template-variable-plugin/card',
        desiredLocation: 'sidebar',
      },
      controller
    );
    transaction.registerCommand(
      'insertAndCollapse',
      new InsertAndCollapseCommand()
    );
  }
}
