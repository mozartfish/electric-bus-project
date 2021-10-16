/**
 *
 * @param {*} planData - the raw data for a bus plan
 * @returns - data for the electric buses for a specific plan
 */
function processPlanData(planData) {
  // console.log('called the process plan data function');

  // Separate different parts of the bus data
  const busDistances = planData['Bus Distance'];
  const busChargeSequences = planData['Charge Sequence'];
  const busChargeStations = planData['Charge Stations'];
  const replacedBuses = planData['Replace Buses'];
  const environmentalEquity = planData['Total Environmental Equity'];

  // Convert JSON objects to arrays
  const busEntries = Object.entries(replacedBuses);
  const busDistanceEntries = Object.entries(busDistances);
  const chargeSequenceEntries = Object.entries(busChargeSequences);

  // PROCESS ELECTRIC BUSES
  const electricBuses = busEntries.filter((bus) => {
    return bus[1] != 0;
  });
  const electricBusID = electricBuses.map((bus) => {
    return bus[0];
  });

  // PROCESS BUS DISTANCES
  const bDistSet = new Set();
  const bebDistances = busDistanceEntries.filter((bDistance) => {
    const busID = bDistance[0];
    if (electricBusID.includes(busID)) {
      bDistSet.add(busID);
      return bDistance;
    }
  });

  // PROCESS CHARGE SEQUENCES
  const chargeSequenceSet = new Set();
  const bebChargeSequences = chargeSequenceEntries.filter((bCharge) => {
    const busID = bCharge[0];
    if (electricBusID.includes(busID)) {
      chargeSequenceSet.add(busID);
      return bCharge;
    }
  });

  // UPDATE THE BUS DISTANCES IF THERE IS A BUS MISSING FROM CHARGE SEQUENCE SET
  const updatedBebDistances = bebDistances.filter((bDistance) => {
    const busID = bDistance[0];
    if (chargeSequenceSet.has(busID)) {
      return bDistance;
    }
  });

  // UPDATE THE ELECTRIC BUS IDs IF BUS MISSING FROM CHARGE SEQUENCE SET
  const updatedElectricBusID = electricBusID.filter((bus) =>
    chargeSequenceSet.has(bus)
  );

  // CHECK THAT ALL THE SETS CONTAIN THE SAME NUMBER OF VALUES
  // console.log('electric bus count: ', updatedElectricBusID.length);
  // console.log('beb distance count: ', updatedBebDistances.length);
  // console.log('charge sequence count: ', bebChargeSequences.length);

  // Object for representing processed data
  const BEBDistances = Object.fromEntries(updatedBebDistances);
  const BEBChargeSequences = Object.fromEntries(bebChargeSequences);

  const bebPlan = {
    'Environmental Equity': environmentalEquity,
    'Electric Buses': updatedElectricBusID,
    'BEB Distances': BEBDistances,
    'BEB Charge Sequences': BEBChargeSequences,
    'Charge Stations': busChargeStations,
  };

  return bebPlan;
}
/**
 * Function that takes the runcut data for an optimization plan
 * and generates a mapping of the buses to their stop names
 * @param {*} runCutData - electric bus data for a particular plan
 * @returns - mapping of the bus names to the bus stops
 */
function processBusStopPath(runCutData) {
  const busStopSequence = new Map();
  runCutData.forEach((busObj) => {
    let busID = busObj.busID;
    let fromStop = busObj.fromStop;
    let toStop = busObj.toStop;
    if (busStopSequence.get(busID)) {
      const stops = busStopSequence.get(busID);
      stops.push([fromStop, toStop]);
      busStopSequence.set(busID, stops);
    } else {
      const stops = [];
      stops.push([fromStop, toStop]);
      busStopSequence.set(busID, stops);
    }
  });
  return busStopSequence;
}

/**
 * Function that maps bus stop names to stop coordinate data
 * @param {*} busStopGeoData - stop geodata
 * @returns - map of bus stop names to stop geographic coordinates
 */
