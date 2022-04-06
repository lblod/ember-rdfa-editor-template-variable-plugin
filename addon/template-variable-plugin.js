import InsertAndCollapseCommand from './commands/insertAndCollapse';
import MappingMark from '@lblod/ember-rdfa-editor-template-variable-plugin/marks/mapping-mark';
/**
 * Entry point for TemplateVariable
 *
 * @module editor-roadsign-regulation-plugin
 * @class TemplateVariablePlugin
 * @constructor
 * @extends EmberService
 */
export default class TemplateVariablePlugin {
  /**
   * Handles the incoming events from the editor dispatcher.  Responsible for generating hint cards.
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the state in the HintsRegistry.  Allows the
   * HintsRegistry to update absolute selected regions based on what a user has entered in between.
   * @param {Array} rdfaBlocks Set of logical blobs of content which may have changed.  Each blob is
   * either has a different semantic meaning, or is logically separated (eg: a separate list item).
   * @param {Object} hintsRegistry Keeps track of where hints are positioned in the editor.
   * @param {Object} editor Your public interface through which you can alter the document.
   *
   * @public
   */
  controller;

  get name() {
    return 'template-variable-plugin';
  }

  initialize(controller) {
    this.controller = controller;
    controller.registerWidget({
      componentName: 'editor-plugins/template-variable-card',
      identifier: 'template-variable-plugin/card',
      desiredLocation: 'sidebar',
    });
    controller.onEvent('modelWritten', this.modelWrittenHandler);
    controller.registerCommand(
      new InsertAndCollapseCommand(controller._rawEditor._model)
    );
    controller.registerMark(MappingMark);
  }

  modelWrittenHandler(event) {
    if (event.owner !== this.name) {
      const rangesToHighlight = this.controller.executeCommand(
        'match-text',
        this.controller.createFullDocumentRange(),
        /variable/g
      );

      for (const range of rangesToHighlight) {
        const selection = this.controller.createSelection();
        selection.selectRange(range);
        this.controller.executeCommand('make-highlight', selection, false);
      }
    }
  }
}
