class busMap {
  constructor(geoShapeData, geoPolylineData, geoPointData) {
    this.geoShapeData = geoShapeData;
    this.geoPolylineData = geoPolylineData;
    this.geoPointData = geoPointData;
  }



  drawMap() {
    // console.log('geoshape', this.geoShapeData);
    // console.log('geopolyline', this.geoPolylineData);
    // console.log('geopoint', this.geoPointData);

    
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
    const tazSVG = d3
      .select(map.getPanes().overlayPane)
      .append('svg')
      .attr('id', 'tazSVG');


    const routeSVG = d3
      .select(map.getPanes().overlayPane)
      .append('svg')
      .attr('id', 'routeSVG');


    const tazGroup = tazSVG.append('g').attr('class', 'tazClass').attr('id', 'tazId');
    const routeGroup = routeSVG.append("g").attr('class', 'routeClass').attr('id', 'routeId');
    

  




    // project the point onto openstreetmap
    function projectPoint(x, y) {
      const point = map.latLngToLayerPoint(new L.LatLng(y, x));
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
    // console.log("features",this.geoShapeData.features);
    // draw stuff on the map
    const tazFeatures = tazGroup
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
    //console.log("tazFeatures", tazFeatures)

  const routeFeatures = routeGroup
    .selectAll('path')
    .data(this.geoPolylineData.features)
    .enter()
    .append('path');

    const reset = () =>{

      const bounds = path.bounds(this.geoShapeData);

      // console.log("bounds", bounds)
  
      const topLeft = bounds[0],
        bottomRight = bounds[1];

      tazSVG
        .attr('width', bottomRight[0] - topLeft[0])
        .attr('height', bottomRight[1] - topLeft[1])
        .style('left', topLeft[0] + 'px')
        .style('top', topLeft[1] + 'px');
  
      tazGroup.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');
  
      // initialize the path data
      tazFeatures
        .attr('d', path)
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'black')
        .attr('z-index', 3000)
        .attr('stroke-width', 1);
    
    }

    
    // map.on('viewreset', reset);
    map.on('zoomend', reset);
    reset();





    const reset1 = () =>{

      const bounds1 = path.bounds(this.geoPolylineData);

      // console.log("bounds1", bounds1)
  
      const topLeft1 = bounds1[0],
        bottomRight1 = bounds1[1];

  
      routeSVG
        .attr('width', bottomRight1[0] - topLeft1[0])
        .attr('height', bottomRight1[1] - topLeft1[1])
        .style('left', topLeft1[0] + 'px')
        .style('top', topLeft1[1] + 'px');
  
      routeGroup.attr('transform', 'translate(' + -topLeft1[0] + ',' + -topLeft1[1] + ')');
  
      // initialize the path data
      routeFeatures
      .attr('d', path)
      .style('fill-opacity', 0.7)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', 1);
    
    }

    
    // map.on('viewreset', reset);
    map.on('zoomend', reset1);
    reset1();
    

 
   
  }
}
