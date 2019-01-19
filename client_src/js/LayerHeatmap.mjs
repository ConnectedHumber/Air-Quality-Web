"use strict";

import HeatmapOverlay from 'leaflet-heatmap';

import Config from './Config.mjs';
import GetFromUrl from './Helpers/GetFromUrl.mjs';


class LayerHeatmap {
	constructor(in_map) {
		this.map = in_map;
		
		this.overlay_config = {
			radius: Config.heatmap.blob_radius,
			minOpacity: 0.5,
			maxOpacity: 0.8,
			scaleRadius: true,
			useLocalExtrema: false,
			
			latField: "latitude",
			lngField: "longitude",
			valueField: "value",
			
			gradient: {
				// 0 to 35 low (green), 36 to 53 moderate (amber) 54 to 70 high (red) and above 71 (purple)
				0.233: "green",
				0.593: "orange",
				0.827: "red",
				1: "purple"
			}
		};
		this.layer = new L.LayerGroup();
		this.map.addLayer(this.layer);
		this.recreate_overlay();
		
		// Custom configuration directives to apply based on the reading type displayed.
		this.reading_type_configs = {
			"PM25": {
				// 0 to 35 low (green), 36 to 53 moderate (amber) 54 to 70 high (red) and above 71 (purple)
				max: 75,
				gradient: {
					"0": "hsla(111, 76%, 42%, 0.00)",
					"0.233": "hsl(111, 76%, 42%)", // green
					"0.593": "orange",
					"0.827": "red",
					"1": "purple"
				}
			},
			"PM10": {
				// 0 to 50 low (green) 51 to75 moderate (amber) 76 to 100 high (red) and more than 100 very high (purple)
				max: 100,
				gradient: {
					"0": "hsla(111, 76%, 42%, 0)",
					"0.45": "hsl(111, 76%, 42%)", // green
					"0.573": "orange",
					"0.8": "red",
					"1": "purple"
				}
			},
			"humidity": {
				max: 100,
				gradient: {
					"0": "hsla(176, 77%, 40%, 0)",
					"0.5": "hsl(176, 77%, 40%)",
					"1": "blue"
				}
			}
		};
	}
	
	recreate_overlay() {
		if(typeof this.heatmap != "undefined")
			this.layer.removeLayer(this.heatmap);
		this.heatmap = new HeatmapOverlay(this.overlay_config);
		this.layer.addLayer(this.heatmap);
	}
	
	set_data(readings_list) {
		let data_object = {
			max: 0,
			data: readings_list
		};
		
		if(typeof this.reading_type_configs[this.reading_type] != "undefined")
			data_object.max = this.reading_type_configs[this.reading_type].max;
		else
			data_object.max = readings_list.reduce((prev, next) => next.value > prev ? next.value : prev, 0);
		
		console.log("[map/heatmap] Displaying", this.reading_type, data_object);
		
		this.heatmap.setData(data_object);
	}
	
	async update_data(datetime, reading_type) {
		if(!(datetime instanceof Date))
			throw new Exception("Error: 'datetime' must be an instance of Date.");
		if(typeof reading_type != "string")
			throw new Exception("Error: 'reading_type' must be a string.");
		
		this.datetime = datetime;
		this.reading_type = reading_type;
		
		console.log("[map/heatmap] Updating values to", this.reading_type, "@", this.datetime);
		
		if(typeof this.reading_type_configs[this.reading_type] != "undefined") {
			this.overlay_config.gradient = this.reading_type_configs[this.reading_type].gradient;
			console.log("[map/heatmap] Gradient is now", this.overlay_config.gradient);
			this.recreate_overlay();
		}
		else {
			delete this.overlay_config.gradient;
		}
		
		try {
			this.set_data(JSON.parse(await GetFromUrl(
				`${Config.api_root}?action=fetch-data&datetime=${encodeURIComponent(this.datetime.toISOString())}&reading_type=${encodeURIComponent(this.reading_type)}`
			)));
		} catch(error) {
			console.log(error);
			alert(error);
		}
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
