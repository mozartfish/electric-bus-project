class lineChart {
  constructor(data, busID) {
    this.data = data;
    this.busID = busID;
    this.plan = null;
  }

  drawLineChart() {
    const bebdistances = this.data['BEB Distances'];

    // convert array to object entries
    const distEntries = Object.entries(bebdistances);

    // find the bus object
    const bebDist = distEntries.find((distance) => distance[0] === this.busID);
    console.log('beb dist', bebDist);

    const busDistances = bebDist[1];

    // calculate the percentages for the bus
    const percentUsed = busDistances.map((d) => d / 62.78);

    const newData = percentUsed.map((d, i) => {
      const busObj = {
        stop: i,
        percent: d,
      };

      return busObj;
    });

    // create accessor functions
    const yAccessor = (d) => d.percent;
    const xAccessor = (d) => d.stop;

    // create chart dimensions
    let dimensions = {
      width: 500,
      height: 600,
      margin: {
        top: 15,
        right: 15,
        bottom: 40,
        left: 60,
      },
    };

    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    // update svg
    const svg = d3
      .select('#electric-svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    // remove all the old line info
    d3.select('#x-axis').remove();
    d3.select('#y-axis').remove();
    d3.select('#electric-line').remove();
    d3.select('#chart-title').remove();
    d3.select('#x-title').remove();
    d3.select('#y-title').remove();

    const bounds = svg
      .append('g')
      .style(
        'transform',
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );

    // create scales
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(newData, yAccessor))
      .range([dimensions.boundedHeight, 0])
      .nice();

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(newData, xAccessor))
      .range([0, dimensions.boundedWidth])
      .nice();

    // make a line
    const lineGenerator = d3
      .line()
      .x((d) => xScale(xAccessor(d)))
      .y((d) => yScale(yAccessor(d)));

    const line = bounds
      .append('path')
      .attr('d', lineGenerator(newData))
      .attr('fill', 'none')
      .attr('stroke', '#ff4f00')
      .attr('stroke-width', 2)
      .attr('id', 'electric-line');

    // make y axis
    const yAxisGenerator = d3.axisLeft().scale(yScale);

    const yAxis = bounds.append('g').attr('id', 'y-axis').call(yAxisGenerator);

    // make x axis
    const xAxisGenerator = d3.axisBottom().scale(xScale);

    // update the x-axis bounds
    const xAxis = bounds
      .append('g')
      .attr('id', 'x-axis')
      .call(xAxisGenerator)
      .style('transform', `translateY(${dimensions.boundedHeight}px)`);

    // add titles
    const chartTitle = bounds
      .append('g')
      .attr('transform', `translate(100, 20)`)
      .attr('id', 'chart-title')
      .append('text')
      .text('Percentage of Electric Charge Used');

    const xAxisTitle = bounds
      .append('g')
      .attr('transform', `translate(100, 580)`)
      .attr('id', 'x-title')
      .append('text')
      .text('Stop Number');

    const yAxisTitle = bounds
      .append('g')
      .attr('transform', `translate(-35, 300), rotate(-90)`)
      .attr('id', 'y-title')
      .append('text')
      .text('Percentage Charged');
  }

  updateLineChart(busID, planValue, data) {
    this.busID = busID;
    this.plan = planValue;
    this.data = data;
    this.drawLineChart();
  }
}
