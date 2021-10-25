class environmentalImpact {
  constructor(EIData) {
    this.data = EIData;
  }

  drawHistogram() {
    console.log('histogram data');
    console.log(this.data);

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

    const width = 6000 - margins.left - margins.right;
    const height = 700 - margins.top - margins.bottom;

    // remove all the rectangles and scale

    const svg = d3
      .select('#ei-histogram')
      .select('#ei-svg')
      .attr('width', width + margins.left + margins.right)
      .attr('height', height + margins.top + margins.bottom);

    svg.select('#bars').remove();
    svg.select('#x-axis').remove();
    svg.select('#y-axis').remove();

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

    //   .select('#ei-histogram')
    //   .select('#ei-svg')

    // // chart dimensions
    // const width = 800;
    // let dimensions = {
    //   width: width,
    //   height: width * 1.5,
    //   margin: {
    //     top: 200,
    //     right: 50,
    //     bottom: 50,
    //     left: 50,
    //   },
    // };
    // dimensions.boundedWidth =
    //   dimensions.width - dimensions.margin.left - dimensions.margin.right;
    // dimensions.boundedHeight =
    //   dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    // console.log('bounded height', dimensions.boundedHeight);

    // // draw canvas
    // const wrapper = d3
    //   .select('#ei-histogram')
    //   .select('#ei-svg')
    //   .attr('width', dimensions.width)
    //   .attr('height', dimensions.height);

    // const bounds = wrapper
    //   .append('g')
    //   .style(
    //     'transform',
    //     `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    //   );

    // // Create Scales
    // // const xScale = d3
    // //   .scaleLinear()
    // //   .domain(d3.extent(this.data, xAccessor))
    // //   .range([0, dimensions.boundedWidth])
    // //   .nice();

    // const xScale = d3
    //   .scaleBand()
    //   .domain(d3.extent(this.data, xAccessor))
    //   .range([0, dimensions.boundedWidth])
    //   .padding(0.4);

    // const yScale = d3
    //   .scaleBand()
    //   .domain([0, d3.max(this.data, yAccessor)])
    //   .range([dimensions.boundedHeight, 0]);

    // // // draw data
    // const barRects = wrapper
    //   .selectAll('rect')
    //   .data(this.data)
    //   .join('rect')
    //   .attr('width', xScale.bandwidth())
    //   .attr('class', 'bar-rect')
    //   .attr('height', 100)
    //   .attr('x', (d) => xScale(xAccessor(d)))
    //   .attr('y', (d) => yScale(yAccessor(d)))
    //   .attr('fill', 'cornflowerblue');
  }

  updateData(newData) {
    this.data = newData;
    this.drawHistogram();
  }
}
