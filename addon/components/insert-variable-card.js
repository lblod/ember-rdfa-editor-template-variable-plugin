import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { task } from 'ember-concurrency';
import { v4 as uuidv4 } from 'uuid';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import { fetchCodeListsByPublisher } from '../utils/fetchData';
export default class EditorPluginsInsertCodelistCardComponent extends Component {
  @tracked variableTypes;
  @tracked selectedVariableType;
  @tracked showCard = true;
  @tracked isCodelist = false;
  @tracked selectedCodelist;

  constructor() {
    super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
    this.endpoint = config.insertVariablePlugin.endpoint;
    const { publisher, variableTypes } = this.args.widgetArgs.options || {};
    this.variableTypes = variableTypes ?? [
      'text',
      'number',
      'date',
      'location',
      'codelist',
    ];
    this.args.controller.onEvent('selectionChanged', this.selectionChanged);
    this.fetchCodeList.perform(publisher);
  }

  @action
  insert() {
    const uri = `http://data.lblod.info/mappings/${uuidv4()}`;
    let contentSpan;
    if (this.selectedVariableType === 'codelist') {
      contentSpan = `<span property="ext:content">\${${this.selectedCodelist.label}}</span>`;
    } else if (this.selectedVariableType === 'location') {
      contentSpan = `<span property="ext:content">\${${this.selectedVariableType}}</span>`;
    } else if (this.selectedVariableType === 'date') {
      contentSpan = `<span property="ext:content" ${
        this.selectedVariableType === 'date' ? 'datatype="xsd:date"' : ''
      }>\${${this.selectedVariableType}}</span>`;
    } else {
      contentSpan = `<span class="mark-highlight-manual">\${${this.selectedVariableType}}</span>`;
    }
    const htmlToInsert = `
      <span resource="${uri}" typeof="ext:Mapping">
        <span property="dct:source" resource="${this.endpoint}"></span>
        ${
          this.selectedCodelist
            ? ` <span property="ext:codelist" content="${this.selectedCodelist.uri}"></span>`
            : ''
        }
        <span property="dct:type" content="${this.selectedVariableType}"></span>
        ${contentSpan}
      </span>
    `;
    this.args.controller.executeCommand(
      'insert-html',
      htmlToInsert,
      this.args.controller.selection.lastRange
    );
    this.args.controller.executeCommand(
      'insert-text',
      INVISIBLE_SPACE,
      this.args.controller.selection.lastRange
    );
    this.selectedVariableType = undefined;
    this.selectedCodelist = undefined;
    this.isCodelist = false;
  }

  @action
  updateSelectedVariable(variableType) {
    this.selectedVariableType = variableType;
    if (variableType === 'codelist') {
      this.isCodelist = true;
    } else {
      this.isCodelist = false;
    }
  }

  @action
  updateCodelist(codelist) {
    this.selectedCodelist = codelist;
  }

  @task
  *fetchCodeList(publisher) {
    const codelists = yield fetchCodeListsByPublisher(this.endpoint, publisher);
    this.codelists = codelists;
  }

  @action
  selectionChanged() {
    const currentSelection = this.args.controller.selection.lastRange;
    if (!currentSelection) {
      return;
    }
    this.showCard = false;
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      currentSelection,
      'rangeIsInside'
    );
    const mapping = limitedDatastore
      .match(null, 'a', 'ext:Mapping')
      .asQuads()
      .next().value;
    if (mapping) {
      this.showCard = false;
    } else {
      this.showCard = true;
    }
  }
}
