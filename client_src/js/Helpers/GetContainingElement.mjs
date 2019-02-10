"use strict";

/**
 * Gets the first containing parent element of a given type for a given child element.
 * @param {HTMLElement} element The child element to find the parent of.
 * @param {string}      type  The name of the element containing parent to search for.
 */
function GetContainingElement(element, type)
{
	while(element !== null && element.tagName.toLowerCase() !== type.toLowerCase()) {
		element = element.parentNode;
	}
	return element;
}

export default GetContainingElement;
