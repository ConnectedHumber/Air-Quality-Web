"use strict";

import Vector from './Vector2.mjs';

/**
 * Represents a rectangle in 2D space.
 * @source	https://gist.github.com/d7ff700d3ca57ab5d52ec12a1ee8b8a0
 * Changelog:
 	* 29th May 2019
 		* Created this changelog
 		* Added setters to TopLeft, Top, Size, etc.
 */
class Rectangle
{
	/**
	 * The top-left corner of the rectangle.
	 * @returns {Vector}
	 */
	get TopLeft() {
		return new Vector(this.x, this.y);
	}
	/**
	 * Sets the top-left corner of the rectangle.
	 * @param {Vector} point	The point to set it to.
	 */
	set TopLeft(point) {
		this.x = point.x;
		this.y = point.y;
	}
	
	/**
	 * The top-right corner of the rectangle.
	 * @returns {Vector}
	 */
	get TopRight() {
		return new Vector(this.x + this.width, this.y);
	}
	/**
	 * Sets the top-right corner of the rectangle.
	 * @param {Vector} point	The point to set it to.
	 */
	set TopRight(point) {
		this.width = point.x - this.x;
		this.y = point.y;
	}
	
	/**
	 * The bottom-left corner of the rectangle.
	 * @returns {Vector}
	 */
	get BottomLeft() {
		return new Vector(this.x, this.y + this.height);
	}
	/**
	 * Sets the bottom-left corner of the rectangle.
	 * @param {Vector} point	The point to set it to.
	 */
	set BottomLeft(point) {
		this.width = point.x;
		this.y = point.y - this.y;
	}
	
	/**
	 * The bottom-right corner of the rectangle.
	 * @returns {Vector}
	 */
	get BottomRight() {
		return new Vector(this.x + this.width, this.y + this.height);
	}
	/**
	 * Sets the bottom-right corner of the rectangle.
	 * @param {Vector} point	The point to set it to.
	 */
	set BottomRight(point) {
		this.width = point.x - this.x;
		this.y = point.y - this.y;
	}
	
	/**
	 * The centre of the rectangle.
	 * @returns {Vector}
	 */
	get Centre() {
		return new Vector(
			this.x + (this.width/2),
			this.y + (this.height/2)
		);
	}
	
	/**
	 * The Y coordinate of the top of the rectangle.
	 * @returns {Number}
	 */
	get Top() {
		return this.y;
	}
	/**
	 * Sets the Y coordinate of the top of the rectangle.
	 * @param {Number}	y
	 */
	set Top(y) {
		this.y = y;
	}
	
	/**
	 * The Y coordinate of the bottom of the rectangle.
	 * @returns {Number}
	 */
	get Bottom() {
		return this.y + this.height;
	}
	/**
	 * Sets the Y coordinate of the bottom of the rectangle.
	 * @param {Number}	y
	 */
	set Bottom(y) {
		this.height = y - this.y;
	}
	
	/**
	 * The X coordinate of the left side of the rectangle.
	 * @returns {Number}
	 */
	get Left() {
		return this.x;
	}
	/**
	 * Sets the X coordinate of the left of the rectangle.
	 * @param {Number}	x
	 */
	set Left(x) {
		this.x = x;
	}
	
	/**
	 * The X coordinate of the right side of the rectangle.
	 * @returns {Number}
	 */
	get Right() {
		return this.x + this.width;
	}
	/**
	 * Sets the X coordinate of the right of the rectangle.
	 * @param {Number}	x
	 */
	set Right(x) {
		this.x = x - this.x;
	}
	
	/**
	 * The size of this rectangle.
	 * @returns {Vector}
	 */
	get Size() {
		return new Vector(this.width, this.height);
	}
	/**
	 * Sets the size of the rectangle.
	 * @param {Vector} newSize The new size of the rectangle.
	 */
	set Size(newSize) {
		this.width = newSize.x;
		this.height = newSize.y;
	}

	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	/**
	 * Moves this Rectangle by the specified vector.
	 * @param	{Vector}	v	The amount to move this Rectangle by.
	 * @return	{Rectangle}	The current rectangle. Useful for daisy-chaining.
	 */
	move_by(v) {
		this.x += v.x;
		this.y += v.y;
		
		return this;
	}
	
	/**
	 * Figures out whether this rectangle overlaps another rectangle.
	 * @param	{Rectangle}	otherRectangle	The other rectangle to check the overlap of.
	 * @return	{bool}		Whether this rectangle overlaps another rectangle.
	 */
	overlaps(otherRectangle)
	{
		if(this.Top > otherRectangle.Bottom ||
			this.Bottom < otherRectangle.Top ||
			this.Left > otherRectangle.Right ||
			this.Right < otherRectangle.Left)
			return false;

		return true;
	}
	
	/**
	 * Works out whether the specified vector falls within this Rectangle.
	 * @param	{Vector}	v	The vector to test.
	 * @return	{Boolean}	Whether the specified vector falls within this Rectangle or not.
	 */
	is_inside_vector(v) {
		return v.x >= this.x && v.y >= this.y &&
			v.x <= this.Right && v.y <= this.Bottom;
	}
	
	/**
	 * Works out if this Rectangle falls completely within the specified
	 * rectangle.
	 * @param	{Rectangle}	otherRectangle	The other rectangle to compare against.
	 * @return	{Boolean}	Whether this Rectangle faalls within the specified Rectangle.
	 */
	is_inside(otherRectangle) {
		if(this.Top >= otherRectangle.Top &&
			this.Bottom <= otherRectangle.Bottom &&
			this.Left >= otherRectangle.Left &&
			this.Right <= otherRectangle.Right)
			return true;
		return false;
	}
	
	/**
	 * Returns a copy of this rectangle that can be safely edited without affecting the original.
	 * @returns {Rectangle}
	 */
	clone()
	{
		return new Rectangle(this.x, this.y, this.width, this.height);
	}
	
	toString() {
		return `[Rectangle @ (${this.x}, ${this.y}) ${this.width} x ${this.height}]`;
	}
}

/**
 * A rectangle with all it's values initalised to zero.
 * Don't forget to clone it before editing!
 * @type {Rectangle}
 */
Rectangle.Zero = new Rectangle(0, 0, 0, 0);

export default Rectangle;
