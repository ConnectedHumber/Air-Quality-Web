"use strict";

import { set_hidpi_canvas, pixel_ratio } from './Helpers/Canvas.mjs';
import { RenderGradient } from './Helpers/GradientHelpers.mjs';


class Guage {
	constructor(in_canvas) {
		this.canvas = in_canvas;
		
		set_hidpi_canvas(this.canvas);
		
		this.context = this.canvas.getContext("2d");
	}
	
	set_spec(spec, max) {
		this.spec = spec;
		this.max = max;
	}
	
	render() {
		let guage_size = {
			x: this.canvas.width * 0.1,
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
		this.context.fillRect(guage_size.x, guage_size.y, guage_size.width, guage_size.height);
		
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
			
			let draw_x = guage_size.x + guage_size.width + 3;
			let draw_y = guage_size.y + (value * guage_size.height);
			
			// console.log(`Writing '${point}' to (${draw_x}, ${draw_y})`);
			this.context.fillText(point, draw_x, draw_y);
			
			this.context.beginPath();
			this.context.moveTo(guage_size.x, draw_y);
			this.context.lineTo(draw_x, draw_y);
			this.context.stroke();
		}
		
		this.context.restore();
	}
}

export default Guage;
