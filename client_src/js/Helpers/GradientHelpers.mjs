"use strict";

function RenderGradient(stops, max) {
	let result = {};
	
	for(let value in stops) {
		result[value / max] = stops[value];
	}
	
	return result;
}

function GenerateCSSGradient(stops, max) {
	let stops_processed = [];
	for(let value in stops) {
		stops_processed = `${stops[value]} ${(value/max).toFixed(3)}%`
	}
	return `linear-gradient(to bottom, ${stops_processed.join(", ")})`;
}

export { RenderGradient };
