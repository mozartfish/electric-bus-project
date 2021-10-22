class environmentalImpact {
  constructor(EIData) {
    this.data = EIData;
  }

  drawHistogram() {
    console.log('histogram data');
    console.log(this.data);
  }

  updateData(newData) {
    this.data = newData;
    this.drawHistogram();
  }
}
