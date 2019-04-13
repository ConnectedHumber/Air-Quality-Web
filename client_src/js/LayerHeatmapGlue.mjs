"use strict";

class LayerHeatmapGlue {
	constructor(time_dimension, heatmap) {
		this.time_dimension = time_dimension;
		
		this.heatmap = heatmap;
		
		this.glue_layer_const = L.TimeDimension.Layer.extend({
			isReady: this.isReady,
		});
		
		this.cache = {};
	}
	
	attachTo(map) {
		this.layer_glue = new this.glue_layer_const({
			timeDimension: this.time_dimension
		}).addTo(map);
		this.time_dimension.on("timeload", this.update.bind(this));
		this.time_dimension.on("timeloading", this.onNewTime.bind(this));
		// this.time_dimension.registerSyncedLayer(this.layer_glue);
	}
	
	async onNewTime(event) {
		console.log("on-new-time", arguments);
		// event.time here is a number - TODO: Figure out how to keep it as a date
		
		if(typeof this.cache[event.time] == "undefined") {
			await this.loadTime(new Date(event.time));
		}
		
		this.fireLoadComplete(event.time);
	}
	
	/**
	 * Loads data into the cache for the specified datetime.
	 * @param  {Date} time The datetime to load data in for.
	 * @return {[type]}      [description]
	 */
	async loadTime(time) {
		await this.heatmap.fetch_data(
			time,
			this.heatmap.reading_type
		);
	}
	
	/**
	 * Fires the loadComplete event to leaflet-timedimension know we're done loading.
	 * @param	{Number}	time	The timestamp to fire the timeload event for.
	 */
	fireLoadComplete(time) {
		this.layer_glue.fire("timeload", {
			time: time
		});
	}
	
	/**
	 * Tells leaflet-timedimension if we're ready for a given time.
	 * @param	{object}	event	The event object
	 * @return	{Boolean}	Whether we're ready or not
	 */
	isReady(event) {
		// BUG: This will go awry if the user changes the reading type on the fly
		// console.log("is-ready", arguments);
		return this.heatmap.is_data_cached(
			new Date(event.time),
			this.heatmap.reading_type
		);
	}
	
	/**
	 * Passes an update to the heatmap manager
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	async update(event) {
		//console.log("update", arguments);
		await this.heatmap.update_data(
			new Date(event.time),
			this.heatmap.reading_type
		);
	}
}

export default LayerHeatmapGlue;
