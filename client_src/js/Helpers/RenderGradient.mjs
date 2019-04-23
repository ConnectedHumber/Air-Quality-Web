"use strict";

function RenderGradient(stops, max) {
	let result = {};
	
	for(let value in stops) {
		result[value / max] = stops[value];
	}
	
	return result;
}

export default RenderGradient;
