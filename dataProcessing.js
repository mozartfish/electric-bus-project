function processPotentialStop(stopData) {
  // console.log('Stop Data', stopData);
  const stopMap = new Map();
  stopData.forEach((stop) => {
    const stopID = parseInt(stop.stop_id);
    const stopName = stop.stop_name;
    stopMap.set(stopID, stopName);
  });
  return stopMap;
}

function processBusStopData(busData) {
  const busDataFeatures = busData.features;
  const stopCoordinateMap = new Map();
  busDataFeatures.forEach((busFeature) => {
    const coordinates = busFeature.geometry.coordinates;
    const stopName = busFeature.properties.StopName;
    stopCoordinateMap.set(stopName, coordinates);
  });
  return stopCoordinateMap;
}

function processBusMapStopData(runCutData) {
  const busMap = new Map();
  runCutData.forEach((busObj) => {
    let busID = busObj.busID;
    let fromStop = busObj.fromStop;
    let toStop = busObj.toStop;
    if (busMap.get(busID)) {
      const stops = busMap.get(busID);
      stops.push([fromStop, toStop]);
      busMap.set(busID, stops);
    } else {
      const stops = [];
      stops.push([fromStop, toStop]);
      busMap.set(busID, stops);
    }
  });
  return busMap;
}

function mapStopCoordinates(busStopData, stopData) {
  // dictionary object for storing all the results of the coordinates associated with each bus stop for from and to
  const busCoordMap = new Map();

  // array containing all the information for the from and to stops
  const stopDataFeatures = stopData.features;

  // loop through each of the buses in the bus stop data and construct a new map
  busStopData.forEach((value, key) => {
    const busID = key;
    const busStops = value;
    const stopCoords = busStops.map((stop) => {
      // get from and to stop names
      [fromStop, toStop] = stop;

      // get the coordinates for the from and to stop
      const fromStopCoords = stopDataFeatures.find(
        (stop) => stop.properties.StopName === fromStop
      );
      const toStopCoords = stopDataFeatures.find(
        (stop) => stop.properties.StopName === toStop
      );

      // array for storing new coordinates
      const coords = [fromStopCoords, toStopCoords];
      return coords;
    });
    // update the coordinates
    busCoordMap.set(busID, stopCoords);
  });
  return busCoordMap;
}

function processRouteData(runCutData, routesData, stopData) {
  // get the array of information associated with the route. this data contains the line abbr
  const routeFeatures = routesData.features;

  // dictionary for storing the busID to route features
  const routeMap = new Map();

  // get the busRouteStops
  const busRouteStops = processBusMapStopData(runCutData);

  // get the coordinates for the from and to stop for every bus stop associated with a particular busID
  const busCoordMap = mapStopCoordinates(busRouteStops, stopData);

  // construct the information associated with the route, bus id, and coordinates
  runCutData.forEach((busObj) => {
    let busID = busObj.busID;
    let lineAbbr = busObj.lineAbbr;
    if (!routeMap.get(busID)) {
      const busLine = routeFeatures.find(
        (routes) => routes.properties.LineAbbr === lineAbbr
      );
      const busStops = busCoordMap.get(busID);
      const busStopInfo = {
        busLine: busLine,
        busStops: busStops,
      };
      routeMap.set(busID, busStopInfo);
    }
  });
  // console.log('the route geographical info', routeMap);
  return routeMap;
}
