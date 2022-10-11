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

When using the insert-variable-plugin, you can also filter the codelists by publisher. You can pass the publisher uuid when initializing the plugin, e.g.:

```javascript
{
  name:'insert-variable',
  options: {
    publisher: 'cec59e5e872a9084e93becf3026bfcc2f25926ea76372711b7a745875f3b7949'
  }
}
```



Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
