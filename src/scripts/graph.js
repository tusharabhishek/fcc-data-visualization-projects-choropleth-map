import * as d3 from 'd3';
import * as topojsonClient from 'topojson-client';

export default function createGraph(educationData, countyData) {

  // arrange data in proper format
  // merge education data and county data with a simple zipping

  const geoData = topojsonClient.feature(countyData, 'counties');
  const mergedData = mergeData(educationData, geoData.features);

  // extract information required to calculate colors
  
  const colorCount = 8;
  const [minData, maxData] = d3.extent(educationData, d => d.bachelorsOrHigher);

  // generate colors
  // colorScheme: array of colors
  // thresholds: thresholds that divide the range of values between minData and
  //   maxData
  // getColor: function that takes a value and returns the corresponding color

  const { colorScheme, thresholds, colorer: getColor } =
    makeColorer(minData, maxData, colorCount);

  // graph dimensions
  
    const graphDim = {
    w: 800,
    h: 600
  };

  const graph = d3.select('svg')
    .attr('width', graphDim.w)
    .attr('height', graphDim.h);
  
  // generates paths corresponding to counties
  // uses a simple transform to fit the map in the graph
  
  const geoGenerator = d3.geoPath(
    d3.geoIdentity().fitExtent([[0, 0], [graphDim.w, graphDim.h]], geoData)
  );

  // selectors for tooltip and its contents
  
  const tooltip = d3.select('#tooltip');
  const infoArea = tooltip.select('#info-area');
  const infoState = tooltip.select('#info-state');
  const infoPercent = tooltip.select('#info-percent');
  
  graph.selectAll('path')
    .data(mergedData)
    .join('path')
    .classed('county', true)
    .attr('data-fips', d => d[0].fips)
    .attr('data-education', d => d[0].bachelorsOrHigher)
    .attr('d', d => geoGenerator(d[1]))
    .attr('fill', d => getColor(d[0].bachelorsOrHigher))
    .on('mouseover', (ev, d) => {
      const [x, y] = d3.pointer(ev, graph);

      infoArea.text(d[0].area_name);
      infoState.text(d[0].state);
      infoPercent.text(d[0].bachelorsOrHigher + '%');

      tooltip.attr('data-education', d[0].bachelorsOrHigher)
        .style('display', 'block')
        .style('left', x + 20 + 'px')
        .style('top', y + 20 + 'px');
    }).on('mouseleave', (ev, d) => {
      tooltip.style('display', 'none');
    });
  
  // drawing legend

  // legend dimensions
  
  const legendDim = {
    w: 400,
    h: 100,
    px: 25,
    py: 45
  }
  
  const legendGraph = graph.append('svg')
    .attr('id', 'legend')
    .attr('x', graphDim.w - legendDim.w)
    .attr('width', legendDim.w)
    .attr('height', legendDim.h);

  // creating color bars for legend
  
  const legendScale = d3.scaleLinear(
    [minData, maxData],
    [legendDim.px, legendDim.w - legendDim.px]
  );
  const axis = d3.axisBottom().scale(legendScale);
  axis.tickValues([minData, ...thresholds, maxData]);
  
  legendGraph.append('g')
    .attr('transform',`translate(0 ${legendDim.h - legendDim.py})`)
    .call(axis);
  
  // drawing the actual rectangles in the bar
  
  [maxData, ...d3.reverse(thresholds)].forEach((x, i) => {
    legendGraph.append('rect')
      .attr('x', legendScale(minData))
      .attr('y', legendDim.py)
      .attr('width', legendScale(x) - legendScale(minData))
      .attr('height',legendDim.h - 2 * legendDim.py)
      .attr('fill', colorScheme[colorCount - i - 1]);
  });
}

// merges the two data together

function mergeData(educationData, featureData) {
  const sortedEducationData = d3.sort(educationData, (a, b) => a.fips - b.fips);
  const sortedFeatureData = d3.sort(featureData, (a, b) => a.id - b.id);

  return d3.zip(sortedEducationData, sortedFeatureData);
}

// divides the given range [min, max] into a number of sub-ranges all colored
// differently
// returns the colorscheme used, thresholds calculated and a function that
// returns the color according to value given

function makeColorer(min, max, count) {
  const colors = d3.schemePurples[count];
  const colorScale = d3.scaleQuantize()
    .domain([min, max])
    .range(colors);
  
  return ({
    colorScheme: colors,
    thresholds: colorScale.thresholds(),
    colorer(x) {
      return colorScale(x);
    }
  });
  
}