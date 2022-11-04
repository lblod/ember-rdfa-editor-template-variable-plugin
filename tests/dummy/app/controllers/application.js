import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  plugins = [
    'template-variable',
    {
      name: 'insert-variable',
      options: {
        defaultEndpoint: 'https://dev.roadsigns.lblod.info/sparql',
        variableTypes: [
          'text',
          'number',
          'date',
          'codelist',
          {
            label: 'Dummy Variable',
            fetchSubtypes: async () => {
              const codelists = [
                {
                  uri: '1',
                  label: '1',
                },
                {
                  uri: '2',
                  label: '2',
                },
                {
                  uri: '3',
                  label: '3',
                },
              ];
              return codelists;
            },
            template: (endpoint, selectedCodelist) => `
              <span property="ext:codelist" resource="${selectedCodelist.uri}"></span>
              <span property="dct:type" content="location"></span>
              <span property="dct:source" resource="${endpoint}"></span>
              <span property="ext:content" datatype="xsd:date">
                <span class="mark-highlight-manual">\${${selectedCodelist.label}}</span>
              </span>
            `,
          },
        ],
      },
    },
  ];

  @action
  rdfaEditorInit(controller) {
    const presetContent = `<div property="eli:has_part" prefix="ext: http://mu.semte.ch/vocabularies/ext/ mobiliteit: https://data.vlaanderen.be/ns/mobiliteit# dct: http://purl.org/dc/terms/" typeof="besluit:Artikel" resource="http://data.lblod.info/artikels/32f2768c-917f-412a-a33e-45b2722eb610" data-editor-position-level="4" data-editor-rdfa-position-level="4">
    <div property="eli:number" datatype="xsd:string">Artikel <span class="mark-highlight-manual">nummer</span></div>
    <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
    <div propert="prov:value" datatype="xsd:string" data-editor-position-level="3" data-editor-rdfa-position-level="3">
      <div property="mobiliteit:heeftVerkeersmaatregel" typeof="mobiliteit:Mobiliteitsmaatregel" resource="http://data.lblod.info/mobiliteitsmaatregels/3fc7ddc1-ba58-4f3f-8878-dfd78b6a531b" data-editor-position-level="2" data-editor-rdfa-position-level="2">
      <span style="display:none;" property="prov:wasDerivedFrom" resource="http://data.lblod.info/templates/6197950D34D7B60009000024">&nbsp;</span>
      <span style="display:none;" property="ext:zonality" resource="http://lblod.data.gift/concepts/c81c6b96-736a-48cf-b003-6f5cc3dbc55d"></span>
        <div property="dct:description" data-editor-position-level="1" data-editor-rdfa-position-level="1">
          A3 templaete
          <span resource="http://data.lblod.info/mappings/619C8F7A34D7B60009000080" typeof="ext:Mapping" data-editor-position-level="2" data-editor-rdfa-position-level="2">
          <span property="dct:source" content="https://dev.roadsigns.lblod.info/sparql"></span>
            <span property="dct:type" content="location"></span>
            <span property="ext:content" data-editor-position-level="1" data-editor-rdfa-position-level="1">\${location}</span>
          </span>
          <span resource="http://data.lblod.info/mappings/619C8F7A34D7B60009000081" typeof="ext:Mapping">
          <span property="dct:source" content="https://dev.roadsigns.lblod.info/sparql"></span>
            <span property="dct:type" content="codelist"></span>
            <span property="ext:codelist" resource="http://lblod.data.gift/concept-schemes/61C054CEE3249100080000B9"></span>
            <span property="ext:content">\${codelist}</span>
          </span>
          <span resource="http://data.lblod.info/mappings/619C8F7A34D7B60009000082" typeof="ext:Mapping">
            <span property="ext:content">\${normal}</span>
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
    controller.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }
}
