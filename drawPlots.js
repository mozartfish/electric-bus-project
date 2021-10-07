class plotting{
    constructor(electricStatData, p60Data) {
        this.electricStatData = electricStatData;
        this.p60Data = p60Data;
      }

      drawPlots() {

        // slice the first 5 records for now (before adding the interaction)
        const dataset= this.electricStatData.slice(0,5)
        //console.log("slice dataset",dataset)
        const dataset1= this.p60Data['Bus Distance']['1000']
        //console.log("p60", [...Array(dataset1.length).keys()])

        const width = 300;
        
        // const margin = {top: 20, right: 20, bottom: 100, left: 100};
        // const graphWidth = width - margin.left - margin.right;
        // const graphHeight = height - margin.top - margin.bottom;


        let dimensions = {
        
        width: width,
        height: width * 0.6,
        // Leave a larger margin on the top to account for the bar labels which will be positioned above each bar
        margin: {
            top: 30,
            right: 10,
            bottom: 50,
            left: 50,
        },
        }

    // Our wrapper encompasses the whole chart; we need to subtract our margins to determine our bounds
    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom
  
    

// draw the enviroment equity histogram (eq)
      const eqXAccessor = d => d['Ei']
      const eqYAccessor = d => d["block_num"]
      //console.log("accessor",eqXAccessor(dataset[0]))


        const eqSvg = d3
            .select('#data-charts')
            .append('svg')
            .attr('width', dimensions.width)
            .attr('height', dimensions.height)
            .attr('id', 'eqHistogram');


        const eqGraph = eqSvg.append('g')
            .attr('width', dimensions.width)
            .attr('height', dimensions.height)
            .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`);
            
        const eqgXAxis = eqGraph.append('g')
            .style('transform', `translateY(${dimensions.boundedHeight}px)`)
        
        const eqgYAxis = eqGraph.append('g')


        const eqYScale = d3
            .scaleLinear()
            //.domain([0, d3.max(dataset, d => d['Ei'])]) 
            .domain([0, d3.max(dataset, eqXAccessor)])
            .range([dimensions.boundedHeight, 0])
            // .nice()

        const eqXScale = d3.scaleBand()
            .domain(dataset.map(eqYAccessor))
            .range([0, dimensions.boundedWidth])
            .paddingInner(0.2)
            .paddingOuter(0.2);


           
        const eqRects = eqGraph.selectAll('rect')
            .data(dataset)
            .enter()
            .append("rect")
            .attr('width', eqXScale.bandwidth)
            .attr('class', 'bar-rect')
            .attr('height', d => dimensions.boundedHeight - eqYScale(eqXAccessor(d)))
            .attr('x', d => eqXScale(eqYAccessor(d)))
            .attr('y', d => eqYScale(eqXAccessor(d)))
            .attr('fill', 'cornflowerblue')

        const eqXAxis = d3.axisBottom(eqXScale);
        const eqYAxis = d3.axisLeft(eqYScale)
                        .ticks(5)
        eqgXAxis.call(eqXAxis);
        eqgYAxis.call(eqYAxis);

        eqgXAxis
        .selectAll('text')
        .style('font-size', 10)
        // .append("text")
        // .text(yAccessor)
        
        eqgYAxis.selectAll('text')
            .style('font-size', 10);
        

        const eqXAxisLabel = eqgXAxis
            .append('text')
            .attr('x', dimensions.boundedWidth / 2)
            .attr('y', dimensions.margin.bottom - 10)
            .attr('fill', 'black')
            .style('font-size', '1.4em')
            .text("Bus Number")
            .style("text-transform", "capitalize")

        const eqYAxisLabel = eqgYAxis.append("text")
            // Draw this in the middle of the y axis and just inside the left side of the chart wrapper
            .attr("x", -dimensions.boundedHeight / 2)
            .attr("y", -dimensions.margin.left + 10)
            .attr("fill", "black")
            .style("font-size", "1.4em")
            .text("Environmental Equity")
            // Rotate the label to find next to the y axis
            .style("transform", "rotate(-90deg)")
            // Rotate the label around its center
            .style("text-anchor", "middle")
   
    
  






    // draw line chart for the mileage

    const mileXAccessor = d => dataset1.indexOf(d)//[...Array(d.length).keys()]
    const mileYAccessor = d => d
    //console.log("mile",mileYAccessor(dataset1[1]))

    const mileSvg = d3
        .select('#data-charts')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
        .attr('id', 'mileLineChart');


  const mileBounds = mileSvg.append("g") 
    .style("transform", `translate(${
      dimensions.margin.left
    }px, ${
      dimensions.margin.top
    }px)`)

  // Create scales
  const mileYScale = d3.scaleLinear()
    .domain(d3.extent(dataset1, mileYAccessor))  // d3.extent returns an array with the min and max value
    .range([dimensions.boundedHeight, 0])   // range refers to the highest and lowest numbers to display

 
  const mileXScale = d3.scaleLinear()
    .domain([0, dataset1.length])  
    .range([0, dimensions.boundedWidth])

 
  const mileLineGenerator = d3.line() // Creates a generator that converts data points into a d string
    // Transform our data point with the appropriate accessor and the scale to get the scaled value in pixel space
    .x(d => mileXScale(mileXAccessor(d)))
    .y(d => mileYScale(mileYAccessor(d)))

  const mileLine = mileBounds.append("path")
    // Feed our dataset to our line generator function
    .attr("d", mileLineGenerator(dataset1))
    // SVG elements default to a black fill and no stroke; which gives us a filled in shape unless we add styling
    .attr("fill", "none")
    .attr("stroke", "#af9358")
    .attr("stroke-width", 2)

  // Draw y axis tick marks and labels
  const mileYAxisGenerator = d3.axisLeft()  // We want labels of the y-axis to be to the left of the axis line
    .scale(mileYScale)
  // Our axis generator will create lots of element; create a g element to contain them and keep our DOM organized
  const mileYAxis = mileBounds.call(mileYAxisGenerator)

  // Draw x axis tick marks and labels
  const mileXAxisGenerator = d3.axisBottom()  // We want our labels of the x-axis to appear under the axis line
    .scale(mileXScale)
  const mileXAxis = mileBounds.append("g")
    .call(mileXAxisGenerator)
         .style("transform", `translateY(${
        dimensions.boundedHeight
      }px)`)



  const mileXAxisLabel = mileXAxis
      .append('text')
      .attr('x', dimensions.boundedWidth / 2)
      .attr('y', dimensions.margin.bottom - 10)
      .attr('fill', 'black')
      .style('font-size', '1.4em')
      .text("Stop Number")
      .style("text-transform", "capitalize")

  const mileYAxisLabel = mileYAxis.append("text")
      // Draw this in the middle of the y axis and just inside the left side of the chart wrapper
      .attr("x", -dimensions.boundedHeight / 2)
      .attr("y", -dimensions.margin.left + 10)
      .attr("fill", "black")
      .style("font-size", "1.4em")
      .text("Mileage Before Recharge")
      // Rotate the label to find next to the y axis
      .style("transform", "rotate(-90deg)")
      // Rotate the label around its center
      .style("text-anchor", "middle")
  
      }
}