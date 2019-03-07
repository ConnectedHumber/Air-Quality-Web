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

export { human_duration_unit };
