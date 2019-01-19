"use strict";

// import CreateElement from 'dom-create-element-query-selector';
// We're using the git repo for now until an update is released, and rollup doesn't like that apparently
import CreateElement from '../../node_modules/dom-create-element-query-selector/src/index.js';

import Chart from 'chart.js';

import GetFromUrl from './Helpers/GetFromUrl.mjs';


class DeviceReadingDisplay {
	get device_id() { return this._device_id; }
	set device_id(value) {
		this._device_id = value;
		this.update_display();
	}
	
	constructor(in_config, in_device_id) {
		this.setup_display();
		
		this.config = in_config;
		this._device_id = in_device_id; // We don't want to update until we have everything we need
	}
	
	setup_display() {
		this.display = CreateElement("div.chart-device-data",
			CreateElement("canvas.canvas-chart"),
			CreateElement("ul.reading-types")
		);
	}
	set_reading_types(new_reading_types, starting_index) {
		this.reading_types = new_reading_types;
		this.selected_reading_type = this.reading_types[starting_index];
	}
	
	async update_display() {
		let new_data = JSON.parse(await GetFromUrl(`${this.config.api_root}?action=`))
	}
}

export default DeviceReadingDisplay;
