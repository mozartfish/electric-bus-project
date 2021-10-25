/**
 * This file calls all the other scripts that will render the visualization
 */

// Test for ensuring the script is running properly in the browser

var result;
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

  // ENVIRONMENTAL STATISTICAL DATA
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

  const p60BusRouteGeometry = processBusRouteLineData(
    p60RunCutData,
    busRouteGeoData
  );
  const p180BusRouteGeometry = processBusRouteLineData(
    p180RunCutData,
    busRouteGeoData
  );

  // STOP GEOMETRY DATA
  const p20StopGeometry = processBusStopData(
    p20RunCutStops,
    busStopGeoData,
    p20BEBData
  );
  const p60StopGeometry = processBusStopData(
    p60RunCutStops,
    busStopGeoData,
    p60BEBData
  );
  const p180StopGeometry = processBusStopData(
    p180RunCutStops,
    busStopGeoData,
    p180BEBData
  );

  // GEOGRAPHICAL STATISTICAL DATA
  const geographicalStatistics = processGeographicalStatistics(
    marginalIncomeData,
    SEData
  );

  /// FUNCTIONS FOR LOADING AND UPDATING THE VISUALIZATION //////////////////////////////////////
  // console.log('p20 beb data - default load');
  // console.log(p20BEBD

  var busStopGeometry = p20StopGeometry;
  var routeGeometry = p20BusRouteGeometry;
  function updateAllData(plan) {
    if (plan === '20') {
      // console.log('selected plan 20');
      // console.log(p20BEBData);
      const p20EIData = electricStatData.filter((d) =>
        p20Buses.includes(d.block_num)
      );

      btable.updateData(p20BEBData);
      eiHistogram.updateData(p20EIData);
      busStopGeometry = p20StopGeometry;
      routeGeometry = p20BusRouteGeometry;
    } else if (plan === '60') {
      // console.log('selected plan 60');
      // console.log(p60BEBData);
      const p60EIData = electricStatData.filter((d) =>
        p60Buses.includes(d.block_num)
      );
      btable.updateData(p60BEBData);
      eiHistogram.updateData(p60EIData);
      busStopGeometry = p60StopGeometry;
      routeGeometry = p60BusRouteGeometry;
    } else {
      // console.log('select plan 180');
      // console.log(p180BEBData);
      const p180EIData = electricStatData.filter((d) =>
        p180Buses.includes(d.block_num)
      );
      btable.updateData(p180BEBData);
      eiHistogram.updateData(p180EIData);
      busStopGeometry = p180StopGeometry;
      routeGeometry = p180BusRouteGeometry;
    }
  }

  // function hello() {
  //   console.log('hello, world');
  // }

  // create the functions to handle the data data updates
  // CREATE BASE MAP
  const baseMap = L.map('map').setView([40.758701, -111.876183], 8);
  baseMap.setZoom(9);

  const openStreetMapLink =
    '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  const osmLayer = L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; ' + openStreetMapLink + ' Contributors',
      maxZoom: 20,
    }
  ).addTo(baseMap);

  // const busID = '1009';
  // let bMap = new busMap(
  //   baseMap,
  //   busRouteGeoData,
  //   p20StopGeometry,
  //   p20BusRouteGeometry,
  //   busID
  // );
  // bMap.drawMap(0);



  // var addMap = new busMap(
  //   baseMap,
  //   busRouteGeoData,
  //   initBusGeometry,
  //   initRouteGeometry
  // );
  // addMap.drawMap(0);

  let mapUpdate = function (busID) {
    console.log('hello, world');
    console.log('some rando iud', busID);
    let data = p20StopGeometry.get(busID);

    var slider = document.getElementById('slider');
    var output = document.getElementById('demo');
   

    let moveMap = new busMap(
      baseMap,
      busRouteGeoData,
      p20StopGeometry,
      p20BusRouteGeometry,
      busID
    );
    moveMap.drawMap(0);

    output.innerHTML = slider.value;

    slider.max = data.length - 1;

    slider.oninput = function () {
      output.innerHTML = this.value;
    };

     d3.select('input').on('change', function () {
       var mapInput = +d3.select(this).node().value;
       moveMap.drawMap(mapInput);
     });
    // console.log('some stops', data);
  };

  // BUS TABLE
  let btable = new busTable(p20BEBData, mapUpdate); // bus map needs to be replaced for null
  btable.drawTable();

  // ENVIRONMENTAL IMPACT HISTOGRAM
  const p20EIData = electricStatData.filter((d) =>
    p20Buses.includes(d.block_num)
  );
  let eiHistogram = new environmentalImpact(p20EIData);
  eiHistogram.drawHistogram();

  setUpVisualization(p20BEBData, updateAllData);

  // let result = clickID;

  // Map goes here
  // data = p60StopGeometry.get('1006');
  // console.log("data", data)

  // var clickbusID
  // let data = stopGeometry.get(clickBusID);
  // console.log("data thing", data)

  // var slider = document.getElementById('slider');
  // var output = document.getElementById('demo');
  // output.innerHTML = slider.value;

  // slider.max = data.length - 1;

  // slider.oninput = function () {
  //   output.innerHTML = this.value;
  // };

  // // generate map view
  // var map = new busMap(busRouteGeoData, p60StopGeometry, p60BusRouteGeometry);
  // map.drawMap(0);
  // // map.dragging.enable();

  // d3.select('input').on('change', function () {
  //   var mapInput = +d3.select(this).node().value;
  //   // console.log("slider numbner", mapInput)

  //   // generate map view
  //   // map.dragging.enable();
  //   // map.options.draggable = True;
  //   // var addMap = new busMap(
  //   //   baseMap,
  //   //   busRouteGeoData,
  //   //   p60StopGeometry.get('1006'),
  //   //   p60BusRouteGeometry.get('1006')
  //   // );
  //   // map.options.draggable = True;
  //   // map.dragging.enable();
  //   addMap.drawMap(mapInput);
  //   // map.dragging.enable();
  // });
}
build();

//// FUNCTIONS FOR PERFORMING UPDATING THE VISUALIZATION///////////////////////////
function setUpVisualization(updateAllData) {
  // console.log('data', data);
  d3.select('#dataset-selection').on('change', function () {
    let planValue = d3.select('#dataset-selection').node().value;
    updateAllData(planValue);
  });
}

function getBusID(busID) {
  result = busID;
}

function updateBuild(busID) {
  console.log('get shrekt', busID);
  return busID;
}
