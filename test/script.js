window.spec = {
	"0": "#9CFF9C", "5.5": "#9CFF9C", // Low 1
	"17.5": "#31FF00", // Low 2
	"29.5": "#31CF00", // Low 3
	"38.5": "#FFFF00", // Moderate 1
	"44.5": "#FFCF00", // Moderate 2
	"50.5": "#FF9A00", // Moderate 3
	"56": "#FF6464", // High 1
	"61.5": "#FF0000", // High 2
	"67.5": "#990000", // High 3
	"72.5": "#CE30FF", "75": "#CE30FF", // Very high
}
window.max = 75;

window.addEventListener("load", (_event) => {
	let canvas = document.getElementById("main");
	
	let guage = new Guage(canvas, window.spec, window.max);
	guage.render();
});

window.pixel_ratio = (function () {
    let ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();

function set_hidpi_canvas(canvas, width, height) {
   width = width || canvas.width;
   height = height || canvas.height;
   
   canvas.width = width * pixel_ratio;
   canvas.height = height * pixel_ratio;
   canvas.style.width = width + "px";
   canvas.style.height = height + "px";
   // canvas.getContext("2d").setTransform(pixel_ratio, 0, 0, pixel_ratio, 0, 0);
   return canvas;
}

class Guage {
	constructor(in_canvas, in_spec, in_max) {
		this.canvas = in_canvas;
		this.spec = in_spec;
		this.max = in_max;
		
		set_hidpi_canvas(this.canvas);
		
		// TODO: Use Helpers/Canvas.mjs here
		this.pixelRatio = (function () {
		    var ctx = document.createElement("canvas").getContext("2d"),
		        dpr = window.devicePixelRatio || 1,
		        bsr = ctx.webkitBackingStorePixelRatio ||
		              ctx.mozBackingStorePixelRatio ||
		              ctx.msBackingStorePixelRatio ||
		              ctx.oBackingStorePixelRatio ||
		              ctx.backingStorePixelRatio || 1;

		    return dpr / bsr;
		})();
		
		this.context = this.canvas.getContext("2d");
	}
	
	render() {
		let guage_size = {
			x: this.canvas.width * 0.1,
			y: this.canvas.height * 0.05,
			width: this.canvas.width * 0.3,
			height: this.canvas.height * 0.9
		};

		// ---------------------------------------------
		// Draw the guage
		this.context.save();
		let gradient_spec = RenderGradient(spec, max);
		console.log(gradient_spec);

		let gradient = this.context.createLinearGradient(
			0, guage_size.y,
			0, guage_size.y + guage_size.height
		);
		for (let point in gradient_spec)
			gradient.addColorStop(parseFloat(point), gradient_spec[point]);

		this.context.fillStyle = gradient;
		this.context.fillRect(guage_size.x, guage_size.y, guage_size.width, guage_size.height);
		this.context.restore();
		// ---------------------------------------------
		// Draw the numbers
		
		this.context.save();
		this.context.font = "12px Ubuntu, sans-serif";
		this.context.textBaseline = "middle";
		this.context.strokeStyle = "rgba(0, 0, 0, 0.5)";
		this.context.lineWidth = 1.5 * window.pixel_ratio;
		
		for (let point in spec) {
			let value = parseFloat(point) / max;
			
			let draw_x = guage_size.x + guage_size.width + 3;
			let draw_y = guage_size.y + (value * guage_size.height);
			
			// this.context.fillStyle = "black";
			console.log(`Writing '${point}' to (${draw_x}, ${draw_y})`);
			this.context.fillText(point, draw_x, draw_y);
			
			this.context.beginPath();
			this.context.moveTo(guage_size.x, draw_y);
			this.context.lineTo(draw_x, draw_y);
			this.context.stroke();
		}
		this.context.restore();
	}
}

function RenderGradient(stops, max) {
	let result = {};

	for (let value in stops)
		result[value / max] = stops[value];

	return result;
}
