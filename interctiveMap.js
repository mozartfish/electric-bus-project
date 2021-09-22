//the following is how you create an interactive openstreetmap using leaflet
var map = L.map('map').setView([40.758701, -111.876183], 8);
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; ' + mapLink + ' Contributors',
  maxZoom: 18,
}).addTo(map);

//the following is the TAZ layer
// Add an SVG element to Leaflet’s overlay pane
var svg = d3.select(map.getPanes().overlayPane).append('svg'),
  g = svg.append('g').attr('class', 'leaflet-zoom-hide');

d3.json('TAZproject.json', function (geoShape) {
  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  //  create a d3.geo.path to convert GeoJSON to SVG
  var transform = d3.geo.transform({ point: projectPoint }),
    path = d3.geo.path().projection(transform);

  // create path elements for each of the features
  d3_features = g
    .selectAll('path')
    .data(geoShape.features)
    .enter()
    .append('path');

  //Fired when the map needs to redraw its content (this usually happens on map zoom or load).
  map.on('viewreset', reset);

  reset();

  // fit the SVG element to leaflet's map layer
  function reset() {
    bounds = path.bounds(geoShape);
    //console.log(bounds)

    var topLeft = bounds[0],
      bottomRight = bounds[1];

    //console.log(bottomRight[1] - topLeft[1])

    svg
      .attr('width', bottomRight[0] - topLeft[0])
      .attr('height', bottomRight[1] - topLeft[1])
      .style('left', topLeft[0] + 'px')
      .style('top', topLeft[1] + 'px');

    g.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

    // initialize the path data
    d3_features
      .attr('d', path)
      //.style("fill-opacity", 0.7)
      //.attr('fill','none')
      //.attr("stroke", "red")
      //.attr("stroke-width", 0.5)

      .attr('fill-opacity', 0.3)
      .attr('stroke', 'black')
      .attr('z-index', 3000)
      .attr('stroke-width', 1);
  }
});

// the following is the bus routes layer
var svg1 = d3.select(map.getPanes().overlayPane).append('svg'),
  g1 = svg1.append('g').attr('class', 'leaflet-zoom-hide');

d3.json('BusRoutesProject.json', function (geoPolyline) {
  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  //  create a d3.geo.path to convert GeoJSON to SVG
  var transform = d3.geo.transform({ point: projectPoint }),
    path = d3.geo.path().projection(transform);

  // create path elements for each of the features
  d3_features1 = g1
    .selectAll('path')
    .data(geoPolyline.features)
    .enter()
    .append('path');

  //Fired when the map needs to redraw its content (this usually happens on map zoom or load).
  map.on('viewreset', reset);

  reset();

  // fit the SVG element to leaflet's map layer
  function reset() {
    bounds = path.bounds(geoPolyline);
    //console.log(bounds)

    var topLeft = bounds[0],
      bottomRight = bounds[1];

    //console.log(bottomRight[1] - topLeft[1])

    svg1
      .attr('width', bottomRight[0] - topLeft[0])
      .attr('height', bottomRight[1] - topLeft[1])
      .style('left', topLeft[0] + 'px')
      .style('top', topLeft[1] + 'px');

    g1.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

    // initialize the path data
    d3_features1
      .attr('d', path)
      .style('fill-opacity', 0.7)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', 1);
  }
});

// the following is the bus stop layer
var svg2 = d3.select(map.getPanes().overlayPane).append('svg');

d3.json('BusStopsProject.json', function (geoPoint) {
  // create path elements for each of the features
  d3_features2 = svg2
    .selectAll('circle')
    .attr('class', 'Dots')
    .data(geoPoint.features)
    .enter()
    .append('circle')
    .attr(
      'cx',
      (d) =>
        map.latLngToLayerPoint([
          d.geometry.coordinates[1],
          d.geometry.coordinates[0],
        ]).x
    )
    .attr(
      'cy',
      (d) =>
        map.latLngToLayerPoint([
          d.geometry.coordinates[1],
          d.geometry.coordinates[0],
        ]).y
    )
    .attr('r', 4)
    .style('fill', 'steelblue');
  //.attr("stroke", "red")
  //.attr("stroke-width", 3)
  //.attr("fill-opacity", .4)
  console.log(d3_features2);

  function update() {
    d3.selectAll('circle')
      .attr(
        'cx',
        (d) =>
          map.latLngToLayerPoint([
            d.geometry.coordinates[1],
            d.geometry.coordinates[0],
          ]).x
      )
      .attr(
        'cy',
        (d) =>
          map.latLngToLayerPoint([
            d.geometry.coordinates[1],
            d.geometry.coordinates[0],
          ]).y
      )
      .attr('r', 4)
      .style('fill', 'steelblue');
  }

  // If the user change the map (zoom or drag), I update circle position:
  map.on('viewreset', update);
});
