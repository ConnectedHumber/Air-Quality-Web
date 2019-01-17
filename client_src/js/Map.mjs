"use strict";

// Import leaflet, but some plugins require it to have the variable name 'L' :-/
import L from 'leaflet';
import 'leaflet-fullscreen';

import Config from './Config.mjs';

class Map {
	constructor() {
		
	}
	
	setup() {
		this.map = L.map("map", {
			fullscreenControl: true
		});
		this.map.setView(Config.default_location, Config.default_zoom);
		
		this.layer_openstreet = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			id: "openstreetmap",
			maxZoom: 19,
			attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
		}).addTo(this.map);
	}
}

export default Map;
