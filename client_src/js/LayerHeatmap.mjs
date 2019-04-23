"use strict";

import HeatmapOverlay from 'leaflet-heatmap';

import Config from './Config.mjs';

import GetFromUrl from './Helpers/GetFromUrl.mjs';
import RenderGradient from './Helpers/RenderGradient.mjs';


class LayerHeatmap {
	/**
	 * Creates a new heatmap manager wrapper class fort he given map.
	 * @param	{L.Map}	in_map	The leaflet map to attach to.
	 */
	constructor(in_map, in_device_data) {
		this.map = in_map;
		this.device_data = in_device_data;
		
		this.overlay_config = {
			radius: Config.heatmap.blob_radius,
			minOpacity: 0.5,
			maxOpacity: 0.8,
			scaleRadius: true,
			useLocalExtrema: false,
			
			latField: "latitude",
			lngField: "longitude",
			valueField: "value",
			
			gradient: {  } // Automatically filled in further down
		};
		this.layer = new L.LayerGroup();
		this.map.addLayer(this.layer);
		this.recreate_overlay();
		
		// Custom configuration directives to apply based on the reading type displayed.
		this.reading_type_configs = {
			"PM25": {
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
			},
			"PM10": {
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
			},
			"humidity": {
				max: 100,
				gradient: {
					"0": "hsla(176, 77%, 40%, 0)",
					"50": "hsl(176, 77%, 40%)",
					"100": "blue"
				}
			},
			"temperature": {
				max: 40,
				gradient: {
					"0": "blue",
					"5": "cyan",
					"15": "green",
					"20": "yellow",
					"30": "orange",
					"40": "red"
				}
			},
			"pressure": {
				max: 1100,
				gradient: {
					"870": "purple",
					"916": "red",
					"962": "orange",
					"1008": "yellow",
					"1054": "green",
					"1100": "#BFED91"
				}
			}
		};
		
		this.reading_cache = new Map();
	}
	
	/**
	 * Re-creates the heatmap overlay layer.
	 * Needed sometimes internally to work around an annoying bug.
	 */
	recreate_overlay() {
		if(typeof this.heatmap != "undefined")
			this.layer.removeLayer(this.heatmap);
		this.heatmap = new HeatmapOverlay(this.overlay_config);
		this.layer.addLayer(this.heatmap);
	}
	
	/**
	 * Sets the display data to the given array of data points.
	 * @param {object[]} readings_list The array of data points to display.
	 */
	set_data(readings_list) {
		// Substitute in the device locations
		for(let reading of readings_list) {
			let device_info = this.device_data.get_by_id(reading.device_id);
			reading.latitude = device_info.latitude;
			reading.longitude = device_info.longitude;
		}
		
		let data_object = {
			max: 0,
			data: readings_list
		};
		
		if(typeof this.reading_type_configs[this.reading_type] != "undefined")
			data_object.max = this.reading_type_configs[this.reading_type].max;
		else
			data_object.max = readings_list.reduce((prev, next) => next.value > prev ? next.value : prev, 0);
		
		console.log("[map/heatmap] Displaying", this.reading_type, data_object);
		
		this.heatmap.setData(data_object);
	}
	
	/**
	 * Updates the heatmap with data for the specified datetime & reading type,
	 * fetching new data if necessary.
	 * @param	{Date}		datetime		The datetime to display.
	 * @param	{string}	reading_type	The reading type to display data for.
	 * @return	{Promise}	A promise that resolves when the operation is completed.
	 */
	async update_data(datetime, reading_type) {
		if(!(datetime instanceof Date))
			throw new Error("Error: 'datetime' must be an instance of Date.");
		if(typeof reading_type != "string")
			throw new Error("Error: 'reading_type' must be a string.");
		
		this.datetime = datetime;
		this.reading_type = reading_type;
		
		console.log("[map/heatmap] Updating values to", this.reading_type, "@", this.datetime);
		
		if(typeof this.reading_type_configs[this.reading_type] != "undefined") {
			this.overlay_config.gradient = RenderGradient(
				this.reading_type_configs[this.reading_type].gradient,
				this.reading_type_configs[this.reading_type].max
			);
			console.log("[map/heatmap] Gradient is now", this.overlay_config.gradient);
			this.recreate_overlay();
		}
		else {
			delete this.overlay_config.gradient;
		}
		
		try {
			this.set_data(await this.fetch_data(this.datetime, this.reading_type));
		} catch(error) {
			console.log(error);
			alert(error);
		}
	}
	
	/**
	 * Fetches & decodes data for the given datetime and the current reading type.
	 * @param	{Date}		datetime		The Date to fetch data for.
	 * @param	{string}	reading_type	The reading type code to fetch data for.
	 * @return	{Promise}	The requested data array, as the return value of a promise
	 */
	async fetch_data(datetime, reading_type) {
		let cache_key = `${reading_type}|${datetime.toISOString()}`;
		let result = this.reading_cache.get(cache_key);
		
		if(typeof result == "undefined") {
			result = JSON.parse(await GetFromUrl(
				`${Config.api_root}?action=fetch-data&datetime=${encodeURIComponent(datetime.toISOString())}&reading_type=${encodeURIComponent(reading_type)}`
			));
			this.prune_cache(100);
			this.reading_cache.set(cache_key, { data: result, inserted: new Date() });
		}
		else
			result = result.data;
		
		return result;
	}
	
	/**
	 * Prunes the reading cache, leaving at most newest_count items behind.
	 * The items inserted first are deleted first.
	 * @param  {Number} newest_count The numebr of items to leave behind in the cache.
	 * @returns {Number}	The number of items deleted from the cache.
	 */
	prune_cache(newest_count) {
		let items = [];
		for(let next_key of this.reading_cache) {
			let cache_item = this.reading_cache.get(next_key);
			if(typeof cache_item == "undefined") {
				this.reading_cache.delete(cache_item);
				continue;
			}
			items.push({
				key: next_key,
				date: cache_item.inserted
			});
		}
		items.sort((a, b) => a.date - b.date);
		let deleted = 0;
		for(let i = 0; i < items.length - newest_count; i++) {
			this.reading_cache.delete(this.items[i].key);
			deleted++;
		}
		return deleted;
	}
	
	/**
	 * Whether the reading cache contains data for the given datetime & reading type.
	 * @param	{Date}		datetime		The datetime to check.
	 * @param	{string}	reading_type	The reading type code to check.
	 * @return	{Boolean}	Whether the reading cache contains data for the requested datetime & reading type.
	 */
	is_data_cached(datetime, reading_type) {
		let cache_key = Symbol.for(`${reading_type}|${datetime.toISOString()}`);
		return this.reading_cache.has(cache_key);
	}
	
	
	async update_reading_type(reading_type) {
		await this.update_data(
			this.datetime,
			reading_type
		);
	}
	
	async refresh_display() {
		await this.update_data(
			this.datetime,
			this.reading_type
		);
	}
}

export default LayerHeatmap;
