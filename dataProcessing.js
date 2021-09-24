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
