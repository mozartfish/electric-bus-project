/**
 * This file calls all the other scripts that will render the visualization
 */

// Test for ensuring the script is running properly in the browser
// console.log('hello, world');

async function drawChart() {
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
        lineAbbr: +d.LineAbbr,
        busSequence: currentSequence,
      };
    }
  );
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
  const p20Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p20.json'
  );
  const p60Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p60.json'
  );
  const p180Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p180.json'
  );

  const busStopData = await d3.json('data/BusStopsProject.json');

  const busRoutesData = await d3.json('./data/BusRoutesProject.json');

  const TAZProjectionData = await d3.json('./data/TAZProject.json');

  // // print out a bunch of stuff

  // // Runcut Data
  // console.log('runcut data', runCutData);

  // // Stop Data
  // const stopDataMap = processPotentialStop(potentialStopData);
  // console.log('stop data,', stopDataMap);

  // // Stop Coordinate Data
  // const stopCoordinateData = processBuStopData(busStopData);
  // console.log('stop coordinate data', stopCoordinateData);

  // // Marginal Income Data
  // console.log('marginal income data', marginalIncomeData);

  // // Social Equity Data
  // console.log('social equality data', SEData);

  // // Pollution Data
  // console.log('pollution data', pollutionData);

  // // Electric Bus Statistics Data
  // console.log('electric bus info data', electricStatData);

  // // Bus Routes Data
  // console.log('bus routes data', busRoutesData);

  // // Plan Data
  // console.log('Plan Data');
  // console.log('p20 data', p20Data);
  // console.log('p60 data', p60Data);
  // console.log('p180 data', p180Data);

  // generate map view
  let map = new busMap(TAZProjectionData, busRoutesData, busStopData);
  map.drawMap();
}

drawChart();
