"use strict";

import { set_hidpi_canvas, pixel_ratio } from './Helpers/Canvas.mjs';
import { RenderGradient } from './Helpers/GradientHelpers.mjs';

import gradients from './Gradients.mjs';

class Gauge {
	constructor(in_canvas) {
		this.canvas = in_canvas;
		
		set_hidpi_canvas(this.canvas);
		
		this.context = this.canvas.getContext("2d");
	}
	
	/**
	 * Sets the reading type to display on this gauge.
	 * Pulls gradient definitions from Gradients.mjs.
	 * @param	{string}	new_reading_type	The reading type code to display.
	 */
	set_reading_type(new_reading_type) {
		if(typeof gradients[new_reading_type] == "undefined") {
			console.warn(`[Gauge] Warning: Unknown reading type ${new_reading_type} (defaulting to "unknown")`);
			new_reading_type = "unknown";
		}
		
		this.set_spec(gradients[new_reading_type]);
	}
	
	/**
	 * Sets the gradient spec to display.
	 * Automatically re-renders the gauge for convenience.
	 * @param	{Object}	arg	The gradient spec to set display.
	 */
	set_spec({ gradient: spec, max }) {
		this.spec = spec;
		this.max = max;
		
		this.render();
	}
	
	render() {
		let guage_size = {
			x: this.canvas.width * 0.6,
			y: this.canvas.height * 0.05,
			width: this.canvas.width * 0.3,
			height: this.canvas.height * 0.9
		};
		
		this.clear_canvas();
		this.render_gauge(guage_size);
		this.render_labels(guage_size);
		
	}
	
	clear_canvas() {
		this.context.clearRect(
			0, 0,
			this.canvas.width, this.canvas.height
		);
	}
	
	render_gauge(guage_size) {
		this.context.save();
		
		let gradient_spec = RenderGradient(this.spec, this.max);
		// console.log(gradient_spec);
		
		let gradient = this.context.createLinearGradient(
			0, guage_size.y + guage_size.height,
			0, guage_size.y
		);
		for (let point in gradient_spec)
			gradient.addColorStop(parseFloat(point), gradient_spec[point]);
		
		this.context.fillStyle = gradient;
		this.context.fillRect(
			guage_size.x, guage_size.y,
			guage_size.width, guage_size.height
		);
		
		this.context.restore();
	}
	
	render_labels(guage_size) {
		this.context.save();
		
		this.context.font = "12px Ubuntu, sans-serif";
		this.context.textBaseline = "middle";
		this.context.strokeStyle = "rgba(0, 0, 0, 0.5)";
		this.context.lineWidth = 1.5 * pixel_ratio;
		
		for (let point in this.spec) {
			let value = 1 - (parseFloat(point) / this.max);
			
			let text_width = this.context.measureText(point).width;
			let draw_x = guage_size.x - 5 - text_width;
			let draw_y = guage_size.y + (value * guage_size.height);
			
			// console.log(`Writing '${point}' to (${draw_x}, ${draw_y})`);
			this.context.fillText(point, draw_x, draw_y);
			
			this.context.beginPath();
			this.context.moveTo(guage_size.x + guage_size.width, draw_y);
			this.context.lineTo(draw_x + text_width, draw_y);
			this.context.stroke();
		}
		
		this.context.restore();
	}
}

export default Gauge;