function processBusStopCoordinateData(busStopGeoData) {
  const geoFeatures = busStopGeoData.features;
  const stopCoordinates = new Map();
  geoFeatures.forEach((feature) => {
    const coordinates = feature.geometry.coordinates;
    const stopName = feature.properties.StopName;
    stopCoordinates.set(stopName, coordinates);
  });

  console.log('stop coordinates', stopCoordinates);
  return stopCoordinates;
}

/**
 * Function that combines the data from marginal income and social equtiy data objects into a single statistical object
 * @param {*} marginalIncomeData - data associated with marginal income statistical data
 * @param {*} socialEquityData - data associated with social equity statistical data
 * @returns - list of objects containing the marginal income data and social equity data combined into a single object
 */
function processGeographicalStatistics(marginalIncomeData, socialEquityData) {
  const statObjects = marginalIncomeData.map((d) => {
    // find the object with the same key name
    let cID = d.CO_TAZID;
    const equityObj = socialEquityData.find((SE) => SE.CO_TAZID === cID);
    const statObj = {
      ...d,
    };
    // add equity info
    statObj.HHSIZE = equityObj.HHSIZE;
    statObj.TOTEMP = equityObj.TOTEMP;
    statObj.HHPOP = equityObj.HHPOP;
    return statObj;
  });
  return statObjects;
}

// function processBusStopData(busData) {
//   const busDataFeatures = busData.features;
//   const stopCoordinateMap = new Map();
//   busDataFeatures.forEach((busFeature) => {
//     const coordinates = busFeature.geometry.coordinates;
//     const stopName = busFeature.properties.StopName;
//     stopCoordinateMap.set(stopName, coordinates);
//   });
//   return stopCoordinateMap;
// }

// function mapStopCoordinates(busStopData, stopData) {
//   // dictionary object for storing all the results of the coordinates associated with each bus stop for from and to
//   const busCoordMap = new Map();

//   // array containing all the information for the from and to stops
//   const stopDataFeatures = stopData.features;

//   // loop through each of the buses in the bus stop data and construct a new map
//   busStopData.forEach((value, key) => {
//     const busID = key;
//     const busStops = value;
//     const stopCoords = busStops.map((stop) => {
//       // get from and to stop names
//       [fromStop, toStop] = stop;

//       // get the coordinates for the from and to stop
//       const fromStopCoords = stopDataFeatures.find(
//         (stop) => stop.properties.StopName === fromStop
//       );
//       const toStopCoords = stopDataFeatures.find(
//         (stop) => stop.properties.StopName === toStop
//       );

//       // array for storing new coordinates
//       const coords = [fromStopCoords, toStopCoords];
//       return coords;
//     });
//     // update the coordinates
//     busCoordMap.set(busID, stopCoords);
//   });
//   return busCoordMap;
// }

// function processRouteData(runCutData, routesData, stopData) {
//   // get the array of information associated with the route. this data contains the line abbr
//   const routeFeatures = routesData.features;

//   // dictionary for storing the busID to route features
//   const routeMap = new Map();

//   // get the busRouteStops
//   const busRouteStops = processBusMapStopData(runCutData);

//   // get the coordinates for the from and to stop for every bus stop associated with a particular busID
//   const busCoordMap = mapStopCoordinates(busRouteStops, stopData);

//   // construct the information associated with the route, bus id, and coordinates
//   runCutData.forEach((busObj) => {
//     let busID = busObj.busID;
//     let lineAbbr = busObj.lineAbbr;
//     if (!routeMap.get(busID)) {
//       const busLine = routeFeatures.find(
//         (routes) => routes.properties.LineAbbr === lineAbbr
//       );
//       const busStops = busCoordMap.get(busID);
//       const busStopInfo = {
//         busLine: busLine,
//         busStops: busStops,
//       };
//       routeMap.set(busID, busStopInfo);
//     }
//   });
//   // console.log('the route geographical info', routeMap);
//   return routeMap;
// }
