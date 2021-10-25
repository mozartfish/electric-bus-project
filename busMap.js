class busMap {
  constructor(
    baseMap,
    busRouteGeoData,
    busStopGeometry,
    busRouteGeometry,
    busID
  ) {
    this.baseMap = baseMap;
    window.baseMap = baseMap;
    this.busStopGeometry = busStopGeometry;
    this.busRouteGeometry = busRouteGeometry;
    this.busRouteGeoData = busRouteGeoData;
    this.busID = busID;
  }

  drawMap(stopNumber) {
    let busStops = this.busStopGeometry.get(this.busID);
    let busRoutes = this.busRouteGeometry.get(this.busID);
   
    let rounteForEach = function (route) {
      return route;
    };

    // remove the map layer of previous stop
    window.baseMap.eachLayer((layer) => {
      if (layer['_latlng'] != undefined) layer.remove();
    });

    let addMarkers = (point) => {
      if (Object.keys(point).length >= stopNumber + 1) {
        L.marker([
          point[stopNumber].geometry.coordinates[1],
          point[stopNumber].geometry.coordinates[0],
        ])
          .bindPopup('Stop Name: ' + point[stopNumber].properties.StopName)
          .addTo(window.baseMap);
      }
    };

    addMarkers(busStops);



    if (d3.select('#routeSVG') != undefined) {
      d3.select('#routeSVG').remove();
    }

    const routeSVG = d3
      .select(window.baseMap.getPanes().overlayPane)
      .append('svg')
      .attr('id', 'routeSVG');

    // //   const tazGroup = tazSVG.append('g').attr('class', 'tazClass').attr('id', 'tazId');
    const routeGroup = routeSVG
      .append('g')
      .attr('class', 'routeClass')
      .attr('id', 'routeId');

    // const stopGroup = stopSVG.append("g").attr('class', 'stopClass').attr('id', 'stopId');

    // project the point onto openstreetmap

    function projectPoint(x, y) {
      const point = window.baseMap.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    const projection = d3.geoTransform({ point: projectPoint });
    // create a d3.geoPath to convert GeoJSON to SVG
    const path = d3.geoPath().projection(projection);
    //     // console.log('the path', path);

    // // console.log("route log test", this.p60BusRouteGeometry.length)

    const arr = [];
    if (busRoutes.length >= stopNumber + 1) {
      arr.push(busRoutes[stopNumber]);
    }

    var routeFeatures = routeGroup
      .selectAll('path')
      .data(arr)
      .enter()
      .append('path')
      .attr('class', 'pathClass');

    const reset1 = () => {
      var bounds = path.bounds(this.busRouteGeoData);

      var topLeft = bounds[0],
        bottomRight = bounds[1];

      routeSVG
        .attr('width', bottomRight[0] - topLeft[0])
        .attr('height', bottomRight[1] - topLeft[1])
        .style('left', topLeft[0] + 'px')
        .style('top', topLeft[1] + 'px');

      routeGroup.attr(
        'transform',
        'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')'
      );

      // initialize the path data
      routeFeatures
        .attr('d', path)
        .style('fill-opacity', 0.7)
        .attr('fill', 'none')
        .attr('stroke', 'green')
        .attr('stroke-width', 5);
    };

    // map.on('viewreset', reset1);
    window.baseMap.on('zoomend', reset1);
    reset1();
  }
}
