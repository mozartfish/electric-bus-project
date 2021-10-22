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
 * Function that maps bus sequence for a unique bus to the line abbreviations used for the different stops
 * @param {*} runCutData - the raw data for a particular optimization plan
 * @returns - mapping of the bus sequence line abbreviation to the unique bus
 */
function busSequenceLineAbbr(runCutData) {
  const busLineAbbr = new Map();
  runCutData.forEach((bus) => {
    let busID = bus.busID;
    let lineAbbr = bus.lineAbbr;
    if (busLineAbbr.get(busID)) {
      const busSequence = busLineAbbr.get(busID);
      busSequence.push(lineAbbr);
      busLineAbbr.set(busID, busSequence);
    } else {
      const busSequence = [];
      busSequence.push(lineAbbr);
      busLineAbbr.set(busID, busSequence);
    }
  });
  return busLineAbbr;
}

/**
 * Function that creates a mapping between the unique buses in a runcut file and the line route geometry
 * @param {*} runCutData - the raw data associated with a particular optimization plan
 * @param {*} busRouteGeoData - the geodata associated with the bus route
 * @returns - mapping of bus sequence data to bus route line geometry data
 */
function processBusRouteLineData(runCutData, busRouteGeoData) {
  const busSequenceLines = busSequenceLineAbbr(runCutData);
  const busRouteGeoDataFeatures = busRouteGeoData.features;
  const busRouteLineSequence = new Map();
  busSequenceLines.forEach((value, key) => {
    let busID = key;
    let busLineAbbr = value;
    let featureList = [];
    busLineAbbr.forEach((abbr) => {
      const routeGeometry = busRouteGeoDataFeatures.find(
        (d) => d.properties.LineAbbr === abbr
      );
      featureList.push(routeGeometry);
    });
    busRouteLineSequence.set(busID, featureList);
  });
  return busRouteLineSequence;
}

/**
 * Function that converts fromStops and toStops to a single array containing all the stops for a particular bus
 * @param {*} runCutStopData - the raw unprocessed fromStop and toStop Data
 * @returns - mapping of buses to array of stops for a particular bus sequence
 */
function processStopSequences(runCutStopData) {
  const stopSequences = new Map();
  runCutStopData.forEach((value, key) => {
    let busID = key;
    let stops = value;
    let stopSequence = [];
    stops.forEach((stop, i) => {
      let fromStop = stop[0];
      let toStop = stop[1];
      if (i == 0) {
        stopSequence.push(fromStop);
      } else {
        stopSequence.push(toStop);
      }
    });
    stopSequences.set(busID, stopSequence);
  });

  return stopSequences;
}

/**
 *
 * @param {*} runCutStopData - the raw runcut data for a particular optimization plan
 * @param {*} busStopGeoData - busStopGeoData - the geo data associated with the bus stops
 * @param {*} electricRunCutData - the electric bus runcut data which stores the charging info
 * @returns - maps the bus to stop geometry and charge
 */
function processBusStopData(
  runCutStopData,
  busStopGeoData,
  electricRunCutData
) {
  const processStops = processStopSequences(runCutStopData);
  const busStopGeoDataFeatures = busStopGeoData.features;
  const busStopSequence = new Map();
  processStops.forEach((value, key) => {
    let busID = key;
    let busStops = value;
    let stopList = [];
    busStops.forEach((stop) => {
      const stopGeometry = busStopGeoDataFeatures.find(
        (d) => d.properties.StopName === stop
      );
      stopList.push(stopGeometry);
    });
    busStopSequence.set(busID, stopList);
  });

  // add in the charge status
  const chargeSequence = electricRunCutData['BEB Charge Sequences'];
  const busStopCharge = new Map();
  Object.entries(chargeSequence).forEach((busObj) => {
    let busName = busObj[0];
    let chargeList = busObj[1];
    busStopCharge.set(busName, chargeList);
  });

  // Update charge status
  busStopSequence.forEach((value, key) => {
    let busID = key;
    let stopList = value;
    let chargeList = busStopCharge.get(busID);
    const newStops = [];

    for (let i = 0; i < stopList.length; i++) {
      let stop = stopList[i];
      let chargeStatus = chargeList[i];
      const busStop = { ...stop };
      busStop['chargeStatus'] = chargeStatus;
      newStops.push(busStop);
    }

    busStopSequence.set(busID, newStops);
  });

  return busStopSequence;
}

/**
 * Function that takes electric bus runcut data and returns the bus stop names associated with the active charging stations
 * @param {*} electricRunCutData - the raw runcut data associated with an electric bus for a particular optimization plan
 * @param {*} potentialStopData - data that maps the unique bus stop id with the stop name
 */
function processChargeStations(electricRunCutData, potentialStopData) {
  const chargeStations = Object.entries(electricRunCutData['Charge Stations']);
  const activeStations = [];
  chargeStations.forEach((chargeStation) => {
    let station = chargeStation[0];
    let stationActivity = chargeStation[1];
    if (stationActivity !== 0) {
      activeStations.push(station);
    }
  });
  const stops = potentialStopData.filter((d) => {
    return activeStations.includes(d.stop_id);
  });
  const stopNameList = stops.map((d) => d.stop_name);
  return stopNameList;
}

/**
 * Function that returns a list of the geometries associated with an active charging stop
 * @param {*} electricRunCutData - the raw runcut data for electric buses associated with a particular optimization plan
 * @param {*} potentialStopData - data mapping a stopID with a stop name
 * @param {*} busStopGeoData  - geo data for bus stops
 * @returns - returns a list of all the geometries for charging stations
 */
function processChargeStationSequence(
  electricRunCutData,
  potentialStopData,
  busStopGeoData
) {
  const stopNames = processChargeStations(
    electricRunCutData,
    potentialStopData
  );
  const busStopGeoDataFeatures = busStopGeoData.features;
  const stopGeometry = busStopGeoDataFeatures.filter((d) =>
    stopNames.includes(d.properties.StopName)
  );
  return stopGeometry;
}
