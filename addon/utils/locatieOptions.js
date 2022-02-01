export const LOCATIE_OPTIONS = [
  {
    label: 'Op het kruispunt van de ${placeholder} met de ${placeholder} geldt',
    value: `
        <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
          Op het kruispunt van de \${placeholder} met de \${placeholder} geldt
        </span>
      `,
  },
  {
    label: 'Op de  ${placeholder} ter hoogte van  ${placeholder} geldt',
    value: `
        <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
          Op de  \${placeholder} ter hoogte van  \${placeholder} geldt
        </span>
      `,
  },
  {
    label: 'Op de ${placeholder} tot {placeholder} geldt',
    value: `
        <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
          Op de \${placeholder} tot \${placeholder} geldt
        </span>
      `,
  },
  {
    label:
      'Op de ${placeholder} vanaf ${placeholder} in de richting van ${placeholder} geldt',
    value: `
        <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
          Op de \${placeholder} vanaf \${placeholder} in de richting van \${placeholder} geldt
        </span>
      `,
  },
  {
    label: 'Op alle wegen die uitkomen op ${placeholder} geldt',
    value: `
        <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
          Op alle wegen die uitkomen op \${placeholder} geldt
        </span>
      `,
  },
];

export const LOCATIE_OPTIONS_ZONAL = [
  {
    label:
      'In de zone ${naam_gebied} begrensd door ${bepaling_gebied} worden volgende maatregelen met zonale geldigheid ingesteld:',
    value: `
      <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
        In de zone \${naam_gebied} begrensd door \${bepaling_gebied} worden volgende maatregelen met zonale geldigheid ingesteld:
      </span>
    `,
  },
  {
    label:
      'In het gebied ${naam_gebied} begrensd door ${bepaling_gebied} geldt',
    value: `
      <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
        In het gebied \${naam_gebied} begrensd door \${bepaling_gebied} geldt
      </span>
    `,
  },
];
