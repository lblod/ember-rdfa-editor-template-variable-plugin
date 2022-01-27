import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  plugins = ['template-variable'];

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
  <span property="ext:content">\${adsad}</span>
</span>
sdajnd
sdknakds

<span typeof="ext:Mapping" resource="http://data.lblod.info/mappings/6193E150A56DF1000A000006">
  <span property="dct:type" content="locatie"></span>
  <span property="ext:content">\${a}</span>
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
    controller.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }
}
