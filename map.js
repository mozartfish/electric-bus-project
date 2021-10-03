class busMap {
  constructor(geoShapeData, geoPolylineData, geoPointData) {
    this.geoShapeData = geoShapeData;
    this.geoPolylineData = geoPolylineData;
    this.geoPointData = geoPointData;
  }

  drawMap() {
    console.log('geoshape', this.geoShapeData);
    console.log('geopolyline', this.geoPolylineData);
    console.log('geopoint', this.geoPointData);

    const map = L.map('map').setView([40.758701, -111.876183], 8);
    const openStreetMapLink =
      '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    const osmLayer = L.tileLayer(
      'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; ' + openStreetMapLink + ' Contributors',
        maxZoom: 18,
      }
    ).addTo(map);

    // Add 3 SVG elements to Leaflet Overlay Pane for routes (ie stops, routes, TAZ)
    const TazSVG = d3
      .select(map.getPanes().overlayPane)
      .append('svg')
      .attr('id', 'TazSVG');
    // let baseMapGroup = baseMapLayer
    //   .append('g')
    //   .attr('class', 'leaflet-zoom-hide')
    //   .attr('id', 'baseMapGroup');


    const TazGroup = TazSVG.append('g').attr('class', 'TazClass').attr('id', 'TazId');

    /*
    let busRouteLayer = d3
      .select(map.getPanes().overlayPane)
      .append('svg')
      .attr('id', 'busRouteLayerSVG');
    let busRouteGroup = busRouteLayer
      .append('g')
      .attr('class', 'leaflet-zoom-hide')
      .attr('id', 'busRouteGroup');

    let busStopLayer = d3
      .select(map.getPanes().overlayPane)
      .append('svg')
      .attr('id', 'busStopLayerSVG');


  */




    // project the point onto openstreetmap
    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }
    // let projectPoint = (x, y) => {
    //   let point = map.latLngToLayerPoint(new L.LatLng(y, x));
    //   this.stream.point(point.x, point.y);
    // };

    const projection = d3.geoTransform({ point: projectPoint });
  // create a d3.geoPath to convert GeoJSON to SVG
    const path = d3.geoPath().projection(projection);
  // console.log('the path', path);


    // // create a d3.geoPath to convert GeoJSON to SVG
    // const geoPath = d3.geoPath().projection(projection);
    console.log("features",this.geoShapeData.features);
    // draw stuff on the map
    const TazFeatures = TazGroup
      .selectAll('path')
      .data(this.geoShapeData.features)
      .enter()
      .append('path');
    //   .attr('stroke', 'black')
    //   .attr('fill-opacity', 0.3);
    // mapFeatures
    //   .attr('fill-opacity', 0.3)
    //   .attr('stroke', 'black')
    //   .attr('z-index', 3000)
    //   .attr('stroke-width', 1);
    console.log("TAZFeatures", TazFeatures)

    // let bounds = path.bounds(this.geoShapeData)
    // console.log("bounds",bounds)

    //fit the SVG element to leaflet's map layer
    

    // function reset() {
    //   bounds = path.bounds(this.geoShapeData);
  
    //   var topLeft = bounds[0],
    //     bottomRight = bounds[1];
  
    //   svg
    //     .attr('width', bottomRight[0] - topLeft[0])
    //     .attr('height', bottomRight[1] - topLeft[1])
    //     .style('left', topLeft[0] + 'px')
    //     .style('top', topLeft[1] + 'px');
  
    //   g.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');
  
    //   // initialize the path data
    //   d3_features
    //     .attr('d', path)
    //     .attr('fill-opacity', 0.3)
    //     .attr('stroke', 'black')
    //     .attr('z-index', 3000)
    //     .attr('stroke-width', 1);
    // }
    
    const reset = () =>{

      var bounds = path.bounds(this.geoShapeData);
      console.log("bounds", bounds)
  
      var topLeft = bounds[0],
        bottomRight = bounds[1];
  
      TazSVG
        .attr('width', bottomRight[0] - topLeft[0])
        .attr('height', bottomRight[1] - topLeft[1])
        .style('left', topLeft[0] + 'px')
        .style('top', topLeft[1] + 'px');
  
      TazGroup.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');
  
      // initialize the path data
      TazFeatures
        .attr('d', path)
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'black')
        .attr('z-index', 3000)
        .attr('stroke-width', 1);
    
    }

    
    map.on('viewreset', reset);

    reset();
    


    // var reset = () =>{
    //   var bounds = path.bounds(this.geoShapeData);
  
    //   var topLeft = bounds[0],
    //     bottomRight = bounds[1];
  
    //   TazSVG
    //     .attr('width', bottomRight[0] - topLeft[0])
    //     .attr('height', bottomRight[1] - topLeft[1])
    //     .style('left', topLeft[0] + 'px')
    //     .style('top', topLeft[1] + 'px');
  
    //   TazGroup.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');
  
    //   // initialize the path data
    //   TazFeatures
    //     .attr('d', path)
    //     .attr('fill-opacity', 0.3)
    //     .attr('stroke', 'black')
    //     .attr('z-index', 3000)
    //     .attr('stroke-width', 1);
    // }  

   
  }
}
// // update the map reset
// map.on('viewreset', this.startView(map));
// this.startView(map);
// function reset() {
//   bounds = path.bounds(geoShape);

//   var topLeft = bounds[0],
//     bottomRight = bounds[1];

//   svg
//     .attr('width', bottomRight[0] - topLeft[0])
//     .attr('height', bottomRight[1] - topLeft[1])
//     .style('left', topLeft[0] + 'px')
//     .style('top', topLeft[1] + 'px');

//   g.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

//   // initialize the path data
//   d3_features
//     .attr('d', path)
//     .attr('fill-opacity', 0.3)
//     .attr('stroke', 'black')
//     .attr('z-index', 3000)
//     .attr('stroke-width', 1);
// }
//   }

//   startView(map) {
//     const projection = d3.geoTransform({ point: projectPoint });

//     const bounds = geoPath.bounds(this.geoShapeData);

//     const topLeft = bounds[0],
//       bottomRight = bounds[1];

//     const baseMapSVG = d3.select('#baseMapSVG');
//     const baseMapGroup = d3.select('#baseMapGroup');

//     baseMapSVG
//       .attr('width', bottomRight[0] - topLeft[0])
//       .attr('height', bottomRight[1] - topLeft[1])
//       .style('left', topLeft[0] + 'px')
//       .style('top', topLeft[1] + 'px');

//     baseMapGroup.attr(
//       'transform',
//       'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')'
//     );

//     // initialize the path data
//     const mapFeatures = baseMapGroup
//       .selectAll('path')
//       .data(this.geoShapeData.features)
//       .enter()
//       .append('path');

//     mapFeatures
//       .attr('d', path)
//       .attr('fill-opacity', 0.3)
//       .attr('stroke', 'black')
//       .attr('z-index', 3000)
//       .attr('stroke-width', 1);
//   }
