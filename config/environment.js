'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    templateVariablePlugin: {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql',
    },
  };
};
