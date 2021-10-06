/**
 * This file calls all the other scripts that will render the visualization
 */

// Test for ensuring the script is running properly in the browser
// console.log('hello, world');

async function drawChart() {
  // Process the RunCutData File
  // Variables for keeping track of the current bus sequences for a particular bus
  let currentBusID = '';
  let currentSequence = 0;
  const runCutData = await d3.csv(
    './data/1. Network Data/3. UTA Runcut File  Aug2016.csv',
    (d) => {
      let busID = d.block_num;
      if (busID === currentBusID) {
        currentSequence++;
      } else {
        currentBusID = busID;
        currentSequence = 0;
      }
      return {
        busID: +d.block_num,
        directionName: d.DirectionName,
        fromTime: d.FromTime,
        toTime: d.ToTime,
        fromStop: d.from_stop,
        toStop: d.to_stop,
        serviceName: d.ServiceName,
        lineAbbr: d.LineAbbr,
        busSequence: currentSequence,
      };
    }
  );

  // Process specific stop information data
  const potentialStopData = await d3.csv(
    './data/2. Deployment Plans/2. UTA_Runcut_Potential_Stop.csv'
  );
  const marginalIncomeData = await d3.csv(
    './data/3. Supplementary Data/5. Marginal_Income.csv'
  );
  const SEData = await d3.csv(
    './data/3. Supplementary Data/6. SE_File_v83_SE19_Net19.csv'
  );
  const pollutionData = await d3.csv(
    './data/3. Supplementary Data/7. Pollutant Concentration.csv'
  );
  const electricStatData = await d3.csv(
    './data/3. Supplementary Data/8. Ei_for_bus.csv'
  );

  // Process information about the bus plans
  const p20Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p20.json'
  );
  const p60Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p60.json'
  );
  const p180Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p180.json'
  );

  // Process the geographic data json files
  const busStopData = await d3.json('data/BusStopsProject.json');
  const busRoutesData = await d3.json('./data/BusRoutesProject.json');
  const TAZProjectionData = await d3.json('./data/TAZProject.json');

  // RUNCUT DATA PROCESSING

  // Data that maps a unique busID to the stop names for a unique bus's route
  const busStopMap = processBusMapStopData(runCutData);
  console.log('busStopMap', busStopMap);

  // Geographic data that maps a unique busID to the geographic information about a bus route and the coordinates associated with bus stops
  const busRouteMap = processRouteData(runCutData, busRoutesData, busStopData);
  console.log('busRouteMap', busRouteMap);

  // BUS STOP DATA PROCESSING

  // Data that maps a unique stopID to a specific bus stop name
const stopDataMap = processPotentialStop(potentialStopData);
  console.log('stopDataMap', stopDataMap);

  // Stop Coordinate Data
  const stopCoordinateData = processBusStopData(busStopData);
  console.log('Stop Coordinate Data', stopCoordinateData);

  // BUS STATISTICS DATA PROCESSING
  // Marginal Income Data
  console.log('Marginal Income Data', marginalIncomeData);

  // Social Equity Data
  console.log('Social Equity Data', SEData);

  // Pollution Data
  console.log('Pollution data', pollutionData);

  // Electric Bus Statistics Data
  console.log('Electric Bus Info data', electricStatData);

  // Bus Routes Data
  console.log('Bus Routes Data', busRoutesData);

  // Plan Data
  console.log('Plan Data');
  console.log('P20 data', p20Data);
  console.log('P60 data', p60Data);
  console.log('P180 data', p180Data);

  // generate map view
  let map = new busMap(TAZProjectionData, busRoutesData, busStopData);
  map.drawMap();
}

drawChart();
