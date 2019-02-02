"use strict";

import L from 'leaflet';
import 'leaflet.markercluster';
// import CreateElement from 'dom-create-element-query-selector';
// We're using the git repo for now until an update is released, and rollup doesn't like that apparently
import CreateElement from '../../node_modules/dom-create-element-query-selector/src/index.js';
import tabs from 'tabs';

import Config from './Config.mjs';
import DeviceReadingDisplay from './DeviceReadingDisplay.mjs';
import GetFromUrl from './Helpers/GetFromUrl.mjs';

class LayerDeviceMarkers {
	constructor(in_map) {
		this.map = in_map;
		
		// Create a new clustering layer
		this.layer = L.markerClusterGroup();
	}
	
	async setup() {
		
		// Fetch the device list
		let device_list = JSON.parse(await GetFromUrl(
			`${Config.api_root}?action=list-devices&only-with-location=yes`
		));
		
		// Add a marker for each device
		for (let device of device_list) {
			this.add_device_marker(device);
		}
		
		// Display this layer
		this.map.addLayer(this.layer);
	}
	
	add_device_marker(device) {
		// Create the marker
		let marker = L.marker(
			L.latLng(device.latitude, device.longitude),
			{ // See https://leafletjs.com/reference-1.4.0.html#marker
				title: `Device: ${device.name}`,
				autoPan: true,
				autoPanPadding: L.point(100, 100)
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
			throw new Exception("Error: Invalid device id passed.");
		
		console.info("Fetching device info for device", device_id);
		let device_info = JSON.parse(await GetFromUrl(`${Config.api_root}?action=device-info&device-id=${device_id}`));
		
		device_info.location = [ device_info.latitude, device_info.longitude ];
		delete device_info.latitude;
		delete device_info.longitude;
		
		event.popup.setContent(this.render_device_info(device_info));
	}
	
	render_device_info(device_info) {
		let result = document.createDocumentFragment();
		
		// ----------------------------------
		
		result.appendChild(CreateElement("h2.device-name",
			`Device: ${device_info.name}`
		));
		result.querySelector(".device-name").dataset.id = device_info.id;
		
		
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
