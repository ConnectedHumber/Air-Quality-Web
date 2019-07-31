"use strict";

import chroma from 'chroma-js';

import Config from '../Config.mjs';

import VoronoiOverlay from './VoronoiOverlay.mjs';
import VoronoiCell from './VoronoiCell.mjs';

import Guage from '../Guage.mjs';
import Specs from './OverlaySpecs.mjs';

import Vector2 from '../Helpers/Vector2.mjs';
import GetFromUrl from '../Helpers/GetFromUrl.mjs';
import { round_date_interval } from '../Helpers/DateHelper.mjs';

class VoronoiManager {
	
	constructor(in_device_data, in_map) {
		this.device_data = in_device_data;
		this.map = in_map;
		
		this.layer = null;
		
		this.last_datetime = new Date();
		this.last_reading_type = "PM25";
	}
	
	async setup() {
		this.setup_guage();
		await this.setup_overlay();
	}
	
	async setup_overlay() {
		this.overlay = new VoronoiOverlay();
		await this.set_data(new Date(), "PM25"); // TODO: Make this customisable? Probably elsewhere though, as this is a reasonable default
	}
	
	setup_guage() {
		this.guage = new Guage(document.getElementById("canvas-guage"));
	}
	
	// ------------------------------------------------------------------------
	
	async update_reading_type(new_reading_type) {
		await this.set_data(this.last_datetime, new_reading_type);
	}
	async update_datetime(new_datetime) {
		await this.set_data(new_datetime, this.last_reading_type);
	}
	
	async set_data(datetime, reading_type) {
		this.last_datetime = datetime;
		this.last_reading_type = reading_type;
		
		round_date_interval(this.last_datetime, Config.date_rounding_interval);
		
		this.spec = Specs[reading_type] || Specs["unknown"];
		if(typeof this.spec.chroma == "undefined")
			this.spec.chroma = chroma.scale(Object.values(this.spec.gradient))
				.domain(Object.keys(this.spec.gradient));
		this.guage.set_spec(this.spec);
		this.guage.render();
		
		
		let dataset = null;
		try {
			dataset = JSON.parse(await GetFromUrl(
				`${Config.api_root}?action=fetch-data&datetime=${encodeURIComponent(datetime.toISOString())}&reading_type=${encodeURIComponent(reading_type)}`
			));
		}
		catch(error) { // string
			document.querySelector("main").classList.remove("working-visual");
			alert(error);
			throw new Error(error);
		}
		
		let result = [];
		for(let row of dataset) {
			let device = this.device_data.get_by_id(row.device_id);
			if(typeof device.latitude != "number" || typeof device.longitude != "number")
				continue;
			result.push(new VoronoiCell(
				new Vector2(
					device.longitude,
					device.latitude
				),
				// See https://gka.github.io/chroma.js/
				this.spec.chroma(row.value).toString()
			));
		}
		
		this.overlay.set_cells(result);
		
		if(this.layer !== null)
			this.layer.remove(); // Remove the old layer if it exists
		// Generate & add the new layer
		this.layer = this.overlay.generate_layer();
		this.layer.addTo(this.map);
	}
}

export default VoronoiManager;
