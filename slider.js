var slider = document.getElementById("slider");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

let map = new busMap(busRouteGeoData, p60StopGeometry, p60BusRouteGeometry);
  map.drawMap();