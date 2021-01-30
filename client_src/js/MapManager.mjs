"use strict";

// Import leaflet, but some plugins require it to have the variable name 'L' :-/
import L from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-easyprint';
// import '../../node_modules/leaflet-timedimension/dist/leaflet.timedimension.src.withlog.js';

import Config from './Config.mjs';
import LayerDeviceMarkers from './LayerDeviceMarkers.mjs';
import DeviceData from './DeviceData.mjs';
import ReadingsData from './ReadingsData.mjs';
import UI from './UI.mjs';

class MapManager {
	constructor() {
		console.log(Config);
		this.readings_data = new ReadingsData();
	}
	
	async setup() {
		// Create the map
		this.map = L.map("map", {
			fullscreenControl: true
		});
		this.map.setView(Config.default_location, Config.default_zoom);
		
		// Add the OpenStreetMap tile layer
		this.layer_openstreet = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			id: "openstreetmap",
			maxZoom: 19,
			attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
		}).addTo(this.map);
		
		// Add the attribution
		this.map.attributionControl.addAttribution("Data: <a href='https://connectedhumber.org/'>Connected Humber</a>");
		this.map.attributionControl.addAttribution("<a href='https://github.com/ConnectedHumber/Air-Quality-Web/'>Air Quality Web</a> by <a href='https://starbeamrainbowlabs.com/'>Starbeamrainbowlabs</a>");
		this.map.attributionControl.addAttribution("<strong><a href='https://github.com/ConnectedHumber/Air-Quality-Web/tree/dev#disclaimer'>Sensor Data Disclaimer</a></strong>");
		
		// Setup the UI
		this.ui = new UI(Config, this);
		this.ui.setup().then(() => console.log("[map] UI setup complete."));
		
		// Set the export to image button
		this.setup_print_export();
		
		// Load the device information
		this.device_data = new DeviceData();
		await this.device_data.setup();
		console.log("[map] Device data loaded");
		
		// Add the device markers
		console.info("[map] Loading device markers....");
		Promise.all([
			this.setup_device_markers.bind(this)()
				.then(() => console.info("[map] Device markers loaded successfully.")),
		]).then(() => document.querySelector("main").classList.remove("working-visual"));
		
	}
	
	// NOTE: We tried leaflet-time-dimension for changing the time displayed, but it didn't work out
	
	async setup_device_markers() {
		this.device_markers = new LayerDeviceMarkers(this, this.device_data);
		await this.device_markers.setup();
	}
	
	setup_print_export() {
		L.easyPrint({
			title: "Export as image",
			position: "topleft",
			exportOnly: true,
			sizeModes: [
				"A4Portrait",
				"A4Landscape",
				"Current",
				{
					width: 3308,
					height: 2339,
					name: "HiRes Landscape",
					className: 'HiResLandscape',
					tooltip: 'HiRes Landscape'
				}
			],
			defaultSizeTitles: {
				Current: 'Current Size',
				A4Landscape: 'A4 Landscape',
				A4Portrait: 'A4 Portrait',
				HiResLandscape: 'HiRes Landscape'
			}
		}).addTo(this.map);
	}
	
	setup_layer_control() {
		this.layer_control = L.control.layers({
			// Base layer(s)
			"OpenStreetMap": this.layer_openstreet
		}, { // Overlay(s)
			"Devices": this.device_markers.layer,
			// "Heatmap": this.overlay.layer
		}, { // Options
			
		});
		this.layer_control.addTo(this.map);
	}
}

export default MapManager;
