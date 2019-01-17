"use strict";

import L from 'leaflet';
import 'leaflet-webgl-heatmap';
import '../../lib/webgl-heatmap/webgl-heatmap.js'; // Someone didn't define this as a dependency. I'm looking at you, leaflet-webgl-heatmap.....

import Config from './Config.mjs';


class LayerHeatmap {
	constructor(in_map) {
		this.map = in_map;
		
		this.layer = new L.webGLHeatmap({
			size: Config.heatmap_blob_size,
			opacity: Config.heatmap_opacity
		});
	}
	
	setup(initial_data) {
		this.set_data(initial_data);
		this.map.addLayer(this.layer);
	}
	
	set_data(readings_list) {
		this.layer.setData(readings_list.map((reading) => [
			reading.latitude,
			reading.longitude,
			reading.value
		]));
	}
}

export default LayerHeatmap;
