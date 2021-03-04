"use strict";

import Config from './Config.mjs';

import GetFromUrl from './Helpers/GetFromUrl.mjs';

class ReadingsData {
	constructor() {
		
	}
	
	/**
	 * Fetches the data from all currently active devices at a given datetime
	 * and for a given reading type.
	 * @param  {string}  reading_type     The reading type to fetch data for.
 	 * @param  {String|Date}  [datetime="now"] The datetime to fetch the data for.
	 * @return {Promise<Map>}                  A promise that resolves to a Map keyed by device IDs that contains the data objects returned by the fetch-data API action.
	 */
	async fetch(reading_type, datetime = "now") {
		if(datetime instanceof Date)
			datetime = datetime.toISOString();
		// TODO: memoize this
		let data = await this.__make_request(reading_type, datetime);
		let result = new Map();
		for(let item of data)
			result.set(item.device_id, item);
		
		return result;
	}
	
	async __make_request(reading_type, datetime) {
		return JSON.parse(await GetFromUrl(
			`${Config.api_root}?action=fetch-data&datetime=${encodeURIComponent(datetime)}&reading_type=${encodeURIComponent(reading_type)}`
		));
	}
}

export default ReadingsData;
