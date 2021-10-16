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
  // console.log("p20BEBDataaaaaaaaaaaaaa",p20BEBData)
  const p60BEBData = processPlanData(p60Data);
  const p180BEBData = processPlanData(p180Data);
  // console.log("p180BEBData",p180BEBData)

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

  // PROCESS GEOGRAPHIC DATA
  const potentialStopData = await d3.csv(
    './data/2. Deployment Plans/2. UTA_Runcut_Potential_Stop.csv'
  );
  const busStopGeoData = await d3.json('data/BusStopsProject.json');
  const busRouteGeoData = await d3.json('./data/BusRoutesProject.json');
  const TAZProjectionData = await d3.json('./data/TAZProject.json');

  // Geographic Runcut Stop Data
  const p20RunCutStops = processBusStopPath(p20RunCutData);
  // console.log("p20RunCutStops",p20RunCutStops)
  const p60RunCutStops = processBusStopPath(p60RunCutData);
  const p180RunCutStops = processBusStopPath(p180RunCutData);

  // Stop Coordinates
  const stopCoordinates = processBusStopCoordinateData(busStopGeoData);
  // console.log("stopCoordinates",stopCoordinates)

  // Bus Stops and Bus ID Mapping
  const p20RunCutStopsCoordinates = busIDCoordinates(
    p20RunCutStops,
    stopCoordinates
  );

  // console.log(p20RunCutStopsCoordinates)

  const p60RunCutStopsCoordinates = busIDCoordinates(
    p60RunCutStops,
    stopCoordinates
  );
  const p180RunCutStopsCoordinates = busIDCoordinates(
    p180RunCutStops,
    stopCoordinates
  );

  const p20BusSequenceRoutes = busSequenceRoutes(
    p20RunCutData,
    busRouteGeoData
  );

  // console.log("p20BusSequenceRoutes", p20BusSequenceRoutes);

  const p60BusSequenceRoutes = busSequenceRoutes(
    p60RunCutData,
    busRouteGeoData
  );
  const p180BusSequenceRoutes = busSequenceRoutes(
    p180RunCutData,
    busRouteGeoData
  );

  // PROCESS THE SUPPLEMENTARY DATA FOR THE TABLE AND CHARTS
  const marginalIncomeData = await d3.csv(
    './data/3. Supplementary Data/5. Marginal_Income.csv',
    (d) => {
      return {
        CO_TAZID: +d.CO_TAZID,
        INC1: +d.INC1,
        INC2: +d.INC2,
        INC3: +d.INC3,
        INC4: +d.INC4,
        TOTHH: +d.TOTHH,
      };
    }
  );
  const SEData = await d3.csv(
    './data/3. Supplementary Data/6. SE_File_v83_SE19_Net19.csv',
    (d) => {
      return {
        CO_TAZID: +d.CO_TAZID,
        HHPOP: +d.HHPOP,
        HHSIZE: +d.HHSIZE,
        TOTEMP: +d.TOTEMP,
        TOTHH: +d.TOTHH,
      };
    }
  );

  const geographicalStatistics = processGeographicalStatistics(
    marginalIncomeData,
    SEData
  );

  // PROCESS THE SUPPLEMENTARY DATA FOR THE MAP
  const pollutionData = await d3.csv(
    './data/3. Supplementary Data/7. Pollutant Concentration.csv'
  );
  const electricStatData = await d3.csv(
    './data/3. Supplementary Data/8. Ei_for_bus.csv'
  );

  console.log('bus sequence data');
  console.log(p20BusSequenceRoutes);

  // Build the map view
  let map = new busMap(p20BusSequenceRoutes);
  map.drawMap();
}

// Create the visualization tool
// title();

// generate map view

// let map = new busMap(p20BusSequenceRoutes);
// map.drawMap();

build();

// DO NOT USE CODE UNDER BUILD (IT WILL NOT WORK AND CRASH)
// 
// drawChart();

// // generate map view
// let map = new busMap(TAZProjectionData, busRoutesData, busStopData);
// map.drawMap();

// generate map view
// let map = new busMap(p20BusSequenceRoutes);
// map.drawMap();

// draw the plots
// let plots = new plotting(electricStatData, p60Data);
// plots.drawPlots();

// drawChart();
