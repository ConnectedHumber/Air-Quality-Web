"use strict";

// import CreateElement from 'dom-create-element-query-selector';
// We're using the git repo for now until an update is released, and rollup doesn't like that apparently
import CreateElement from '../../node_modules/dom-create-element-query-selector/src/index.js';

import moment from 'moment';
// import Chart from 'chart.js';
// Chart.js pollutes the global scope, but the main entry point is going to change soon in v2.8 - which should fix our issue here
import Chart from '../../node_modules/chart.js/dist/Chart.bundle.min.js';

import GetFromUrl from './Helpers/GetFromUrl.mjs';
import GetContainingElement from './Helpers/GetContainingElement.mjs';
import Postify from './Helpers/Postify.mjs';


class DeviceReadingDisplay {
	constructor(in_config, in_device_id) {
		this.config = in_config;
		/** The ID of the device to display a graph for. @type {int} */
		this.device_id = in_device_id;
		/** The current reading type to display a graph for. @type {Object} */
		this.reading_type = null;
		
		// The number of points to display at a time.
		this.points_resolution = 50;
		
		this.start_time = moment().subtract(1, "days");
		this.end_time = moment();
		
		
		this.default_colours = {
			borderColor: "hsla(0, 0%, 50%, 1)",
			backgroundColor: "hsla(0, 0%, 65%, 0.5)"
		};
		this.reading_type_defs = {
			"PM10": {
				suggestedMin: 0,
				suggestedMax: 110,
				borderColor: "hsla(0, 82%, 56%, 1)",
				backgroundColor: "hsla(14, 94%, 71%, 0.57)"
			},
			"PM25": {
				suggestedMin: 0,
				suggestedMax: 75,
				borderColor: "hsla(33, 70%, 51%, 1)",
				backgroundColor: "hsla(28, 77%, 58%, 0.63)"
			},
			"temperature": {
				suggestedMin: 0,
				suggestedMax: 20,
				borderColor: "hsla(0, 77%, 45%, 1)",
				backgroundColor: "hsla(0, 61%, 58%, 0.59)"
			},
			"humidity": {
				suggestedMin: 0,
				suggestedMax: 100,
				borderColor: "hsla(184, 69%, 40%, 1)",
				backgroundColor: "hsla(188, 53%, 46%, 0.58)"
			},
			"pressure": {
				borderColor: "hsla(258, 67%, 40%, 1)",
				backgroundColor: "hsla(249, 56%, 40%, 0.66)"
			}
		};
	}
	
	async setup(default_reading_type) {
		// 1: Display window HTML
		// ----------------------------------------------------
		
		// Create the display element first, as we need it to be immediately available for inclusion in the popup window
		
		/** @type {HTMLElement} */
		this.display = CreateElement("div.chart-device-data.working",
			CreateElement("canvas.canvas-chart"),
			CreateElement("ul.reading-types.button-array"),
			CreateElement("ul.quick-time-selector.button-array",
				CreateElement("li", CreateElement("button[data-timelength=1h]", "1 hour")),
				CreateElement("li", CreateElement("button[data-timelength=6h]", "6 hours")),
				CreateElement("li", CreateElement("button[data-timelength=1d].selected", "1 day")),
				CreateElement("li", CreateElement("button[data-timelength=1w]", "1 week")),
				CreateElement("li", CreateElement("button[data-timelength=1M]", "1 month")),
				CreateElement("li", CreateElement("button[data-timelength=3M]", "3 months")),
				CreateElement("li", CreateElement("button[data-timelength=1y]", "1 year"))
			),
			CreateElement("ul.adv-time-selector.button-array",
				CreateElement("li", CreateElement("button.timeinterval.prev[title=Previous Time Interval]", "«")),
				CreateElement("li", CreateElement("input.time-start-date[type=date]")),
				CreateElement("li", CreateElement("input.time-start-time[type=time]")),
				CreateElement("li", "—"),
				CreateElement("li", CreateElement("input.time-end-date[type=date]")),
				CreateElement("li", CreateElement("input.time-end-time[type=time]")),
				CreateElement("li", CreateElement("button.timeinterval.next[title=Next Time Interval]", "»"))
			)
		);
		
		
		// 2: Measurement type buttons
		// ----------------------------------------------------
		
		this.reading_types = await this.fetch_reading_types();
		this.reading_type = this.reading_types.find((type) => type.short_descr == default_reading_type);
		// Default to the 1st reading type if we can't find the default
		if(typeof this.reading_type == "undefined")
			this.reading_type = this.reading_types[0];
		
		// Create the reading type buttons
		let reading_type_list = this.display.querySelector(".reading-types");
		for(let reading_type of this.reading_types) {
			let new_element = CreateElement("li",
				CreateElement("button", reading_type.friendly_text)
			);
			let button = new_element.querySelector("button");
			if(reading_type.id == this.reading_type.id)
				button.classList.add("selected");
			button.addEventListener("click", this.switch_graph_type_handler.bind(this));
			
			new_element.dataset.id = reading_type.id;
			reading_type_list.appendChild(new_element);
		}
		
		
		// 2.5: Advanced time picker
		// ----------------------------------------------------
		this.set_adv_timepicker_ui(this.start_time, this.end_time);
		
		
		// 3: Event listeners
		// ----------------------------------------------------
		
		this.display.querySelector(".quick-time-selector")
			.addEventListener("click", (this.timelength_button_click_handler).bind(this));
		this.display.querySelector(".timeinterval.prev")
			.addEventListener("click", this.timeinterval_button_click_handler.bind(this));
		this.display.querySelector(".timeinterval.next")
			.addEventListener("click", this.timeinterval_button_click_handler.bind(this));
		
		this.display.querySelectorAll(".adv-time-selector input").forEach(((el) => {
			el.addEventListener("input", this.adv_timepicker_ui_click_handler.bind(this));
		}).bind(this));
		
		
		// 4: Chart and ending tasks
		// ----------------------------------------------------
		
		// Setup the chart itself
		await this.setup_chart();
		
		this.display.classList.remove("working");
	}
	
