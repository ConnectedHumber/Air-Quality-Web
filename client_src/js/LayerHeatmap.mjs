"use strict";

import HeatmapOverlay from 'leaflet-heatmap';

import Config from './Config.mjs';


class LayerHeatmap {
	constructor(in_map) {
		this.map = in_map;
		
		this.layer = new HeatmapOverlay({
			radius: Config.heatmap.blob_radius,
			maxOpacity: 0.8,
			scaleRadius: true,
			useLocalExtrema: false,
			
			latField: "latitude",
			lngField: "longitude",
			valueField: "value"
		});
		this.map.addLayer(this.layer);
	}
	
	set_data(readings_list) {
		let data_object = {
			max: readings_list.reduce((prev, next) => next.value > prev ? next.value : prev, 0),
			data: readings_list
		}
		this.layer.setData(data_object);
	}
}

export default LayerHeatmap;
