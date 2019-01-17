"use strict";

import '../css/main.css';

// ----------------------------------------------------------------------------

import Map from './Map.mjs';

window.addEventListener("load", function(_event) {
	window.map = new Map();
	window.map.setup();
});
