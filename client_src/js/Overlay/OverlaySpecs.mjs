"use strict";


var PM25 = {
	/*
	 * Range	Midpoint	Name		Colour
	 * 0 - 11	5.5			Low 1		#9CFF9C
	 * 12 - 23	17.5		Low 2		#31FF00
	 * 24 - 35	29.5		Low 3		#31CF00
	 * 36 - 41	38.5		Moderate 1	#FFFF00
	 * 42 - 47	44.5		Moderate 2	#FFCF00
	 * 48 - 53	50.5		Moderate 3	#FF9A00
	 * 54 - 58	56			High 1		#FF6464
	 * 59 - 64	61.5		High 2		#FF0000
	 * 65 - 70	67.5		High 3		#990000
	 * 71+		n/a			Very high	#CE30FF
	 */
	max: 75,
	gradient: {
		"0": "#9CFF9C", "5.5": "#9CFF9C", // Low 1
		"17.5": "#31FF00", // Low 2
		"29.5": "#31CF00", // Low 3
		"38.5": "#FFFF00", // Moderate 1
		"44.5": "#FFCF00", // Moderate 2
		"50.5": "#FF9A00", // Moderate 3
		"56": "#FF6464", // High 1
		"61.5": "#FF0000", // High 2
		"67.5": "#990000", // High 3
		"72.5": "#CE30FF", "75": "#CE30FF", // Very high
	}
};
var PM10 = {
	/*
	 * Range	Midpoint	Name		Colour
	 * 0-16		8			Low 1		#9CFF9C
	 * 17-33	25			Low 2		#31FF00
	 * 34-50	42			Low 3		#31CF00
	 * 51-58	54.5		Moderate 1	#FFFF00
	 * 59-66	62.5		Moderate 2	#FFCF00
	 * 67-75	71			Moderate 3	#FF9A00
	 * 76-83	79.5		High 1		#FF6464
	 * 84-91	87.5		High 2		#FF0000
	 * 92-100	96			High 3		#990000
	 * 101		105.5		Very High	#CE30FF
	 */
	max: 110,
	gradient: {
		"0": "#9CFF9C", "8": "#9CFF9C", // Low 1
		"25": "#31FF00", // Low 2
		"42": "#31CF00", // Low 3
		"54.5": "#FFFF00", // Moderate 1
		"62.5": "#FFCF00", // Moderate 2
		"71": "#FF9A00", // Moderate 3
		"79.5": "#FF6464", // High 1
		"87.5": "#FF0000", // High 2
		"96": "#990000", // High 3
		"105.5": "#CE30FF", "110": "#CE30FF", // Very high
	}
};
var humidity = {
	max: 100,
	gradient: {
		"0": "hsla(176, 77%, 40%, 0)",
		"50": "hsl(176, 77%, 40%)",
		"100": "blue"
	}
};
var temperature = {
	max: 40,
	gradient: {
		"0": "blue",
		"5": "cyan",
		"15": "green",
		"20": "yellow",
		"30": "orange",
		"40": "red"
	}
};
var pressure = {
	max: 1100,
	gradient: {
		"870": "purple",
		"916": "red",
		"962": "orange",
		"1008": "yellow",
		"1054": "green",
		"1100": "#BFED91"
	}
};
var unknown = {
	max: 100,
	gradient: {
		"0": "green",
		"100": "red"
	}
}

var specs = {
	PM10, PM25,
	humidity,
	temperature,
	pressure,
	unknown
};

export default specs;
export {
	PM10, PM25,
	humidity,
	temperature,
	pressure,
	unknown
};
