"use strict";

// From https://stackoverflow.com/a/15666143/1460422

let pixel_ratio = (function () {
    let ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();

/**
 * De-blurrificates a canvas on Hi-DPI screens.
 * @param	{HTMLCanvasElement}	canvas					The canvas element to alter.
 * @param	{Number}			width=canvas.width		Optional. The width of the canvas in question.
 * @param	{Number}			height=canvas.height	Optional. The height of the canvas in question.
 * @returns	{HTMLCanvasElement}	The canvas we operated on. Useful for daisy-chaining.
 */
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


export { pixel_ratio, set_hidpi_canvas };
