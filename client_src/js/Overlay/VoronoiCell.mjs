"use strict";

import Vector2 from '../Helpers/Vector2.mjs';

/**
 * Represents a single Voronoi diagram cell.
 * @param	{Vector2}	point	The point at which the cell is located.
 */
class VoronoiCell {
	constructor(in_point) {
		this.point = in_point;
		this.def = null;
	}
}

export default VoronoiCell;
