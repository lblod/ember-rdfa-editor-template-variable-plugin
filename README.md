ember-rdfa-editor-template-variable-plugin
==============================================================================

Ember addon which provides two plugins for the [ember-rdfa-editor](https://github.com/lblod/ember-rdfa-editor):
- an insert-variable plugin which allows you to insert variable placeholders into a document.
- a template-variable plugin which allows you to interact with these placeholders.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.28 or above
* Ember CLI v3.28 or above
* Node.js v14 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-rdfa-editor-template-variable-plugin
```


Usage
------------------------------------------------------------------------------

Both the template-variable-plugin and insert-variable-plugin can be enabled by passing them to the plugins property on the ember-rdfa-editor component.

You can configure the plugins in your `environment.js` file, e.g.:

```javascript
templateVariablePlugin: {
  endpoint: 'https://dev.roadsigns.lblod.info/sparql', // the fallback endpoint which should be used for codelists which do not have a `dct:source` property.
  zonalLocationCodelistUri:
    'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF',
  nonZonalLocationCodelistUri:
    'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2',
},
insertVariablePlugin: {
  endpoint: 'https://dev.roadsigns.lblod.info/sparql', // the endpoint the plugin should use when fetching codelists
},
```

When using the insert-variable-plugin, you can also filter the codelists by publisher. You can pass the publisher uuid when initializing the plugin. Additionally you can also pass an array to the plugin containing the variable types you want to support. In order to add a new variable you can provide a label, a fetchSubtypes function (if you need to show a second select) and a template string or function (if you need to include attributes like the endpoint or the selected subtype)

```javascript
{
  name:'insert-variable',
  options: {
    publisher: 'http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b',
    variableTypes: [
          'text',
          'number',
          'date',
          'location',
          'codelist',
          {
            label: 'Dummy Variable',
            fetchSubtypes: async (endpoint, publisher) => {
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
  }
}
```



Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
