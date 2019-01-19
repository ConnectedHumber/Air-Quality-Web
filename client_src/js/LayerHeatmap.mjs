"use strict";

import HeatmapOverlay from 'leaflet-heatmap';

import Config from './Config.mjs';
import GetFromUrl from './Helpers/GetFromUrl.mjs';


class LayerHeatmap {
	constructor(in_map) {
		this.map = in_map;
		
		this.overlay_config = {
			radius: Config.heatmap.blob_radius,
			maxOpacity: 0.8,
			scaleRadius: true,
			useLocalExtrema: false,
			
			latField: "latitude",
			lngField: "longitude",
			valueField: "value"
		};
		this.layer = new HeatmapOverlay(this.overlay_config);
		this.map.addLayer(this.layer);
	}
	
	set_data(readings_list) {
		let data_object = {
			max: readings_list.reduce((prev, next) => next.value > prev ? next.value : prev, 0),
			data: readings_list
		}
		this.layer.setData(data_object);
	}
	
	async update_data(datetime, reading_type) {
		if(!(datetime instanceof Date))
			throw new Exception("Error: 'datetime' must be an instance of Date.");
		if(typeof reading_type != "string")
			throw new Exception("Error: 'reading_type' must be a string.");
		
		this.datetime = datetime;
		this.reading_type = reading_type;
		
		console.log("[map/heatmap] Updating values to", this.reading_type, "@", this.datetime);
		
		this.set_data(JSON.parse(await GetFromUrl(
			`${Config.api_root}?action=fetch-data&datetime=${encodeURIComponent(this.datetime.toISOString())}&reading_type=${encodeURIComponent(this.reading_type)}`
		)));
	}
	
	
	async update_reading_type(reading_type) {
		await this.update_data(
			this.datetime,
			reading_type
		);
	}
	async update_datetime(datetime) {
		await this.update_data(
			datetime,
			this.reading_type
		);
	}
}

export default LayerHeatmap;
