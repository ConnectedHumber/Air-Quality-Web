"use strict";

// Import leaflet, but some plugins require it to have the variable name 'L' :-/
import L from 'leaflet';
import 'leaflet-fullscreen';

import GetFromUrl from './Helpers/GetFromUrl.mjs';

import Config from './Config.mjs';
import LayerDeviceMarkers from './LayerDeviceMarkers.mjs';
import LayerHeatmap from './LayerHeatmap.mjs';
import UI from './UI.mjs';

class MapManager {
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
		this.setup_device_markers().then(() => {
			console.info("[map] Device markers loaded successfully.");
			
			// Display a layer controller
			this.setup_layer_control();
		});
		
		// Add the heatmap
		console.info("[map] Loading heatmap....");
		this.setup_heatmap().then(() => {
			console.info("[map] Heatmap loaded successfully.");
		});
		
		this.ui = new UI(Config, this);
		this.ui.setup().then(() => console.log("[map] Settings initialised."));
	}
	
	async setup_device_markers() {
		this.device_markers = new LayerDeviceMarkers(this.map);
		await this.device_markers.setup();
	}
	
	async setup_heatmap() {
		this.heatmap = new LayerHeatmap(this.map);
		
		// TODO: Use leaflet-timedimension here
		// TODO: Allow configuration of the different reading types here
		
		this.heatmap.update_data(new Date(new Date-10*60), "PM25");
	}
	
	setup_layer_control() {
		this.layer_control = L.control.layers({
			// Base layer(s)
			"OpenStreetMap": this.layer_openstreet
		}, { // Overlay(s)
			"Devices": this.device_markers.layer,
			// TODO: Have 1 heatmap layer per reading type?
			"Heatmap": this.heatmap.layer
		}, { // Options
			
		});
		this.layer_control.addTo(this.map);
	}
}

export default Map;
