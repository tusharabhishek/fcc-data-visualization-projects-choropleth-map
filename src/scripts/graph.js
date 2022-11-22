import * as d3 from 'd3';
import * as topojsonClient from 'topojson-client';

function createGraph(educationData, countyData) {
  console.log(educationData);
  console.log(countyData);

  const mapData = topojsonClient.feature(countyData, 'counties');
  console.log(mapData);

  const graphDim = {
    w: 800,
    h: 600,
    p: 50
  };

  const graph = d3.select('svg')
    .attr('width', graphDim.w)
    .attr('height', graphDim.h);
  
  const geoGenerator = d3.geoPath();

  graph.selectAll('path')
    .data(mapData.features)
    .join('path')
    .attr('d', geoGenerator)
    .attr('fill', d => randomColor());
}

function randomColor() {
  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }
  return `rgb(${randomInt(256)}, ${randomInt(256)}, ${randomInt(256)})`;
}

export default createGraph;