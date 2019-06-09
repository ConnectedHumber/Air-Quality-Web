"use strict";

import Voronoi from 'voronoi';

import Vector2 from '../Helpers/Vector2.mjs';
import Rectangle from '../Helpers/Rectangle.mjs';

import SvgWriter from '../Helpers/SVGWriter.mjs';


/**
 * Generates and manages a single voronoi SVGOverlay layer.
 */
class VoronoiOverlay {
	constructor() {
		this.border = new Vector2(0.1, 0.1); // lat / long
		
		this.cells = [];
	}
	
	addCells(...cells) {
		this.cells.push(...cells);
	}
	
	/**
	 * Computes the bounding box of all the currently registered points.
	 * Includes a border, which is defined by this.border.
	 * @return {Rectangle} The bounding box of the currently registered points.
	 */
	computeBoundingBox() {
		let result = new Rectangle(Infinity, Infinity, -Infinity, -Infinity);
		
		for(let cell of this.cells) {
			if(cell.point.x < result.x) result.x = cell.point.x;
			if(cell.point.y < result.y) result.y = cell.point.y;
			if(cell.point.x > result.Right) result.Right = cell.point.x;
			if(cell.point.y > result.Bottom) result.Bottom = cell.point.y;
		}
		
		result.Left -= this.border.x;
		result.Right += this.border.x;
		result.Top -= this.border.y;
		result.Bottom += this.border.y;
		
		return result;
	}
	
	render() {
		let bounding_box = this.computeBoundingBox();
		
		// Recycle the diagram object if possible
		if(typeof VoronoiOverlay.diagram !== "undefined")
			VoronoiOverlay.voronoi.recycle(VoronoiOverlay.diagram);
		
		VoronoiOverlay.diagram = VoronoiOverlay.voronoi.compute(
			this.cells.map((cell) => cell.point),
			bounding_box
		);
		
		console.log(VoronoiOverlay.diagram);
		
		// TODO: Map the generated polygons back onto this.cells
		for(let their_cell of VoronoiOverlay.diagram.cells) {
			let our_cell = this.cells.find((el) => el.point.x == their_cell.site.x && el.point.y == their_cell.site.y);
			our_cell.def = their_cell;
		}
		
		console.log(this.cells);
		
		this.svg = new SvgWriter();
		
		// TODO: Render the SVG here
	}
	
	generate_overlay() {
		// TODO: Generate the Leaflet SVGOverlay here
	}
}

VoronoiOverlay.voronoi = new Voronoi();


export default VoronoiOverlay;
