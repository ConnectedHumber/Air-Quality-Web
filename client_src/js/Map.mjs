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
			attribution: "&copy; OSM Mapnik <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
		}).addTo(this.map);
	}
}

export default Map;
