import TemplateVariablePlugin from '../template-variable-plugin';

function pluginFactory(plugin) {
  return {
    create: (initializers) => {
      const pluginInstance = new plugin();
      Object.assign(pluginInstance, initializers);
      console.log(pluginInstance)
      return pluginInstance;
    },
  };
}

export function initialize(application) {
  console.log('calling initialize')
  application.register(
    'plugin:template-variable',
    pluginFactory(TemplateVariablePlugin),
    { singleton: false }
  );
}

export default {
  initialize,
};
