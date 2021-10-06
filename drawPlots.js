class plotting{
    constructor(electricStatData, p60Data) {
        this.electricStatData = electricStatData;
        this.p60Data = p60Data;
      }

      drawPlots() {

        // slice the first 5 records for now (before adding the interaction)
        const dataset= this.electricStatData.slice(0,5)
        //console.log("slice dataset",dataset)
        const dataset1= this.p60Data
        console.log("p60", dataset1)

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
  
    
      const metricAccessor = d => d['Ei']
      const yAccessor = d => d["block_num"]


        


    // draw histogram (environmental equity)
        const svg = d3
            .select('#data-charts')
            .append('svg')
            .attr('width', dimensions.width)
            .attr('height', dimensions.height);


        const graph = svg.append('g')
            .attr('width', dimensions.width)
            .attr('height', dimensions.height)
            .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`);
            
        const gXAxis = graph.append('g')
            .style('transform', `translateY(${dimensions.boundedHeight}px)`)
        
        const gYAxis = graph.append('g')


        const yScale = d3
            .scaleLinear()
            //.domain([0, d3.max(dataset, d => d['Ei'])]) 
            .domain([0, d3.max(dataset, metricAccessor)])
            .range([dimensions.boundedHeight, 0])
            // .nice()

        const xScale = d3.scaleBand()
            .domain(dataset.map(yAccessor))
            .range([0, dimensions.boundedWidth])
            .paddingInner(0.2)
            .paddingOuter(0.2);


           
        const rects = graph.selectAll('rect')
            .data(dataset)
            .enter()
            .append("rect")
            .attr('width', xScale.bandwidth)
            .attr('class', 'bar-rect')
            .attr('height', d => dimensions.boundedHeight - yScale(metricAccessor(d)))
            .attr('x', d => xScale(yAccessor(d)))
            .attr('y', d => yScale(metricAccessor(d)))
            .attr('fill', 'cornflowerblue')

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale)
                        .ticks(5)
        gXAxis.call(xAxis);
        gYAxis.call(yAxis);

        gXAxis
        .selectAll('text')
        .style('font-size', 10)
        // .append("text")
        // .text(yAccessor)
        
        gYAxis.selectAll('text')
            .style('font-size', 10);
        

        const xAxisLabel = gXAxis
            .append('text')
            .attr('x', dimensions.boundedWidth / 2)
            .attr('y', dimensions.margin.bottom - 10)
            .attr('fill', 'black')
            .style('font-size', '1.4em')
            // Use the supplied metric for our text; however in most cases you'd perform a lookup in a proper map
            .text("Bus number")
            .style("text-transform", "capitalize")

        const yAxisLabel = gYAxis.append("text")
            // Draw this in the middle of the y axis and just inside the left side of the chart wrapper
            .attr("x", -dimensions.boundedHeight / 2)
            .attr("y", -dimensions.margin.left + 10)
            .attr("fill", "black")
            .style("font-size", "1.4em")
            .text("Environmental equity")
            // Rotate the label to find next to the y axis
            .style("transform", "rotate(-90deg)")
            // Rotate the label around its center
            .style("text-anchor", "middle")
   
    
  






//     // draw line chart
//     const wrapper = d3.select("#wrapper")
//     .append("svg")
//       .attr("width", dimensions.width)
//       .attr("height", dimensions.height)

//   // We can draw our chart inside of a "g" element and shift it all at once using the CSS transform property
//   const bounds = wrapper.append("g")  // Think of "g" as the "div" equivalent within an SVG element
//     .style("transform", `translate(${
//       dimensions.margin.left
//     }px, ${
//       dimensions.margin.top
//     }px)`)

//   // Create our scales
//   const yScale = d3.scaleLinear()
//     .domain(d3.extent(dataset, yAccessor))  // d3.extent returns an array with the min and max value
//     .range([dimensions.boundedHeight, 0])   // range refers to the highest and lowest numbers to display

//   // Let's visualize the threshold by adding a rectangle to cover all temperatures below freezing
//   const freezingTemperaturePlacement = yScale(32) // 32 degrees Fahrenheit
//   const freezingTemperatures = bounds.append("rect")
//     .attr("x", 0)
//     .attr("width", dimensions.boundedWidth)
//     .attr("y", freezingTemperaturePlacement)
//     .attr("height", dimensions.boundedHeight - freezingTemperaturePlacement)
//     .attr("fill", "#e0f3f3")  // Make the rectangle frosty to indicate freezing

//   const xScale = d3.scaleTime()
//     .domain(d3.extent(dataset, xAccessor))  // Use a time scale since we are working with date objects
//     .range([0, dimensions.boundedWidth])

//   /*
//     “The d attribute will take a few commands that can be capitalized (if giving an absolute value) or lowercased (if giving a relative value):

//     M will move to a point (followed by x and y values)
//     L will draw a line to a point (followed by x and y values)
//     Z will draw a line back to the first point”

//     Excerpt From: Nate Murray. “Fullstack Data Visualization with D3.” Apple Books.

//     bounds.append("path").attr("d", "M 0 0 L 100 0 L 100 100 L 0 50 Z")

//   */
//   const lineGenerator = d3.line() // Creates a generator that converts data points into a d string
//     // Transform our data point with the appropriate accessor and the scale to get the scaled value in pixel space
//     .x(d => xScale(xAccessor(d)))
//     .y(d => yScale(yAccessor(d)))

//   const line = bounds.append("path")
//     // Feed our dataset to our line generator function
//     .attr("d", lineGenerator(dataset))
//     // SVG elements default to a black fill and no stroke; which gives us a filled in shape unless we add styling
//     .attr("fill", "none")
//     .attr("stroke", "#af9358")
//     .attr("stroke-width", 2)

//   // Additional things to draw (tick marks, labels, legends, etc)

//   // Draw y axis tick marks and labels
//   const yAxisGenerator = d3.axisLeft()  // We want labels of the y-axis to be to the left of the axis line
//     .scale(yScale)
//   // Our axis generator will create lots of element; create a g element to contain them and keep our DOM organized
//   const yAxis = bounds.call(yAxisGenerator)

//   // Draw x axis tick marks and labels
//   const xAxisGenerator = d3.axisBottom()  // We want our labels of the x-axis to appear under the axis line
//     .scale(xScale)
//   const xAxis = bounds.append("g")
//     .call(xAxisGenerator)
//     // If you stop here, the xAxisGenerator knows how to display tick marks and labels relative to the axis line, but we need to move it to the bottom with a CSS transform
//       .style("transform", `translateY(${
//         dimensions.boundedHeight
//       }px)`)

  
      }
}