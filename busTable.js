class busTable {
  constructor(busData) {
    this.data = busData;
  }

  drawTable() {
    console.log('entered the draw table function for buses');
    console.log('data');
    console.log(this.data);

    console.log('bus name list');
    const busNames = this.data['Electric Buses'];
    console.log(busNames);

    console.log('bus distances');
    const busDistances = this.data['BEB Distances'];
    console.log(busDistances);

    // calculate the max distance traveled for each bus
    // const busObjects = Object.entries(busDistances);
    // busObjects.forEach((element) => {
    //   const busID = element[0];
    //   const distances = element[1];
    //   const maxDistance = d3.sum(distances);
    //   element[1] = maxDistance;
    // });

    const busObjects = Object.entries(busDistances).map((bus) => {
      let busID = bus[0];
      let distances = bus[1];
      const maxDistance = Number.parseFloat(d3.sum(distances)).toFixed(2);

      return { busName: busID, distanceMax: maxDistance };
    });
    console.log(busObjects);

    
  }

  updateData(newData) {
    this.data = newData;
    console.log('the new data selected');
    this.drawTable();
  }
}
