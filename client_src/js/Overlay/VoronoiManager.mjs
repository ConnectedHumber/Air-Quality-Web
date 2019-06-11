"use strict";

import VoronoiOverlay from './VoronoiOverlay.mjs';
import VoronoiCell from './VoronoiCell.mjs';

import Guage from '../Guage.mjs';
import Specs from './OverlaySpecs.mjs';

import Vector2 from '../Helpers/Vector2.mjs';
import GetFromUrl from '../Helpers/GetFromUrl.mjs';

class VoronoiManager {
	get layer() { return this.overlay.layer; }
	
	constructor(in_device_data, map) {
		this.device_data = in_device_data;
		
		this.setup_overlay(map);
		this.setup_guage();
	}
	
	setup_overlay(map) {
		this.overlay = new VoronoiOverlay();
		this.overlay.addCells(...this.device_data.devices
			.filter((device) => typeof device.latitude == "number" &&
				typeof device.longitude == "number")
			.map((device) => 
				new VoronoiCell(new Vector2(device.longitude, device.latitude))
			));
		this.overlay.add_to(map);
	}
	
	setup_guage() {
		this.guage = new Guage(document.getElementById("canvas-guage"));
	}
	
	async set_data(datetime, reading_type) {
		this.guage.set_spec(Specs[reading_type]);
		this.guage.render();
		
		let result = JSON.parse(await GetFromUrl(
			`${Config.api_root}?action=fetch-data&datetime=${encodeURIComponent(datetime.toISOString())}&reading_type=${encodeURIComponent(reading_type)}`
		));
		
		console.log(result);
	}
}

export default VoronoiManager;
