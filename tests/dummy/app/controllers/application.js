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
    const presetContent = `<div property="eli:has_part" prefix="mobiliteit: https://data.vlaanderen.be/ns/mobiliteit# dct: http://purl.org/dc/terms/" typeof="besluit:Artikel" resource="http://data.lblod.info/artikels/7bb0c7b0-8ebf-40e3-b1f7-5aa695895369">
    <div property="eli:number" datatype="xsd:string">Artikel <span class="mark-highlight-manual">nummer</span></div>
    <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
    <div property="prov:value" datatype="xsd:string">
      <span class="mark-highlight-manual">Voer inhoud in</span>
    </div>
    <div property="mobiliteit:heeftVerkeersmaatregel" typeof="mobiliteit:Mobiliteitsmaatregel" resource="http://data.lblod.info/mobiliteitsmaatregel/56716535-5890-429b-a497-90858c2ec5c1">
      <div property="dct:description">
        
  <div property="dct:description">
    
  <div property="dct:description">
    
<span typeof="ext:Mapping" resource="http://data.lblod.info/mappings/6193E151A56DF1000A000008">
  <span class="mark-highlight-manual">\${testing}</span>
</span>

<span resource="http://data.lblod.info/mappings/6193E150A56DF1000A000005" typeof="ext:Mapping">
  <span property="dct:type" content="codelist"></span>
  <span property="ext:codelist" content="http://lblod.data.gift/concept-schemes/cdf4766b-8348-4e2b-a798-44e38d36a34f"></span>
  <span property="ext:variable">\${adsad}</span>
</span>
}
sdajnd
sdknakds

<span typeof="ext:Mapping" resource="http://data.lblod.info/mappings/6193E150A56DF1000A000006">
<span property="dct:type" content="locatie"></span>
  <span class="mark-highlight-manual">\${a}</span>
</span>

asdasdsd

asdad
smsda





we
<span typeof="ext:Mapping" resource="http://data.lblod.info/mappings/6193E150A56DF1000A000006">
  <span class="mark-highlight-manual">\${a}</span>
</span>
qqe
sasasd

<span typeof="ext:Mapping" resource="http://data.lblod.info/mappings/6193E151A56DF1000A000007">
  <span class="mark-highlight-manual">\${asda}</span>
</span>

  </div>


<span typeof="ext:Mapping" resource="undefined">
  <span class="mark-highlight-manual">\${variable}</span>
</span>

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
