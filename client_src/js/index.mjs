"use strict";

import '../css/main.css';
import '../../node_modules/leaflet-timedimension/dist/leaflet.timedimension.control.css';

// ----------------------------------------------------------------------------

import MapManager from './MapManager.mjs';

import 'iso8601-js-period';

window.addEventListener("load", function(_event) {
	window.map_manager = new MapManager();
	window.map_manager.setup();
});

// This needs to be here rather than in onload, because we need to ensure it's loaded now
console.log("iso8601-js-period namespace: ", window.nezasa);

// Ensure terser doesn't tree-shake  iso8601-js-period
console.debug(`iso8601-js-period ${nezasa.iso8601.Period?"is":"is not"} loaded.`);