	/**
	 * Updates the advanced time picker UI with the specified start and end dates.
	 * The supplied start & end datetimes should Moment.js instances.
	 * @param	{moment}	start_time	The start datetime to display.
	 * @param	{moment}	end_time	The end datetime to display.
	 */
	set_adv_timepicker_ui(start_time, end_time) {
		this.display.querySelector(".time-start-date").value = start_time.format("YYYY-MM-DD");
		this.display.querySelector(".time-start-time").value = start_time.format("HH:mm");
		
		this.display.querySelector(".time-end-date").value = end_time.format("YYYY-MM-DD");
		this.display.querySelector(".time-end-time").value = end_time.format("HH:mm");
	}
	
	/**
	 * Handles events from advanced time picker UI elements.
	 */
	async adv_timepicker_ui_click_handler() {
		let el_start_date = this.display.querySelector("input.time-start-date"),
			el_start_time = this.display.querySelector("input.time-start-time"),
			el_end_date = this.display.querySelector("input.time-end-date"),
			el_end_time = this.display.querySelector("input.time-end-time");
		
		this.start_time = moment(`${el_start_date.value} ${el_start_time.value}`);
		this.end_time = moment(`${el_end_date.value} ${el_end_time.value}`);
		
		await this.update_chart();
	}
	
	async timeinterval_button_click_handler(event) {
		let diff_seconds = this.end_time.diff(this.start_time) / 1000;
		if(event.target.classList.contains("prev")) {
			this.start_time.subtract(diff_seconds, "seconds");
			this.end_time.subtract(diff_seconds, "seconds");
		}
		else if(event.target.classList.contains("next")) {
			this.start_time.add(diff_seconds, "seconds");
			this.end_time.add(diff_seconds, "seconds");
		}
		else {
			throw new Error("Error: Failed to adjust time interval, as we couldn't tell which direction to go in.");
		}
		
		this.set_adv_timepicker_ui(this.start_time, this.end_time);
		await this.update_chart();
	}
	
	async timelength_button_click_handler(event) {
		let timelength = event.target.dataset.timelength;
		if(typeof timelength == "undefined")
			return;
		
		let time_unit = timelength.replace(/[0-9]+/g, "");
		let time_length = timelength.replace(/[^0-9]+/g, "");
		
		this.start_time = moment().subtract(time_length, time_unit);
		this.end_time = moment();
		
		this.set_adv_timepicker_ui(this.start_time, this.end_time);
		
		let popup_container = GetContainingElement(event.target, "div");
		
		popup_container.classList.add("working");
		
		await this.update_chart();
		
		// Show the new button to be selected
		this.display.querySelectorAll(".quick-time-selector button").forEach((button) => button.classList.remove("selected"));
		event.target.classList.add("selected");
		
		popup_container.classList.remove("working");
	}
	
