//the following is how you create an interactive openstreetmap using leaflet
var map = L.map('map').setView([40.758701, -111.876183], 8);
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; ' + mapLink + ' Contributors',
  maxZoom: 18,
}).addTo(map);

// Add 3 SVG element to Leaflet’s overlay pane (i.e., stops, routes, TAZs)
var svg = d3.select(map.getPanes().overlayPane).append('svg'),
  g = svg.append('g').attr('class', 'leaflet-zoom-hide').attr('id', 'hello');

var svg1 = d3.select(map.getPanes().overlayPane).append('svg'),
  g1 = svg1.append('g').attr('class', 'leaflet-zoom-hide');

var svg2 = d3.select(map.getPanes().overlayPane).append('svg');

// create the async function for the shapefile, the data won't load w/out the async function
async function drawMap() {
  // load 3 shapefiles
  geoShape = await d3.json('./data/TAZProject.json');
  console.log('geoshape', geoShape.features);
  geoPolyline = await d3.json('./data/BusRoutesProject.json');
  geoPoint = await d3.json('./data/BusStopsProject.json');

  // project the point onto openstreetmap
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  var projection = d3.geoTransform({ point: projectPoint });
  // create a d3.geoPath to convert GeoJSON to SVG
  var path = d3.geoPath().projection(projection);
  // console.log('the path', path);

  var d3_features = g
    .selectAll('path')
    .data(geoShape.features)
    .enter()
    .append('path');

  // define map.on function to load data as user zoom in/out the layer
  map.on('viewreset', reset);

  reset();

  // fit the SVG element to leaflet's map layer
  function reset() {
    bounds = path.bounds(geoShape);

    var topLeft = bounds[0],
      bottomRight = bounds[1];

    svg
      .attr('width', bottomRight[0] - topLeft[0])
      .attr('height', bottomRight[1] - topLeft[1])
      .style('left', topLeft[0] + 'px')
      .style('top', topLeft[1] + 'px');

    g.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

    // initialize the path data
    d3_features
      .attr('d', path)
      .attr('fill-opacity', 0.3)
      .attr('stroke', 'black')
      .attr('z-index', 3000)
      .attr('stroke-width', 1);
  }

  // the rountes layer (geoPolyline) is the same process as the previous TAZ layer (geoShape)
  var d3_features1 = g1
    .selectAll('path')
    .data(geoPolyline.features)
    .enter()
    .append('path');

  map.on('viewreset', reset1);
  reset1();

  function reset1() {
    bounds = path.bounds(geoPolyline);

    var topLeft = bounds[0],
      bottomRight = bounds[1];

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

  // for the bus stop layer (geoPoint)
  var d3_features2 = svg2
    .selectAll('circle')
    .attr('class', 'Dots')
    .data(geoPoint.features)
    .enter()
    .append('circle')
    .attr('r', 4)
    .style('fill', 'steelblue');

  // map.on function for the points
  map.on('viewreset', reset2);
  reset2();

  function reset2() {
    d3_features2
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
}
drawMap();
