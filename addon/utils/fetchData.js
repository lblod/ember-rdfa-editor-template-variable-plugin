function generateCodeListOptionsQuery(codelistUri) {
  const codeListOptionsQuery = `
    PREFIX lblodMobilitiet: <http://data.lblod.info/vocabularies/mobiliteit/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    SELECT DISTINCT * WHERE { 
      <${codelistUri}> a lblodMobilitiet:Codelist.
      ?codelistOptions skos:inScheme <${codelistUri}>.
      ?codelistOptions skos:prefLabel ?label.
    }
  `;
  return codeListOptionsQuery;
}

export default async function fetchCodeListOptions(endpoint, codelistUri) {
  const codelistsOptionsQueryResult = await executeQuery(
    endpoint,
    generateCodeListOptionsQuery(codelistUri)
  );
  const options = parseCodelistOptions(codelistsOptionsQueryResult);
  return options;
}

function parseCodelistOptions(queryResult) {
  const bindings = queryResult.results.bindings;
  return bindings.map((binding) => ({
    value: binding.codelistOptions.value,
    label: binding.label.value,
  }));
}

async function executeQuery(endpoint, query) {
  const encodedQuery = encodeURIComponent(query.trim());
  const response = await fetch(endpoint, {
    method: 'POST',
    mode: 'cors',
    headers: {
      Accept: 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: `query=${encodedQuery}`,
  });
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(
      `Request to MOW backend was unsuccessful: [${response.status}] ${response.statusText}`
    );
  }
}
