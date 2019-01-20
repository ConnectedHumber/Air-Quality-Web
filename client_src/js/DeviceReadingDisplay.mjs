"use strict";

// import CreateElement from 'dom-create-element-query-selector';
// We're using the git repo for now until an update is released, and rollup doesn't like that apparently
import CreateElement from '../../node_modules/dom-create-element-query-selector/src/index.js';

import moment from 'moment';
// import Chart from 'chart.js';
// Chart.js pollutes the global scope, but the main entry point is going to change soon in v2.8 - which should fix our issue here
import Chart from '../../node_modules/chart.js/dist/Chart.bundle.min.js';

import GetFromUrl from './Helpers/GetFromUrl.mjs';
import Postify from './Helpers/Postify.mjs';


class DeviceReadingDisplay {
	constructor(in_config, in_device_id) {
		this.config = in_config;
		/** The ID of the device to display a graph for. @type {int} */
		this.device_id = in_device_id;
		/** The current reading type to display a graph for. @type {Object} */
		this.reading_type = null;
		
		this.reading_type_colours = {
			"PM10": {
				borderColor: "hsla(0, 82%, 56%, 1)",
				backgroundColor: "hsla(14, 94%, 71%, 0.57)"
			},
			"PM25": {
				borderColor: "hsla(33, 70%, 51%, 1)",
				backgroundColor: "hsla(28, 77%, 58%, 0.63)"
			},
			"temperature": {
				borderColor: "hsla(0, 77%, 45%, 1)",
				backgroundColor: "hsla(0, 61%, 58%, 0.59)"
			},
			"humidity": {
				borderColor: "hsla(184, 69%, 40%, 1)",
				backgroundColor: "hsla(188, 53%, 46%, 0.58)"
			},
			"pressure": {
				borderColor: "hsla(258, 67%, 40%, 1)",
				backgroundColor: "hsla(249, 56%, 40%, 0.66)"
			}
		}
	}
	
	async setup(default_reading_type) {
		// Create the display element first, as we need it to be immediately available for inclusion in the popup window
		
		/** @type {HTMLElement} */
		this.display = CreateElement("div.chart-device-data",
			CreateElement("canvas.canvas-chart"),
			CreateElement("ul.reading-types")
		);
		
		await this.fetch_reading_types();
		this.reading_type = this.reading_types.find((type) => type.id == default_reading_type);
		
		let reading_type_list = this.display.querySelector(".reading-types");
		for(let reading_type of this.reading_types) {
			let new_element = CreateElement("li",
				CreateElement("button", reading_type.friendly_text)
			);
			if(reading_type.id == this.reading_type.id)
				new_element.querySelector("button").classList.add("selected");
			
			new_element.dataset.id = reading_type.id;
			reading_type_list.appendChild(new_element);
		}
		
		// ----------------------------------------------------
		
		let data = null;
		try {
			data = await this.get_data();
		} catch(error) {
			// TODO: Display a nice error message here instead of an alert()
			alert(error);
			console.error(error);
			return false;
		}
		
		this.setup_chart(data);
	}
	
	setup_chart(data) {
		console.log("[marker/popup/device-graph] Data:", data);
		this.chart = new Chart(
			this.display.querySelector("canvas").getContext("2d"), {
				type: "line",
				data: {
					labels: data.map((point) => point.t),
					datasets: [{
						borderColor: this.reading_type_colours[this.reading_type.id].borderColor,
						backgroundColor: this.reading_type_colours[this.reading_type.id].backgroundColor,
						
						label: this.reading_type.friendly_text,
						data
					}]
				},
				options: {
					scales: {
						xAxes: [{
							type: "time",
							time: {
								format: "YYYY-MM-DD HH:mm",
								tooltipFormat: 'll HH:mm'
							},
							scaleLabel: {
								display: true,
								labelString: "Time"
							}
						}],
						yAxes: [{
							scaleLabel: {
								display: true,
								labelString: "Value"
							}
						}]
					}
				}
			}
		);
	}
	
	async get_data() {
		let new_data = JSON.parse(await GetFromUrl(`${this.config.api_root}?` + Postify({
			action: "device-data",
			"device-id": this.device_id,
			"reading-type": this.reading_type.id,
			start: moment().subtract(1, "days").toISOString(),
			end: moment().toISOString(),
			"average-seconds": 3600
		})));
		
		return new_data.map((data_point) => { return {
			t: moment(data_point.datetime),
			y: Math.round(data_point.value*10000)/10000
		}});
	}
	
	async fetch_reading_types() {
		this.reading_types = JSON.parse(await GetFromUrl(`${this.config.api_root}?action=list-reading-types`));
	}
}

export default DeviceReadingDisplay;
