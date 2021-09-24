/**
 * This file calls all the other scripts that will render the visualization
 */

// Test for ensuring the script is running properly in the browser
console.log('hello, world');

async function drawChart() {
  const runCutData = await d3.csv(
    './data/1. Network Data/3. UTA Runcut File  Aug2016.csv'
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
  const poulltionData = await d3.csv(
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

  // print out a bunch of stuff
  console.log('p20 data', p20Data);
  console.log('p60 data', p60Data);
  console.log('p180 data', p180Data);

  console.log('runcut data');
  console.log(runCutData);
  console.log('stop data');
  console.log(potentialStopData);
  console.log('marginal income data');
  console.log(marginalIncomeData);
  console.log('social equality data');
  console.log(SEData);
  console.log('pollution data');
  console.log(poulltionData);
  console.log('electric bus info data');
  console.log(electricStatData);
}

drawChart();
