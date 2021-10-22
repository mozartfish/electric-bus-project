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

    // chart dimensions
    const width = 1000;
    let dimensions = {
      width: width,
      height: width * 0.4,
      margin: {
        top: 100,
        right: 50,
        bottom: 100,
        left: 50,
      },
    };
    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    console.log('bounded height', dimensions.boundedHeight);

    // draw canvas
    const wrapper = d3
      .select('#ei-histogram')
      .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const bounds = wrapper
      .append('g')
      .style(
        'transform',
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );

    // Create Scales
    // const xScale = d3
    //   .scaleLinear()
    //   .domain(d3.extent(this.data, xAccessor))
    //   .range([0, dimensions.boundedWidth])
    //   .nice();

    const xScale = d3
      .scaleBand()
      .domain(d3.extent(this.data, xAccessor))
      .range([0, dimensions.boundedWidth])
      .padding(0.4);

    const yScale = d3
      .scaleBand()
      .domain([0, d3.max(this.data, yAccessor)])
      .range([dimensions.boundedHeight, 0]);

    // draw data
    const barRects = wrapper
      .selectAll('rect')
      .data(this.data)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('class', 'bar-rect')
      .attr('height', 100)
      .attr('x', (d) => xScale(xAccessor(d)))
      .attr('y', (d) => yScale(yAccessor(d)))
      .attr('fill', 'cornflowerblue');
  }

  updateData(newData) {
    this.data = newData;
    this.drawHistogram();
  }
}
