"use strict";

// Import leaflet, but some plugins require it to have the variable name 'L' :-/
import L from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-easyprint';
// import '../../node_modules/leaflet-timedimension/dist/leaflet.timedimension.src.withlog.js';

import Config from './Config.mjs';
import LayerDeviceMarkers from './LayerDeviceMarkers.mjs';
import VoronoiManager from './Overlay/VoronoiManager.mjs';
// import LayerHeatmap from './LayerHeatmap.mjs';
// import LayerHeatmapGlue from './LayerHeatmapGlue.mjs';
import DeviceData from './DeviceData.mjs';
import UI from './UI.mjs';

class MapManager {
	constructor() {
		console.log(Config);
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
			
			this.setup_overlay.bind(this)()
				.then(this.setup_layer_control.bind(this))
		]).then(() => document.querySelector("main").classList.remove("working-visual"));
		
		// Add the heatmap
		// console.info("[map] Loading heatmap....");
		// this.setup_heatmap()
		// 	.then(() => console.info("[map] Heatmap loaded successfully."))
		// 	// ...and the time dimension
		// 	.then(this.setup_time_dimension.bind(this))
		// 	.then(() => console.info("[map] Time dimension initialised."));
	}
	
	async setup_overlay() {
		this.overlay = new VoronoiManager(this.device_data, this.map);
		await this.overlay.setup();
		// No need to do this here, as it does it automatically
		// await this.overlay.set_data(new Date(), "PM25");
	}
	
	setup_time_dimension() {
		// FUTURE: Replace leaflet-time-dimension with our own solution that's got a better ui & saner API?
		this.layer_time = new L.TimeDimension({
			period: "PT1H", // 1 hour
			timeInterval: `2019-01-01T12:00:00Z/${new Date().toISOString()}`
		});
		//this.layer_time.on("timeloading", console.log.bind(null, "timeloading"));
		
		this.layer_time_player = new L.TimeDimension.Player({
			transitionTime: 500,
			loop: false,
			startOver: true,
			buffer: 10 // Default: 5
		}, this.layer_time);
		
		this.layer_time_control = new L.Control.TimeDimension({
			player: this.layer_time_player,
			timeDimension: this.layer_time,
			position: "bottomright",
			autoplay: false,
			minSpeed: 1, 
			speedStep: 0.25,
			maxSpeed: 15,
			timeSliderDragUpdate: false
		});
		
		this.map.addControl(this.layer_time_control);
		
		// Create the time dimension <---> heatmap glue object
		this.layer_heatmap_glue = new LayerHeatmapGlue(
			this.layer_time,
			this.heatmap
		);
		this.layer_heatmap_glue.attachTo(this.map);
	}
	
	async setup_device_markers() {
		this.device_markers = new LayerDeviceMarkers(this.map, this.device_data);
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
			// FUTURE: Have 1 heatmap layer per reading type?
			"Heatmap": this.overlay.layer
		}, { // Options
			
		});
		this.layer_control.addTo(this.map);
	}
}

export default MapManager;
