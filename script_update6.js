/**
 * This file calls all the other scripts that will render the visualization
 */

// Test for ensuring the script is running properly in the browser
async function build() {
  console.log('enter the build function');

  // LOAD PLAN DATA
  const p20Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p20.json'
  );
  const p60Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p60.json'
  );
  const p180Data = await d3.json(
    './data/2. Deployment Plans/1. Solutions/p180.json'
  );

  // LOAD GEOGRAPHIC DATA
  const potentialStopData = await d3.csv(
    './data/2. Deployment Plans/2. UTA_Runcut_Potential_Stop.csv'
  );
  const busStopGeoData = await d3.json('data/stopPlusMissingProjct.json');
  console.log("bus stop geo data raw", busStopGeoData)
  const busRouteGeoData = await d3.json('./data/BusRoutesProject.json');
  const TAZProjectionData = await d3.json('./data/TAZProject.json');

  // LOAD RUNCUT DATA
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

  // LOAD SUPPLEMENTARY DATA
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
  const pollutionData = await d3.csv(
    './data/3. Supplementary Data/7. Pollutant Concentration.csv'
  );
  const electricStatData = await d3.csv(
    './data/3. Supplementary Data/8. Ei_for_bus.csv'
  );

  // PROCESS ELECTRIC BUS DATA
  const p20BEBData = processPlanData(p20Data);
  const p60BEBData = processPlanData(p60Data);
  const p180BEBData = processPlanData(p180Data);

  // ELECTRIC BUSES FOR EACH PLAN
  const p20Buses = p20BEBData['Electric Buses'];
  const p60Buses = p60BEBData['Electric Buses'];
  const p180Buses = p180BEBData['Electric Buses'];

  // RUNCUT DATA FOR EACH PLAN
  const p20RunCutData = runCutData.filter((d) => p20Buses.includes(d.busID));
  const p60RunCutData = runCutData.filter((d) => p60Buses.includes(d.busID));
  const p180RunCutData = runCutData.filter((d) => p180Buses.includes(d.busID));

  // RUNCUT STOP DATA
  const p20RunCutStops = processBusStopPath(p20RunCutData);
  const p60RunCutStops = processBusStopPath(p60RunCutData);
  const p180RunCutStops = processBusStopPath(p180RunCutData);

  // STOP COORDINATE DATA
  const stopCoordinates = processBusStopCoordinateData(busStopGeoData);

  // BUS STOP + BUS ID COORDINATE DATA
  const p20RunCutStopsCoordinates = busIDCoordinates(
    p20RunCutStops,
    stopCoordinates
  );
  const p60RunCutStopsCoordinates = busIDCoordinates(
    p60RunCutStops,
    stopCoordinates
  );
  const p180RunCutStopsCoordinates = busIDCoordinates(
    p180RunCutStops,
    stopCoordinates
  );

  // ROUTE GEOMETRY DATA
  const p20BusRouteGeometry = processBusRouteLineData(
    p20RunCutData,
    busRouteGeoData
  );
  console.log("p20 bus routes geometry", p20BusRouteGeometry)

  const p60BusRouteGeometry = processBusRouteLineData(
    p60RunCutData,
    busRouteGeoData
  );
  const p180BusRouteGeometry = processBusRouteLineData(
    p180RunCutData,
    busRouteGeoData
  );

  // STOP GEOMETRY DATA
  const p20StopGeometry = processBusStopData(p20RunCutStops, busStopGeoData);
  const p60StopGeometry = processBusStopData(p60RunCutStops, busStopGeoData);
  const p180StopGeometry = processBusStopData(p180RunCutStops, busStopGeoData);

  console.log('p20 stop geometry');
  console.log(p20StopGeometry);
  // console.log('p60 stop geometry');
  // console.log(p60StopGeometry);
  // console.log('p180 stop geometry');
  // console.log(p180StopGeometry);

  // MISSING STOP GEOMETRY (STOP NAMES)
  const p180MissingStops = processMissingBusStops(
    p180RunCutStops,
    busStopGeoData
  );
  // console.log("p180 missing stops",p180MissingStops)
  const p60MissingStops = processMissingBusStops(
    p60RunCutStops,
    busStopGeoData
  );
  const p20MissingStops = processMissingBusStops(
    p20RunCutStops,
    busStopGeoData
  );

  // console.log('missing stop geometry p20');
  // console.log(p20MissingStops);
  // console.log('missing stop geometry p60');
  // console.log(p60MissingStops);
  // console.log('missing stop geometry p180');
  // console.log(p180MissingStops);

  // CHARGE STATION GEOMETRY
  const p20ChargeGeometry = processChargeStationSequence(
    p20BEBData,
    potentialStopData,
    busStopGeoData
  );
  const p60ChargeGeometry = processChargeStationSequence(
    p60BEBData,
    potentialStopData,
    busStopGeoData
  );
  const p180ChargeGeometry = processChargeStationSequence(
    p180BEBData,
    potentialStopData,
    busStopGeoData
  );

  // console.log('p20 charge geometry');
  // console.log(p20ChargeGeometry);
  // console.log('p60 charge geometry');
  // console.log(p60ChargeGeometry);
  // console.log('p180 charge geometry');
  // console.log(p180ChargeGeometry);

  // console.log('p20 beb data');
  // console.log(p20BEBData);
  // console.log('p60 beb data');
  // console.log(p60BEBData);
  // console.log(p20RunCutData);

  // GEOGRAPHICAL STATISTICAL DATA
  const geographicalStatistics = processGeographicalStatistics(
    marginalIncomeData,
    SEData
  );

//   d3.select("input")
//   .on("change", function() {
//     var mapInput = +d3.select(this).node().value;
    
//     console.log("slider input",mapInput);
   
// })
    // newData = processData(yearInput);




var slider = document.getElementById("slider");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

 
  // generate map view
  var map = new busMap(busRouteGeoData, p60StopGeometry, p60BusRouteGeometry);
  map.drawMap(0);
  // map.dragging.enable();

d3.select("input")
.on("change", function() {

// clear the map if it's already initiallized
var map = L.DomUtil.get('map');
if(map != null){
map._leaflet_id = null;
}

var mapInput = +d3.select(this).node().value;
// console.log("slider numbner", mapInput)

    // generate map view
  // map.dragging.enable();
  // map.options.draggable = True;
  var map =new busMap(busRouteGeoData, p60StopGeometry, p60BusRouteGeometry);
  // map.options.draggable = True;
  // map.dragging.enable();
  map.drawMap(mapInput);
  // map.dragging.enable();

  
   
})

  // newData = processData(yearInput);

  
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