"use strict";

import Leaflet from 'leaflet';

import Config from './Config.mjs';

class Map {
	constructor() {
		
	}
	
	setup() {
		this.map = Leaflet.map("map");
		this.map.setView(Config.default_location, Config.default_zoom);
		
		this.layer_openstreet = Leaflet.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			id: "openstreetmap",
			maxZoom: 19,
			attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
		}).addTo(this.map);
	}
}

export default Map;
