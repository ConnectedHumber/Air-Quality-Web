"use strict";

import SmartSettings from 'smartsettings';

import Config from './Config.mjs';
import GetFromUrl from './Helpers/GetFromUrl.mjs';

class UI {
	constructor(in_config, in_map_manager) {
		this.config = in_config;
		this.map_manager = in_map_manager;
		
		this.ui_panel = new SmartSettings("Settings");
		// this.ui_panel.watch((event) => console.log(event));
	}
	
	async setup() {
		this.reading_types = JSON.parse(
			await GetFromUrl(`${this.config.api_root}?action=list-reading-types`)
		);
		
		this.ui_panel.loadConfig([
			{
				type: "range",
				name: "Heatmap Blob Radius",
				help: "The radius of blobs on the heatmap.",
				items: [
					0.001,		// min
					0.05,	// max
					Config.heatmap.blob_radius,		// initial value
					0.001	// step
				],
				callback: ((event) => {
					this.map_manager.heatmap.overlay_config.radius = parseFloat(event.target.value);
				}).bind(this)
			},
			{
				// TODO: Add a setting for the different reading types here
				type: "select",
				items: this.reading_types.map((type) => type.friendly_text)
			}
		]);
	}
}

export default UI;
