"use strict";

export default {
	version: "__VERSION__",
	build_date: new Date("__BUILD_DATE__"),
	// The url of api.php. Can be relative.
	api_root: "../api.php",
	// The default location to show on the map when loading the page.
	default_location: [ 53.76203,-0.35162 ],
	// The default zoom level to use when loading the page.
	default_zoom: 12,
	
	// The number of minutes to round dates to when making time-based HTTP API requests.
	// Very useful for improving cache hit rates.
	date_rounding_interval: 6,
	
	heatmap: {
		// The radius fo blobs on the heatmap
		blob_radius: 0.02
	}
}
