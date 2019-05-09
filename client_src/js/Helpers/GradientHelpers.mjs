"use strict";

function RenderGradient(stops, max) {
	let result = {};
	
	for(let value in stops)
		result[value / max] = stops[value];
	
	return result;
}

/**
 * Generates a CSS gradient, given the output of RenderGradient().
 * @param	{[string, string]}	stops	The stops specification to create a css linear-gradient from. Should be the output of RenderGradient().
 * @returns	{string}	The rendered CSS linear-gradient.
 */
function GenerateCSSGradient(stops) {
	let stops_processed = [];
	for(let value in stops) {
		let valueNumber = parseFloat(value);
		stops_processed.push(`${stops[value]} ${(valueNumber*100).toFixed(3).replace(/\.?[0]+$/, "")}%`);
	}
	return `linear-gradient(to bottom, ${stops_processed.join(", ")})`;
}

export { RenderGradient, GenerateCSSGradient };
