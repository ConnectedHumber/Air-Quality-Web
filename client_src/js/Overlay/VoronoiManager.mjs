"use strict";

import VoronoiOverlay from './VoronoiOverlay.mjs';
import VoronoiCell from './VoronoiCell.mjs';

import Vector2 from '../Helpers/Vector2.mjs';

class VoronoiManager {
	constructor(in_device_data, map) {
		this.device_data = in_device_data;
		this.overlay = new VoronoiOverlay();
		this.overlay.addCells(...this.device_data.devices
			.filter((device) => typeof device.latitude == "number" &&
				typeof device.longitude == "number")
			.map((device) => 
				new VoronoiCell(new Vector2(device.latitude, device.longitude))
			));
		this.overlay.add_to(map);
	}
}

export default VoronoiManager;
