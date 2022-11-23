import * as d3 from 'd3';
import * as topojsonClient from 'topojson-client';

function createGraph(educationData, countyData) {
  console.log(educationData);
  console.log(countyData);

  const mapData = topojsonClient.feature(countyData, 'counties');
  console.log(mapData);

  const [minData, maxData] = d3.extent(educationData, d => d.bachelorsOrHigher);
  const numColors = 7;
  const getColor = getScaledColor(minData, maxData, numColors);

  const mergedData = mergeData(mapData.features, educationData);
  console.log(mergedData);

  const graphDim = {
    w: 800,
    h: 600,
    p: 50
  };

  const graph = d3.select('svg')
    .attr('width', graphDim.w)
    .attr('height', graphDim.h);
  
  let projection = d3.geoIdentity()
    .fitExtent([[0, 0], [graphDim.w, graphDim.h]], mapData);
  
  const geoGenerator = d3.geoPath()
    .projection(projection);

  graph.selectAll('path')
    .data(mergedData)
    .join('path')
    .attr('d', d => geoGenerator(d[0]))
    .attr('fill', d => {
      if (d[0].id == d[1].fips) {
        return 'green';
      } else {
        return 'red';
      }
    });
}

function mergeData(features, data) {
  const merged = [];
  
  for (let i = 0; i < data.length; i++) {
    merged.push([features[i], data[i]]);
  }

  return merged;
}

function getScaledColor(min, max, count) {
  const colors = d3.schemeBlues[count];
  const colorScale = d3.scaleQuantize()
    .domain([min, max])
    .range(colors);

  return function (x) {
    return colorScale(x);
  }
}

export default createGraph;