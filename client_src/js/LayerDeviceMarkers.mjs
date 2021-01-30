"use strict";

import L from 'leaflet';
import 'leaflet.markercluster';
// import CreateElement from 'dom-create-element-query-selector';
// We're using the git repo for now until an update is released, and rollup doesn't like that apparently
import CreateElement from '../../node_modules/dom-create-element-query-selector/src/index.js';
import tabs from 'tabs';
import Emitter from 'event-emitter-es6';

import Config from './Config.mjs';
import DeviceReadingDisplay from './DeviceReadingDisplay.mjs';
import MarkerGenerator from './MarkerGenerator.mjs';
import GetFromUrl from './Helpers/GetFromUrl.mjs';
import { human_time_since } from './Helpers/DateHelper.mjs';

class LayerDeviceMarkers extends Emitter {
	constructor(in_map_manager, in_device_data) {
		super();
		
		this.map_manager = in_map_manager;
		this.device_data = in_device_data;
		
		this.marker_generator = new MarkerGenerator();
		
		// Create a new clustering layer
		this.layer = null;
	}
	
	/**
	 * Performs initial setup of the device markers layer.
	 * @return	{Promise}	A Promise that resolves when the initial setup is complete
	 */
	async setup() {
		await this.update_markers(Config.default_reading_type, "now");
	}
	
	/**
	 * Replaces all existing device markers (if any) with those for a given
	 * reading type and datetime.
	 * @param	{string}		reading_type		The reading type to use to colour the markers.
	 * @param	{String|Date}	[datetime="now"]	The datetime of the data to use to colour the markers (default: the special keyword "now", which indicates to fetch data for the current time)
	 * @return	{Promise}		A Promise that resolves when the markers have been updated.
	 */
	async update_markers(reading_type, datetime = "now") {
		// 1: Remove the old layer, if present
		// --------------------------------------------------------------------
		if(this.layer !== null)
			this.map_manager.map.removeLayer(this.layer);
		
		// 2: Create a new layer
		// --------------------------------------------------------------------
		this.layer = L.markerClusterGroup({
		// this.layer = L.layerGroup({
			zoomToBoundsOnClick: false
		});
		
		// 3: Fetch the latest readings data
		// --------------------------------------------------------------------
		let device_values;
		try {
			device_values = await this.map_manager.readings_data.fetch(reading_type, datetime);
		}
		catch(error) {
			alert(error);
			device_values = new Map();
		}
		
		// 4: Add a marker for each device
		// --------------------------------------------------------------------
		let has_data = 0, has_no_data = 0, total = 0;
		for (let device of this.device_data.devices) {
			// If the device doesn't have a location, we're not interested
			// FUTURE: We might be able to display mobile devices by adding additional logic here
			if(typeof device.latitude != "number" || typeof device.longitude != "number")
				continue;
			
			console.log(`[LayerDeviceMarkers] id =`, device.id, `name =`, device.name, `location: (`, device.latitude, `,`, device.longitude, `)`);
			
			if(device_values.has(device.id)) {
				this.add_device_marker(device, reading_type, device_values.get(device.id).value);
				console.log(`has value`);
				has_data++;
			}
			else {
				this.add_device_marker(device, "unknown");
				console.log(`doesn't have value`);
				has_no_data++;
			}
			
			total++;
		}
		console.log(`[LayerDeviceMarkers] has_data`, has_data, `has_no_data`, has_no_data, `total`, total);
		
		// 5: Display the new layer
		// --------------------------------------------------------------------
		this.map_manager.map.addLayer(this.layer);
	}
	
