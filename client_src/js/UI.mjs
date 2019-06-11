"use strict";

import SmartSettings from 'smartsettings';
import NanoModal from 'nanomodal';

import Config from './Config.mjs';
import GetFromUrl from './Helpers/GetFromUrl.mjs';

async function show_changelog(only_if_changed) {
	let current_version = `${Config.version}, built ${Config.build_date.toDateString()}`;
	console.log(`[UI] Comparing current '${current_version}' to '${localStorage.getItem("last_seen_version")}'`);
	if(only_if_changed && localStorage.getItem("last_seen_version") == current_version) {
		console.log("[UI] Not showing changelog.");
		return false;
	}
	
	console.log("[UI] Showing changelog");
	NanoModal(
		await GetFromUrl(`${Config.api_root}?action=changelog`)
	).show();
	localStorage.setItem("last_seen_version", current_version);
	return true;
}

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
				items: [
					0.001,		// min
					0.05,	// max
					Config.heatmap.blob_radius,		// initial value
					0.001	// step
				],
				callback: ((event) => {
					this.map_manager.heatmap.overlay_config.radius = parseFloat(event.target.value);
					this.map_manager.heatmap.refresh_display();
				}).bind(this)
			},
			{
				type: "select",
				name: "Reading Type",
				items: this.reading_types.map((type) => type.friendly_text),
				callback: ((event) => {
					let new_type = this.reading_types.find((type) => type.friendly_text == event.target.value).short_descr;
					
					this.map_manager.overlay.update_reading_type(new_type);
				}).bind(this)
			},
			{
				type: "button",
				name: "Report bug",
				callback: ((_event) => {
					window.open("https://github.com/ConnectedHumber/Air-Quality-Web/issues/new", "_blank");
				})
			},
			{
				type: "button",
				name: `${Config.version}, built ${Config.build_date.toDateString()}`,
				callback: (async (_event) => {
					show_changelog(false);
				})
			}
		]);
		this.ui_panel.setIndex("Reading Type", this.reading_types.findIndex((type) => type.short_descr == "PM25"));
		
		await show_changelog(true);
	}
}

export default UI;
