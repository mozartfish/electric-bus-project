// Author: Pranav Rajan
// This code is based on the Dashboard code from Amelia Wattenberger's Fullstack-D3 Book
class busTable {
  constructor(busData, func, updateElectric) {
    this.data = busData;
    this.func = func;
    this.plan = null;
    this.charge = updateElectric;
  }

  drawTable() {
    let that = this;
    const busDistances = this.data['BEB Distances'];

    const busObjects = Object.entries(busDistances).map((bus) => {
      let busID = bus[0];
      let distances = bus[1];
      const maxDistance = Number.parseFloat(d3.sum(distances)).toFixed(2);
      return { busName: busID, distanceMax: maxDistance };
    });

    // Set up accessor functions
    const formatDistance = (d) => +d;
    const formatBusName = (d) => +d;

    // Set up table information
    const columns = [
      {
        label: 'Bus ID',
        type: 'number',
        format: (d) => formatBusName(d.busName),
      },
      {
        label: 'Max Distance Traveled',
        type: 'number',
        format: (d) => formatDistance(d.distanceMax),
      },
    ];

    // build table
    const table = d3.select('#table');
    table.select('thead').remove();
    table.select('tbody').remove();
    table
      .append('thead')
      .append('tr')
      .selectAll('thead')
      .data(columns)
      .join('th')
      .text((d) => d.label)
      .attr('class', (d) => d.type);

    const body = table.append('tbody');
    busObjects.forEach((d) => {
      body
        .append('tr')
        .selectAll('td')
        .data(columns)
        .join('td')
        .text((column) => column.format(d))
        .attr('class', (column) => column.type)
        .style(
          'background',
          (column) => column.background && column.background(d)
        )
        .style(
          'transform',
          (column) => column.transform && column.transform(d)
        );
    });

    body.on('click', function (d) {
      let busID = d.path[0].innerHTML;
      that.update(busID, this.plan);
    });
  }

  update(busID) {
    this.func(updateBuild(busID, this.plan));
    this.charge(updateBuild(busID, this.plan));
  }

  updateData(newData, plan) {
    this.data = newData;
    this.plan = plan;
    this.drawTable();
  }
}
