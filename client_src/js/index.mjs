"use strict";

import '../css/main.css';

// ----------------------------------------------------------------------------

import MapManager from './MapManager.mjs';

window.addEventListener("load", function(_event) {
	window.map_manager = new MapManager();
	window.map_manager.setup();
});