	async setup_chart() {
		this.chart = new Chart(this.display.querySelector("canvas").getContext("2d"), {
			type: "line",
			data: {
				// We need to define an initial dataset here because otherwise
				// Chart.js gets confused 'cause it has nothing to animate from
				// labels: [],
				datasets: []
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
						ticks: { },
						scaleLabel: {
							display: true,
							labelString: "Value"
						}
					}]
				}
			}
		});
		
		await this.update_chart();
	}
	
	async get_data() {
		let new_data = null;
		// Dividing by 1000: ms -> s
		let average_seconds = (this.end_time.diff(this.start_time) / 1000) / this.points_resolution;
		console.info("Requesting data with start", this.start_time.toString(), ", end", this.end_time.toString(), ", average-seconds", average_seconds);
		try {
			new_data = JSON.parse(await GetFromUrl(`${this.config.api_root}?` + Postify({
				action: "device-data",
				"device-id": this.device_id,
				"reading-type": this.reading_type.short_descr,
				start: this.start_time.toISOString(),
				end: this.end_time.toISOString(),
				"average-seconds": average_seconds
			})));
		} catch(error) {
			// TODO: Display a nice error message here instead of an alert()
			// Wrap it in an Error instance if needed
			if(typeof error == "string")
				error = new Error(error.length == 0 ? "An unknown error has ocurred. It's probably on the server." : error);
			
			alert(error.message);
			console.error(error);
			return null;
		}
		
		console.log("[marker/popup/device-graph] Fetched data:", new_data);
		console.log("[marker/popup/device-graph] Point count:", new_data.length);
		
		return new_data.map((data_point) => { return {
			t: moment(data_point.datetime),
			y: Math.round(data_point.value*10000)/10000
		}});
	}
	
	async fetch_reading_types() {
		return JSON.parse(await GetFromUrl(`${this.config.api_root}?action=list-reading-types&device-id=${this.device_id}`));
	}
	
	async switch_graph_type_handler(event) {
		// Figure out what the new reading type is
		this.reading_type = this.reading_types.find((type) => type.id == event.target.parentNode.dataset.id);
		
		console.log("[marker/device-graph] Reading type is now", this.reading_type);
		
		let popup_container = GetContainingElement(event.target, "div");
		popup_container.classList.add("working");
		
		// Update the button list to highlight the newly-selected reading type, but only if we managed to update the chart successfully
		if(await this.update_chart()) {
			// Remove the selected class from the old one(s?)
			event.target.parentNode.parentNode.querySelectorAll(`button`)
				.forEach((next_button) => next_button.classList.remove("selected"));
			
			// Add the selected class to the new one
			event.target.classList.add("selected");
		}
		
		popup_container.classList.remove("working");
	}
	
	async update_chart() {
		this.chart.data.datasets.length = 0;
		
		// Get the Chart.js data object
		let new_data_obj = {
			label: this.reading_type.friendly_text,
			data: await this.get_data()
		};
		
		if(new_data_obj.data == null) return false;
		
		// Update the colour & suggested min/max values
		let def = this.reading_type_defs[this.reading_type.short_descr],
			y_axis = this.chart.options.scales.yAxes[0];
		if(typeof def !== "undefined") {
			new_data_obj.borderColor = def.borderColor;
			new_data_obj.backgroundColor = def.backgroundColor;
		}
		else {
			new_data_obj.borderColor = this.default_colours.borderColor;
			new_data_obj.backgroundColor = this.default_colours.backgroundColor;
		}
		if(typeof def !== "undefined" && typeof def.suggestedMin !== "undefined") {
			y_axis.ticks.suggestedMin = def.suggestedMin;
			y_axis.ticks.suggestedMax = def.suggestedMax;
		}
		else {
			delete y_axis.ticks.suggestedMin;
			delete y_axis.ticks.suggestedMax;
		}
		
		this.chart.data.datasets.push(new_data_obj);
		
		// Update the x axis labels
		// this.chart.data.labels = new_data_obj.data.map((point) => point.t);
		
		// Update the chart
		this.chart.update();
		
		return true;
	}
}

export default DeviceReadingDisplay;
