"use strict";

import Vector2 from '../Helpers/Vector2.mjs';

/**
 * Represents a single Voronoi diagram cell.
 * @param	{Vector2}	point	The point at which the cell is located.
 */
class VoronoiCell {
	constructor(in_point, in_colour) {
		this.point = in_point;
		this.polygon = null;
		this.colour = in_colour;
	}
}

export default VoronoiCell;
