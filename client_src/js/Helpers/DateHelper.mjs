"use strict";

function human_duration_unit(milliseconds) {
	let seconds = Math.floor(milliseconds / 1000);
	if(seconds <= 60) return "second";
	if(seconds <= 60*60) return "minute";
	if(seconds <= 60*60*24) return "hour";
	if(seconds <= 60*60*24*45) return "day";
	if(seconds <= 60*60*24*365) return "month";
	return "year";
}

/**
 * Calculates the time since a particular datetime and returns a
 * human-readable result.
 * @source Ported from PHP in Pepperminty Wiki	https://github.com/sbrl/Pepperminty-Wiki/blob/712e954/core/05-functions.php#L55-L89
 * @param	{Date}		datetime	The datetime to convert.
 * @return	{string}	The time since the given timestamp as a human-readable string.
 */
function human_time_since(datetime) {
	return human_time((new Date() - datetime) / 1000);
}
/**
 * Renders a given number of seconds as something that humans can understand more easily.
 * @source Ported from PHP in Pepperminty Wiki	https://github.com/sbrl/Pepperminty-Wiki/blob/712e954/core/05-functions.php#L55-L89
 * @param 	{int}		seconds	The number of seconds to render.
 * @return	{string}	The rendered time.
 */
function human_time(seconds)
{
	if(seconds < 0) return "the future";
	
	let tokens = new Map([
		[ 31536000, 'year' ],
		[ 2592000, 'month' ],
		[ 604800, 'week' ],
		[ 86400, 'day' ],
		[ 3600, 'hour' ],
		[ 60, 'minute' ],
		[ 1, 'second' ]
	]);
	for(let unit of tokens) {
		if (seconds < unit[0]) continue;
		numberOfUnits = Math.floor(seconds / unit[0]);
		return `${numberOfUnits} ${unit[1]}${((numberOfUnits > 1)?'s':'')} ago`;
	}
}

export {
	human_duration_unit,
	human_time_since, human_time
};
