"use strict";

import L from 'leaflet';
import { Delaunay } from 'd3-delaunay';

import Vector2 from '../Helpers/Vector2.mjs';
import Rectangle from '../Helpers/Rectangle.mjs';

import SvgWriter from '../Helpers/SvgWriter.mjs';


/**
 * Generates and manages a single voronoi SVGOverlay layer.
 */
class VoronoiOverlay {
	constructor() {
		this.border = new Vector2(0.1, 0.1); // lat / long
		
		this.cells = [];
	}
	
	/**
	 * Adds a cell to the voronoi overlay.
	 * @param {VoronoiCell} cells The cell to add. May be specified as many times as requires to add cells in bulk.
	 */
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
			// TODO: Remove this restriction
			if(cell.point.y < 40) continue; // Exclude the freetown one for testing 'cause it's miles away
			if(cell.point.x < result.x_min) result.x_min = cell.point.x;
			if(cell.point.x > result.x_max) result.x_max = cell.point.x;
			if(cell.point.y < result.y_min) result.y_min = cell.point.y;
			if(cell.point.y > result.y_max) result.y_max = cell.point.y;
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
		
		// TODO: Investigate GeoJSON. Maybe it could help us avoid the complexity of an SVGOverlay? It looks like we might be able to apply a custom colour to a GeoJSON polygon too: https://leafletjs.com/reference-1.5.0.html#geojson
		
		let svg = new SvgWriter(
			"100%", "100%",
			bounding_box,
			true
		);
		
		// TODO: Render the SVG here
		for(let cell of this.cells) {
			if(cell.polygon !== null) {
				svg.addPolygon(
					`hsla(${(Math.random()*360).toFixed(2)}, 50%, 50%, 0.6)`,
					cell.polygon
				);
			}
			svg.addCircle(cell.point, 0.005, "red");
		}
		
		svg.complete();
		console.log(svg.toString());
		return svg.toString();
	}
	
	add_to(map) {
		let bounds = this.computeBoundingBox();
		this.layer = L.svgOverlay(
			SvgWriter.string2element(this.render()),
			L.latLngBounds(
				L.latLng(bounds.TopLeft.y, bounds.TopLeft.x),
				L.latLng(bounds.BottomRight.y, bounds.BottomRight.x)
			)
		);
		this.layer.addTo(map);
	}
	
	generate_overlay() {
		// TODO: Generate the Leaflet SVGOverlay here
	}
}


export default VoronoiOverlay;
