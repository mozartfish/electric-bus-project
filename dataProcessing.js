function processPotentialStop(data) {
  // array for storing new objects that have been processed
  let result = data.map((d) => {
    const key = parseInt(d.stop_id);
    const value = d.stop_name;
    const stopMap = { [key]: value };
    return stopMap;
  });
  return result;
}

function processBuStopData(busData) {
  const busDataFeatures = busData.features;
  let result = busDataFeatures.map((d) => {
    const coordinates = d.geometry.coordinates;
    const stopName = d.properties.StopName;
    const coordMap = {
      [stopName]: coordinates,
    };
    return coordMap;
  });

  return result;
}

function mapBusData(runCutData) {
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
