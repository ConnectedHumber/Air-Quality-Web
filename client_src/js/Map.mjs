"use strict";

// Import leaflet, but some plugins require it to have the variable name 'L' :-/
import L from 'leaflet';
import 'leaflet-fullscreen';

import Config from './Config.mjs';
import LayerDeviceMarkers from './LayerDeviceMarkers.mjs';

class Map {
	constructor() {
	}
	
	setup() {
		// Create the map
		this.map = L.map("map", {
			fullscreenControl: true
		});
		this.map.setView(Config.default_location, Config.default_zoom);
		
		// Add the OpenStreetMap tile layer
		this.layer_openstreet = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			id: "openstreetmap",
			maxZoom: 19,
			attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
		}).addTo(this.map);
		
		// Add the device markers
		console.info("[map] Loading device markers....");
		this.device_markers = new LayerDeviceMarkers(this.map);
		this.device_markers.setup().then(() => {
			console.info("[map] Device markers loaded successfully.");
			
			// Display a layer controller
			this.setup_layer_control();
		});
		
	}
	
	setup_layer_control() {
		this.layer_control = L.control.layers({
			// Base layer(s)
			"OpenStreetMap": this.layer_openstreet
		}, { // Overlay(s)
			"Devices": this.device_markers.layer
		}, { // Options
			
		});
		this.layer_control.addTo(this.map);
	}
}

export default Map;
