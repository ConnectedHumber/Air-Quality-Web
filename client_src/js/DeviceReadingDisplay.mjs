"use strict";

// import CreateElement from 'dom-create-element-query-selector';
// We're using the git repo for now until an update is released, and rollup doesn't like that apparently
import CreateElement from '../../node_modules/dom-create-element-query-selector/src/index.js';

// import Chart from 'chart.js';

import GetFromUrl from './Helpers/GetFromUrl.mjs';
import Postify from './Helpers/Postify.mjs';


class DeviceReadingDisplay {
	constructor(in_config, in_device_id, in_reading_type) {
		this.config = in_config;
		/** @type {int} */
		this.device_id = in_device_id;
		// TODO: Allow the user to change this
		/** @type {Object} */
		this.reading_type = in_reading_type;
		
		this.setup_display();
	}
	
	async setup_display() {
		/** @type {HTMLElement} */
		this.display = CreateElement("div.chart-device-data",
			CreateElement("canvas.canvas-chart"),
			CreateElement("ul.reading-types")
		);
		
		this.chart = new Chart(
			this.display.querySelector("canvas").getContext("2d"), {
				type: "line",
				data: {
					datasets: [{
						label: this.reading_type.friendly_text,
						data: await this.get_data
					}]
				},
				options: {
					
				}
			}
		);
	}
	
	async get_data() {
		let new_data = JSON.parse(await GetFromUrl(`${this.config.api_root}?` + Postify({
			action: "device-data",
			"device-id": this.device_id,
			"reading-type": this.reading_type.id,
			start: (new Date()).toISOString(),
			end: new Date(new Date - 60*60*24),
			"average-seconds": 3600
		})));
		
		return new_data.map((data_point) => { return {
			x: new Date(data_point.datetime),
			y: data_point.value
		}});
	}
}

export default DeviceReadingDisplay;
