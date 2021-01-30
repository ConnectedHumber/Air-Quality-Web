"use strict";

import SmartSettings from 'smartsettings';
import NanoModal from 'nanomodal';

import Config from './Config.mjs';
import GetFromUrl from './Helpers/GetFromUrl.mjs';

// import Tour from './Tour.mjs';

function show_nanomodal(html, options = {}) {
	return new Promise((resolve, _reject) => {
		let modal = NanoModal(html, options);
		modal.onHide(resolve);
		modal.show();
	});
}

async function show_changelog(only_if_changed) {
	let current_version = `${Config.version}, built ${Config.build_date.toDateString()}`;
	console.log(`[UI] Comparing current '${current_version}' to '${localStorage.getItem("last_seen_version")}'`);
	if(only_if_changed && localStorage.getItem("last_seen_version") == current_version) {
		console.log("[UI] Not showing changelog.");
		return false;
	}
	
	console.log("[UI] Showing changelog");
	await show_nanomodal(await GetFromUrl(`${Config.api_root}?action=changelog`), {
		classes: "reverse",
		autoRemove: true
	});
	
	localStorage.setItem("last_seen_version", current_version);
	return true;
}

class UI {
	constructor(in_config, in_map_manager) {
		this.config = in_config;
		this.map_manager = in_map_manager;
		
		this.ui_panel = new SmartSettings("Settings");
		// this.ui_panel.watch((event) => console.log(event));
		
		this.tour_enabled = false;
		if(this.tour_enabled) this.tour = new Tour(this.map_manager);
	}
	
	async setup() {
		await show_changelog(true);
		
		this.reading_types = JSON.parse(
			await GetFromUrl(`${this.config.api_root}?action=list-reading-types`)
		);
		
		this.ui_panel.loadConfig([
			{
				type: "select",
				name: "Reading Type",
				items: this.reading_types.map((type) => type.friendly_text),
				callback: (async (event) => {
					let new_type = this.reading_types.find((type) => type.friendly_text == event.target.value).short_descr;
					
					
					document.querySelector("main").classList.add("working-visual");
					await this.map_manager.device_markers.update_markers(new_type);
					document.querySelector("main").classList.remove("working-visual");
				}).bind(this)
			},
			{
				type: "button",
				name: "View disclaimer",
				callback: ((_event) => {
					window.open("https://github.com/ConnectedHumber/Air-Quality-Web/tree/dev#disclaimer", "_blank")
				})
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
		
		if(this.tour_enabled) await this.tour.run_once();
	}
}

export default UI;
