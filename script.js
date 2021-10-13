/**
 * This file calls all the other scripts that will render the visualization
 */

// Test for ensuring the script is running properly in the browser
async function build() {
  console.log('enter the build function');

  // PROCESS THE PLAN DATA
  const p20Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p20.json'
  );
  const p60Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p60.json'
  );
  const p180Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p180.json'
  );

  // Processed plan data
  const p20BEBData = processPlanData(p20Data);
  const p60BEBData = processPlanData(p60Data);
  const p180BEBData = processPlanData(p180Data);
  // console.log('Plan 20 data');
  // console.log(p20BEBData);
  // console.log('Plan 60 Data');
  // console.log(p60BEBData);
  // console.log('Plan 180 data');
  // console.log(p180BEBData);

  // PROCESS THE RUNCUT DATA

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
        busID: d.block_num,
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

  // Electric buses associated with each plan
  const p20Buses = p20BEBData['Electric Buses'];
  const p60Buses = p60BEBData['Electric Buses'];
  const p180Buses = p180BEBData['Electric Buses'];

  // Runcut data for each plan
  const p20RunCutData = runCutData.filter((d) => p20Buses.includes(d.busID));
  const p60RunCutData = runCutData.filter((d) => p60Buses.includes(d.busID));
  const p180RunCutData = runCutData.filter((d) => p180Buses.includes(d.busID));

  // console.log('p20 runcutdata');
  // console.log(p20RunCutData);
  // console.log('p60 runcutdata');
  // console.log(p60RunCutData);
  // console.log('p180 runcutdata');
  // console.log(p180RunCutData);

  // PROCESS GEOGRAPHIC DATA
  const potentialStopData = await d3.csv(
    './data/2. Deployment Plans/2. UTA_Runcut_Potential_Stop.csv'
  );
  // console.log('potential stop data');
  // console.log(potentialStopData);

  const busStopGeoData = await d3.json('data/BusStopsProject.json');
  // console.log('bus stop geo data');
  // console.log(busStopGeoData);

  const busRouteGeoData = await d3.json('./data/BusRoutesProject.json');
  // console.log('bus route geo data');
  // console.log(busRouteGeoData);

  const TAZProjectionData = await d3.json('./data/TAZProject.json');
  // console.log('TAZ Projection Data');
  // console.log(TAZProjectionData);

  // Geographic Runcut Stop Data
  const p20RunCutStops = processBusStopPath(p20RunCutData);
  const p60RunCutStops = processBusStopPath(p60RunCutData);
  const p180RunCutStops = processBusStopPath(p180RunCutData);

  // Stop Coordinates
  const stopCoordinates = processBusStopCoordinateData(busStopGeoData);

  // PROCESS THE SUPPLEMENTARY DATA FOR THE TABLE AND CHARTS
  const marginalIncomeData = await d3.csv(
    './data/3. Supplementary Data/5. Marginal_Income.csv'
  );
  const SEData = await d3.csv(
    './data/3. Supplementary Data/6. SE_File_v83_SE19_Net19.csv'
  );

  const geographicalStatistics = processGeographicalStatistics(
    marginalIncomeData,
    SEData
  );


// PROCESS THE SUPPLEMENTARY DATA FOR THE MAP
  const pollutionData = await d3.csv(
    './data/3. Supplementary Data/7. Pollutant Concentration.csv'
  );
  // console.log('pollution data');
  // console.log(pollutionData);

  const electricStatData = await d3.csv(
    './data/3. Supplementary Data/8. Ei_for_bus.csv'
  );
  // console.log('electricalStatisticsData');
  // console.log(electricStatData);
}
build();

// async function drawChart() {

// //   // RUNCUT DATA PROCESSING

// //   // Geographic data that maps a unique busID to the geographic information about a bus route and the coordinates associated with bus stops
// //   const busRouteMap = processRouteData(runCutData, busRoutesData, busStopData);
// //   console.log('busRouteMap', busRouteMap);

// //   // Bus Routes Data
// //   console.log('Bus Routes Data', busRoutesData);

// //   // generate map view
// }

// drawChart();
