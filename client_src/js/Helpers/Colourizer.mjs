"use strict";

function colourize(image, r, g, b) {
	let canvas = document.createElement("canvas"),
		context = canvas.getContext("2d");
	canvas.width = image.width;
	canvas.height = image.height;

	context.drawImage(image, 0, 0);
	
	let image_data = context.getImageData(
			0, 0,
			canvas.width, canvas.height
		),
		buf = new ArrayBuffer(image_data.data.length),
		view = new Uint32Array(buf),
		view8 = new Uint8ClampedArray(buf);

	console.log(`Canvas: ${canvas.width}x${canvas.height}, image data: ${image_data.width}x${image_data.height}`);


	let count = 0;
	for(let y = 0; y < image_data.height; y++) {
		for(let x = 0; x < image_data.width; x++) {
			let loc = y*image_data.width + x;
			//if(image_data.data[loc*4 + 3] == 0) continue

			view[loc] = 
				(image_data.data[loc*4 + 3] << 24) |		// Alpha
				((b+image_data.data[loc*4 + 2])/2 << 16) |	// Blue
				((g+image_data.data[loc*4 + 1])/2 << 8) |	// Green
				(r+image_data.data[loc*4])/2;				// Red
			
			count++;
		}
	}
	console.log(`Changed ${count} / ${canvas.width*canvas.height} pixels`);

	image_data.data.set(view8);
	context.putImageData(image_data, 0, 0);

	return canvas.toDataURL();
	// let image_data = context.getImageData()
}

export default colourize;
