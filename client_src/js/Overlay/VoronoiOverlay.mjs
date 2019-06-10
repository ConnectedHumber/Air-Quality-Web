"use strict";

import L from 'leaflet';
import { Delaunay } from 'd3-delaunay';

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
		let result = {
			x_min: Infinity,
			x_max: -Infinity,
			y_min: Infinity,
			y_max: -Infinity
		}
		
		for(let cell of this.cells) {
			if(!isNaN(cell.point.x)) {
				if(cell.point.x < result.x_min) result.x_min = cell.point.x;
				if(cell.point.x > result.x_max) result.x_max = cell.point.x;
			}
			if(!isNaN(cell.point.y)) {
				if(cell.point.y < result.y_min) result.y_min = cell.point.y;
				if(cell.point.y > result.y_max) result.y_max = cell.point.y;
			}
		}
		
		result.x_min -= this.border.x;
		result.y_min -= this.border.y;
		result.x_max += this.border.x;
		result.y_max += this.border.y;
		
		return new Rectangle(
			result.x_min,
			result.y_min,
			result.x_max - result.x_min,
			result.y_max - result.y_min
		);
	}
	
	render() {
		let bounding_box = this.computeBoundingBox();
		
		let voronoi = Delaunay.from(this.cells.map(
			(cell) => [cell.point.x, cell.point.y])
		).voronoi([
			bounding_box.x, bounding_box.y,
			bounding_box.Right, bounding_box.Bottom
		]);
		
		console.log(voronoi);
		
		// TODO: Map the generated polygons back onto this.cells
		let i = 0;
		for(let polygon of voronoi.cellPolygons()) {
			let our_cell = this.cells[i];
			our_cell.polygon = polygon.map((point) => new Vector2(...point));
			
			i++;
		}
		
		console.log(this.cells);
		
		this.svg = new SvgWriter(
			"100%", "100%",
			bounding_box,
			true
		);
		
		// TODO: Render the SVG here
		for(let cell of this.cells) {
			this.svg.addPolygon(
				`hsla(${(Math.random()*360).toFixed(2)}, 50%, 50%, 0.6)`,
				cell.polygon
			);
			this.svg.addCircle(cell.point, 0.005, "red");
		}
		
		this.svg.complete();
		return this.svg.toString();
	}
	
	add_to(map) {
		let bounds = this.computeBoundingBox();
		this.layer = L.svgOverlay(
			SvgWriter.string2element(this.render()),
			L.latLngBounds(
				L.latLng(bounds.TopLeft.x, bounds.TopLeft.y),
				L.latLng(bounds.BottomRight.x, bounds.BottomRight.y)
			)
		);
		this.layer.addTo(map);
	}
	
	generate_overlay() {
		// TODO: Generate the Leaflet SVGOverlay here
	}
}


export default VoronoiOverlay;