	/**
	 * Adds a single device marker with a given reading type and value.
	 * @param	{Object}	device			The object representing the device to add.
	 * @param	{string}	reading_type	The reading type to use when colouring the marker. The special "unknown" reading type causes a default blue marker to be shown (regardless of the value passed).
	 * @param	{number}	value			The reading value to use when colouring the marker.
	 */
	add_device_marker(device, reading_type, value) {
		let icon;
		if(reading_type !== "unknown") {
			icon = L.divIcon({
				className: "device-marker-icon",
				html: this.marker_generator.marker(value, reading_type),
				iconSize: L.point(17.418, 27.508),
				iconAnchor: L.point(8.71, 27.16)
			});
			console.log(`[LayerDeviceMarkers/add_device_marker] got value`);
		}
		else {
			icon = L.divIcon({
				className: "device-marker-icon icon-unknown",
				html: this.marker_generator.marker_default(),
				iconSize: L.point(17.418, 27.508),
				iconAnchor: L.point(8.71, 27.16)
			});
			console.log(`[LayerDeviceMarkers/add_device_marker] unknown value`);
		}
		
		// Create the marker
		let marker = L.marker(
			L.latLng(device.latitude, device.longitude),
			{ // See https://leafletjs.com/reference-1.4.0.html#marker
				title: `Device: ${device.name}`,
				autoPan: true,
				autoPanPadding: L.point(100, 100),
				icon
			}
		);
		// Create the popup
		let popup = L.popup({
			className: "popup-device",
			maxWidth: 640,
			autoPanPadding: L.point(100, 100)
		}).setContent("&#x231b; Loading..."); // TODO: Display a nice loading animation here
		marker.on("popupopen", this.marker_popup_open_handler.bind(this, device.id));
		
		marker.bindPopup(popup);
		
		this.layer.addLayer(marker);
	}
	
	async marker_popup_open_handler(device_id, event) {
		if(typeof device_id !== "number")
			throw new Error("Error: Invalid device id passed.");
		
		console.info("Fetching device info for device", device_id);
		let device_info = JSON.parse(await GetFromUrl(`${Config.api_root}?action=device-info&device-id=${device_id}`));
		
		device_info.last_seen = new Date(`${device_info.last_seen}+0000`); // Force parsing as UTC
		device_info.location = [ device_info.latitude, device_info.longitude ];
		delete device_info.latitude;
		delete device_info.longitude;
		
		event.popup.setContent(this.render_device_info(device_info));
		
		this.emit("marker-popup-opened");
	}
	
	render_device_info(device_info) {
		let result = document.createDocumentFragment();
		
		// ----------------------------------
		
		result.appendChild(CreateElement("h2.device-name",
			`Device: ${device_info.name}`
		));
		result.querySelector(".device-name").dataset.id = device_info.id;
		result.querySelector(".device-name").dataset.last_seen = device_info.last_seen;
		result.querySelector(".device-name").dataset.minutes_ago = human_time_since(device_info.last_seen);
		
		
		// ----------------------------------
		
		// Select a tab by default
		window.location = "#tab-data";
		
		let tabContainer = CreateElement("div.tab-container",
			CreateElement("ul.tabs",
				CreateElement("li", CreateElement("a.tab", "Info")),
				CreateElement("li", CreateElement("a.tab.active", "Data"))
			),
			CreateElement("div.tab-panes",
				CreateElement("div.device-params.tab-pane")
				// The tab pane for the graph is added dynamically below
			)
		);
		result.appendChild(tabContainer);
		
		// ----------------------------------
		
		let params_container = tabContainer.querySelector(".device-params");
		
		let info_list = [];
		for(let property in device_info) {
			// Filter out properties we're handling specially
			if(["id", "name", "other"].includes(property)) continue;
			
			
			// Ensure the property is a string - giving special handling to 
			// some property values
			let value = device_info[property];
			
			if(typeof value == "undefined" || value === null)
				value = "(not specified)";
			
			// If the value isn't a string, but is still 'truthy'
			if(typeof value != "string") {
				switch(property) {
					case "location":
						value = `(${value[0]}, ${value[1]})`;
						break;
					case "sensors":
						value = CreateElement("table", 
							...value.map((sensor) => CreateElement("tr",
								CreateElement("td", sensor.type),
								CreateElement("td", sensor.description)
							))
						);
						break;
					default: value = value.toString(); break;
				}
			}
			
			info_list.push(CreateElement(
				"tr.device-property",
				CreateElement("th.name", property.split("_").map((word) => word[0].toUpperCase()+word.slice(1)).join(" ")),
				CreateElement("td.value", value)
			));
		}
		params_container.appendChild(
			CreateElement("table.device-property-table", ...info_list)
		);
		
		params_container.appendChild(CreateElement("p.device-notes",
			CreateElement("em", device_info.other || "")
		));
		
		// ----------------------------------
		
		let chart_device_data = new DeviceReadingDisplay(Config, device_info.id);
		chart_device_data.setup("PM25").then(() => 
			console.info("[layer/markers] Device chart setup complete!")
		);
		chart_device_data.display.classList.add("tab-pane", "active");
		tabContainer.querySelector(".tab-panes").appendChild(chart_device_data.display);
		
		
		tabs(tabContainer);
		
		// ----------------------------------
		
		return result;
	}
}

export default LayerDeviceMarkers;
