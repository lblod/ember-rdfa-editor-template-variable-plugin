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
