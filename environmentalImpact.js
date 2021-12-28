// Author: Pranav Rajan
// This example was used as a starter point for this code : https://www.tomordonez.com/d3-creating-a-bar-chart/
class environmentalImpact {
  constructor(EIData) {
    this.data = EIData;
  }

  drawHistogram() {
    // accessor functions
    const xAccessor = (d) => +d.block_num;
    const yAccessor = (d) => +d.Ei;

    // margins
    const margins = {
      top: 10,
      right: 10,
      bottom: 100,
      left: 40,
    };

    const width = 3000 - margins.left - margins.right;
    const height = 900 - margins.top - margins.bottom;

    // remove all the rectangles and scale

    const svg = d3
      .select('#ei-histogram')
      .select('#ei-svg')
      .attr(
        'viewBox',
        `0 0 ${width + margins.left + margins.right} ${
          height + margins.top + margins.bottom
        }`
      );
    // .attr('width', width + margins.left + margins.right)
    // .attr('height', height + margins.top + margins.bottom);

    svg.select('#bars').remove();
    svg.select('#x-axis').remove();
    svg.select('#y-axis').remove();
    svg.select('#chart-title').remove();
     svg.select('#x-title').remove();

    const xScale = d3
      .scaleBand()
      .domain(this.data.map((d) => d.block_num))
      .range([0, width])
      .padding(0.2);

    svg
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(45, ${height + 15})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .style('font-size', '18px')
      .attr('transform', 'rotate(-45) translate(-10, -5)');

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, yAccessor)])
      .range([height, 0])
      .nice();
    svg
      .append('g')
      .attr('transform', `translate(45, 15)`)
      .attr('id', 'y-axis')
      .call(d3.axisLeft(yScale));

    svg
      .append('g')
      .attr('id', 'bars')
      .attr('transform', `translate(45, 0)`)
      .selectAll('rect')
      .data(this.data)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('class', 'bar-rect')
      .attr('height', (d) => height - yScale(d.Ei))
      .attr('x', (d) => xScale(d.block_num))
      .attr('y', (d) => yScale(d.Ei))
      .attr('fill', 'cornflowerblue');

    // add title
    svg
      .append('g')
      .attr('transform', `translate(1000, 45) scale(3.0, 3.0)`)
      .append('text')
      .attr('id', 'chart-title')
      .text('Environmental Impact Bar Chart');
    
    // add x-axis label 
      svg.append('g')
      .attr('transform', `translate(1500, 900) scale(3.0, 3.0)`)
      .append('text')
      .attr('id', 'x-title')
      .text('BUS ID');
  }

  updateData(newData) {
    this.data = newData;
    this.drawHistogram();
  }
}
