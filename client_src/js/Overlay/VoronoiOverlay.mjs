"use strict";

import L from 'leaflet';
import { Delaunay } from 'd3-delaunay';

import Vector2 from '../Helpers/Vector2.mjs';
import Rectangle from '../Helpers/Rectangle.mjs';

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
		
		let geojson = [];
		
		// TODO: Render the SVG here
		for(let cell of this.cells) {
			if(cell.polygon == null) {
				console.warn("Warning: Null cell polygon encountered.", cell);
				continue;
			}
			
			geojson.push({
				"type": "Feature",
				"geometry": {
					"type": "Polygon",
					"coordinates": [cell.polygon.map((point) => [point.x, point.y])],
				},
				"properties": {
					// TODO: Replace this with an actual colour
					"colour": `hsl(${(Math.random()*360).toFixed(2)}, 50%, 50%)`
				}
			});
		}
		return geojson;
	}
	
	add_to(map) {
		this.layer = L.geoJSON(this.render(), {
			style: (feature) => { return { color: feature.properties.colour } }
		});
		this.layer.addTo(map);
	}
	
	generate_overlay() {
		// TODO: Generate the Leaflet SVGOverlay here
	}
}


export default VoronoiOverlay;
