"use strict";

import Config from './Config.mjs';

import GetFromUrl from './Helpers/GetFromUrl.mjs';

/**
 * Handles and caches data about devices.
 */
class DeviceData {
	/**
	 * Creates a new DeviceData class instance.
	 */
	constructor() {
		this.devices = [];
	}
	
	/**
	 * Fetches the device data from the server.
	 * @return {Promise} A promise that resolves when the data has been fetched from the server.
	 */
	async setup() {
		this.devices = JSON.parse(await GetFromUrl(
			`${Config.api_root}?action=list-devices`
		));
		
		// Create a map to help us lookup ids faster
		this.device_map = new Map();
		for(let device of this.devices) {
			// Parse the last_seen date into a JS date object
			device.last_seen = new Date(device.last_seen);
			// Add the device to the device map
			this.device_map.set(device.id, device);
		}
	}
	
	/**
	 * Looks up a device by its id.
	 * @param	{Number}	device_id	The ID of the device to return 
	 * @return	{object}	The info about the device with the specified id.
	 */
	get_by_id(device_id) {
		return this.device_map.get(device_id);
	}
}

export default DeviceData;
