"use strict";

// Import leaflet, but some plugins require it to have the variable name 'L' :-/
import L from 'leaflet';
import 'leaflet-fullscreen';
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
			fullscreenControl: true,
			timeDimension: true,
			timeDimensionOptions: {
				timeInterval: `2019-01-01/${(new Date()).toISOString().split("T")[0]}`,
				period: "PT6M" // 6 minutes, in ISO 8601 Durations format: https://en.wikipedia.org/wiki/ISO_8601#Durations
			}
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
		
		
		// Load the device information
		this.device_data = new DeviceData();
		await this.device_data.setup();
		console.log("[map] Device data loaded");
		
		// Add the device markers
		console.info("[map] Loading device markers....");
		this.setup_device_markers()
			.then(() => console.info("[map] Device markers loaded successfully."))
			.then(this.setup_layer_control.bind(this));
		
		// Add the heatmap
		// console.info("[map] Loading heatmap....");
		// this.setup_heatmap()
		// 	.then(() => console.info("[map] Heatmap loaded successfully."))
		// 	// ...and the time dimension
		// 	.then(this.setup_time_dimension.bind(this))
		// 	.then(() => console.info("[map] Time dimension initialised."));
		
		this.ui = new UI(Config, this);
		this.ui.setup().then(() => console.log("[map] Settings initialised."));
		this.setup_overlay();
	}
	
	setup_overlay() {
		this.overlay = new VoronoiManager(this.device_data, this.map);
	}
	
	setup_time_dimension() {
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
	
	async setup_heatmap() {
		this.heatmap = new LayerHeatmap(this.map, this.device_data);
		
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
			// "Heatmap": this.heatmap.layer
		}, { // Options
			
		});
		this.layer_control.addTo(this.map);
	}
}

export default MapManager;
