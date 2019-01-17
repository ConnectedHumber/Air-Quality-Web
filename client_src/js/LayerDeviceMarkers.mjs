"use strict";

import L from 'leaflet';
import 'leaflet.markercluster';

import Config from './Config.mjs';
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
		let marker = L.marker(
			L.latLng(device.latitude, device.longitude),
			{ // See https://leafletjs.com/reference-1.4.0.html#marker
				title: `Device: ${device.name}`,
				autoPan: true,
				autoPanPadding: L.point(100, 100)
			}
		);
		this.layer.addLayer(marker);
	}
}

export default LayerDeviceMarkers;
