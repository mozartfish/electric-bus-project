/**
 *
 * @param {*} planData - the raw data for a bus plan
 * @returns - data for the electric buses for a specific plan
 */
function processPlanData(planData) {
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

/**
 * Function that maps bus ID to stop sequence coordinates
 * @param {*} busStopSequenceData - bus stop sequence data
 * @param {*} busStopCoordinateData - coordinate mapping with bus stop name and bus stop coordinates
 * @returns - bus ID to coordinates for the different routes for a particular bus
 */
function busIDCoordinates(busStopSequenceData, busStopCoordinateData) {
  // create new map object for mapping bus ID to coordinates for stops
  const busIDCoordinates = new Map();
  busStopSequenceData.forEach((value, key) => {
    const stopCoordinates = value.map((stop) => {
      [fromStop, toStop] = stop;
      const fromStopCoords = busStopCoordinateData.get(fromStop);
      const toStopCoords = busStopCoordinateData.get(toStop);
      return [fromStopCoords, toStopCoords];
    });
    busIDCoordinates.set(key, stopCoordinates);
  });
  return busIDCoordinates;
}

/**
 * Function that maps unique bus route line abbreviations to bus lines
 * @param {*} busRouteGeoData - the raw bus route data
 * @returns - mapping of the line abbreviation to the bus line
 */
function processBusRouteLineData(busRouteGeoData) {
  const lineGeometry = new Map();
  const geoFeatures = busRouteGeoData.features;
  geoFeatures.forEach((feature) => {
    const lineAbbr = feature.properties.LineAbbr;
    const geometry = feature.geometry;
    lineGeometry.set(lineAbbr, geometry);
  });

  return lineGeometry;
}

function busSequenceRoutes(runCutData, busRouteGeoData) {
  // generate lines for unique bus abbreviations
  const lineRoutes = processBusRouteLineData(busRouteGeoData);
  console.log('line routes');
  console.log(lineRoutes);
  const busSequenceRoutes = new Map();

  runCutData.forEach((d) => {
    let busID = d.busID;
    let lineAbbr = d.lineAbbr;
    let lineGeometry = lineRoutes.get(lineAbbr);
    let routes = busSequenceRoutes.get(busID);
    if (busSequenceRoutes.get(busID)) {
      routes.push(lineGeometry);
      busSequenceRoutes.set(d.busID);
    } else {
      const linePath = [];
      linePath.push(lineGeometry);
      busSequenceRoutes.set(busID, linePath);
    }
    console.log('bus routes sequence');
    console.log(busSequenceRoutes);
  });

  // console.log('bus sequence routes');
  // console.log(busSequenceRoutes);

  console.log('the runcut data');
  console.log(runCutData);
}
