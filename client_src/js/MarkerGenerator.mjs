"use strict";

import chroma from 'chroma-js';

import marker_svg from '../marker-embed.svg';
import gradients from './Gradients.mjs';

class MarkerGenerator {
	constructor() {
		
	}
	
	marker_default() {
		return marker_svg.replace("{{colour_a}}", "#1975c8")
			.replace("{{colour_b}}", "#5ea6d5")
			.replace("{{colour_dark}}", "#2e6d99");
	}
	
	marker(value, type) {
		let col = this.get_colour(value, type);
		let result = marker_svg.replace(/\{\{colour_a\}\}/g, col.darken(0.25).hex())
			.replace(/\{\{colour_b\}\}/g, col.brighten(0.25).hex())
			.replace(/\{\{colour_dark\}\}/g, col.darken(1))
			.replace(/\{\{id_grad\}\}/g, `marker-grad-${btoa(`${type}-${value}`).replace(/\+/g, "-").replace(/\//g, "_")}`);
		return result;
	}
	
	/**
	 * Fetches the colour for a given value of a given type.
	 * Currently a gradient is not used - i.e. a value is coloured according to
	 * the last threshold it crossed in the associated gradient definition.
	 * TODO: Calculate the gradient instead.
	 * @param	{number}	value	The value to calculate the colour for.
	 * @param	{string}	type	The type of measurement value we're working with. Determines the gradient to use.
	 * @return	{chroma}	The calculated colour.
	 */
	get_colour(value, type) {
		if(typeof gradients[type] == "undefined") {
			console.warn(`[MarkerGenerator] Warning: Unknown gradient type '${type}', using unknown instead.`);
			type = "unknown";
		}
		return gradients[type].chroma(value);
	}
}

export default MarkerGenerator;
