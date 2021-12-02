'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    templateVariablePlugin: {
      endpoint: 'http://localhost:8890/sparql',
    },
  };
};
