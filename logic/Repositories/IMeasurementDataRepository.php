<?php

namespace AirQuality\Repositories;

interface IMeasurementDataRepository {
	/**
	 * Returns the specified reading type for all devices at the specified date 
	 * and time.
	 * @param	DateTime	$datetime		The date and time to get the readings for.
	 * @param	string		$reading_type	The reading type to fetch.
	 * @return	array		The requested readings.
	 */
	public function get_readings_by_date(\DateTime $datetime, string $reading_type);
	
	/**
	 * Gets the first and last DateTimes of the readings for a specified device.
	 * @param	int			$device_id	The device id to fetch for.
	 * @return	DateTime[]	The first and last DateTimes for which readings are stored.
	 */
	public function get_device_reading_bounds(int $device_id);
	/**
	 * Gets the readings of a specified type for a specific device between the 2 given dates and times.
	 * @param	int			$device_id		The id of the device to fetch data for.
	 * @param	string		$reading_type	The reading type to fetch.
	 * @param	DateTime	$start			The starting DateTime.
	 * @param	DateTime	$end			The ending DateTime.
	 * @return	array		The requested data.
	 */
	public function get_readings_by_device(int $device_id, string $reading_type, \DateTime $start, \DateTime $end);
	
}
