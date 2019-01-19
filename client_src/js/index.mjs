"use strict";

import '../css/main.css';

// ----------------------------------------------------------------------------

import MapManager from './MapManager.mjs';

window.addEventListener("load", function(_event) {
	window.map = new MapManager();
	window.map.setup();
});
