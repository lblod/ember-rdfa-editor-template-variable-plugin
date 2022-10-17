/**
 * Entry point for InsertVariable
 *
 * @module editor-insert-variable-plugin
 * @class InsertVariablePlugin
 * @constructor
 * @extends EmberService
 */
export default class InsertVariablePlugin {
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
    return 'insert-variable-plugin';
  }

  initialize(controller, options) {
    this.controller = controller;
    controller.registerWidget({
      componentName: 'insert-variable-card',
      identifier: 'insert-variable-plugin/card',
      desiredLocation: 'sidebar',
      widgetArgs: {
        options: options,
      },
    });
  }
}
