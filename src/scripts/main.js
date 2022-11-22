import createGraph from "./graph";

const dataSrc = {
  education: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
  county: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
};

Promise.all([fetch(dataSrc.education), fetch(dataSrc.county)])
  .then(responses => Promise.all(responses.map(res => res.json())))
  .then(jsons => createGraph(...jsons));