import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import xmlFormat from 'xml-formatter';
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { xml } from '@codemirror/lang-xml';
import { html } from '@codemirror/lang-html';

export default class ApplicationController extends Controller {
  @tracked debug;
  @tracked xmlDebuggerOpen = false;
  @tracked debuggerContent = '';
  @tracked htmlDebuggerOpen = false;
  unloadListener;
  xmlEditor;
  htmlEditor;
  plugins = ['template-variable'];
  controller;

  @tracked _editorController;

  get editorController() {
    if (!this._editorController) {
      throw new Error('Accessing controller before editor init');
    }
    return this._editorController;
  }

  get formattedXmlContent() {
    if (this.debuggerContent) {
      try {
        return xmlFormat(this.debuggerContent);
      } catch (e) {
        return this.debuggerContent;
      }
    }
    return this.debuggerContent;
  }

  setup() {
    this.unloadListener = () => {
      this.saveEditorContentToLocalStorage();
    };
    window.addEventListener('beforeunload', this.unloadListener);
  }

  teardown() {
    if (this.unloadListener) {
      window.removeEventListener('beforeunload', this.unloadListener);
    }
  }

  @action
  initDebug(info) {
    this.debug = info;
  }

  @action
  setupXmlEditor(element) {
    this.xmlEditor = new EditorView({
      state: EditorState.create({
        extensions: [basicSetup, xml()],
      }),
      parent: element,
    });
    this.xmlEditor.dispatch({
      changes: { from: 0, insert: this.debuggerContent },
    });
  }

  @action
  setupHtmlEditor(element) {
    this.htmlEditor = new EditorView({
      state: EditorState.create({
        extensions: [basicSetup, html()],
      }),
      parent: element,
    });
    this.htmlEditor.dispatch({
      changes: { from: 0, insert: this.debuggerContent },
    });
  }

  setHtmlContent(content) {
    this.editorController.executeCommand(
      'insert-html',
      content,
      this.editorController.rangeFactory.fromAroundAll()
    );
  }

  setXmlContent(content) {
    this.editorController.executeCommand(
      'insert-xml',
      content,
      this.editorController.rangeFactory.fromAroundAll()
    );
  }

  getXmlContent() {
    const content = this.editorController.executeQuery(
      'get-content',
      'xml',
      this.editorController.rangeFactory.fromAroundAll()
    );
    if (!content) {
      return '';
    }
    return xmlFormat(content.innerHTML);
  }

  getHtmlContent() {
    const content = this.editorController.executeQuery(
      'get-content',
      'html',
      this.editorController.rangeFactory.fromAroundAll()
    );
    if (!content) {
      return '';
    }
    return content.innerHTML;
  }

  @action
  rdfaEditorInit(controller) {
    const presetContent = `<div property="eli:has_part" prefix="mobiliteit: https://data.vlaanderen.be/ns/mobiliteit# dct: http://purl.org/dc/terms/" typeof="besluit:Artikel" resource="http://data.lblod.info/artikels/32f2768c-917f-412a-a33e-45b2722eb610" data-editor-position-level="4" data-editor-rdfa-position-level="4">
    <div property="eli:number" datatype="xsd:string">Artikel <span class="mark-highlight-manual">nummer</span></div>
    <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
    <div propert="prov:value" datatype="xsd:string" data-editor-position-level="3" data-editor-rdfa-position-level="3">
      <div property="mobiliteit:heeftVerkeersmaatregel" typeof="mobiliteit:Mobiliteitsmaatregel" resource="http://data.lblod.info/mobiliteitsmaatregels/3fc7ddc1-ba58-4f3f-8878-dfd78b6a531b" data-editor-position-level="2" data-editor-rdfa-position-level="2">
      <span style="display:none;" property="prov:wasDerivedFrom" resource="http://data.lblod.info/templates/6197950D34D7B60009000024">&nbsp;</span>
      <span style="display:none;" property="ext:zonality" resource="http://lblod.data.gift/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d"></span>
        <div property="dct:description" data-editor-position-level="1" data-editor-rdfa-position-level="1">
          A3 templaete
          <span resource="http://data.lblod.info/mappings/619C8F7A34D7B60009000080" typeof="ext:Mapping" data-editor-position-level="2" data-editor-rdfa-position-level="2">
            <span property="dct:type" content="location"></span>
            <span property="ext:content" data-editor-position-level="1" data-editor-rdfa-position-level="1">\${test}</span>
          </span>
          <p>Dit wordt aangeduid door verkeerstekens:</p>
          <ul style="list-style:none;"><li style="margin-bottom:1rem;"><span property="mobiliteit:wordtAangeduidDoor" resource="http://data.lblod.info/verkeerstekens/c8303580-a29e-4ba7-afad-4b8cb16a1e50" typeof="mobiliteit:Verkeersbord-Verkeersteken">
    <span property="mobiliteit:heeftVerkeersbordconcept" resource="http://data.vlaanderen.be/id/concept/Verkeersbordconcept/9cbedafef411f1c41317f8b9f4066ea6eccfc832edfc930d421725c3ebc5c167" typeof="mobiliteit:Verkeersbordconcept" style="display:flex;align-items:center;">
      <img property="mobiliteit:grafischeWeergave" src="http://mobiliteit.vo.data.gift/images/c1b72c2960a2861d6c89b96db75b903061685d93646419147e4cdadfb05dee87" style="width:5rem;margin-right:1rem;margin-left:0;">
      <span property="skos:prefLabel" style="margin-left:0;">A3</span> met zonale geldigheid
      </span>
    </span>
  </li></ul>
        </div>
      </div>
    </div>
  </div>`;
    this._editorController = controller;
    this.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  setDebuggerContent(content) {
    this.debuggerContent = content;
  }

  @action
  setEditorContent(type, content) {
    if (this._editorController) {
      if (type === 'html') {
        this.setHtmlContent(content);
        this.saveEditorContentToLocalStorage();
      } else {
        this.setXmlContent(content);
        this.saveEditorContentToLocalStorage();
      }
    }
  }

  @action openContentDebugger(type) {
    if (this._editorController) {
      if (type === 'xml') {
        this.debuggerContent = this.getXmlContent();
        this.xmlDebuggerOpen = true;
      } else {
        this.debuggerContent = this.getHtmlContent();
        this.htmlDebuggerOpen = true;
      }
    }
  }

  @action closeContentDebugger(type, save) {
    if (type === 'xml') {
      this.debuggerContent = this.xmlEditor.state.sliceDoc();
      this.xmlDebuggerOpen = false;
    } else {
      this.debuggerContent = this.htmlEditor.state.sliceDoc();
      this.htmlDebuggerOpen = false;
    }
    if (save) {
      const content = this.debuggerContent;
      if (!content) {
        //xml parser doesn't accept an empty string
        this.setEditorContent('html', '');
      } else {
        this.setEditorContent(type, content);
      }
    }
  }

  saveEditorContentToLocalStorage() {
    if (this._editorController) {
      const content = this.getHtmlContent();
      localStorage.setItem('EDITOR_CONTENT', content || '');
    }
  }
}
