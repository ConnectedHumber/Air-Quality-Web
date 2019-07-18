<?php

namespace AirQuality\Repositories;

/**
 * Defines the interface of repositories that fetch information about sensors.
 */
interface ISensorRepository {
	/**
	 * Returns an array of all the different types of sensor that devices can 
	 * have.
	 * @return	array	An array of sensors.
	 */
	public function get_all_sensors();
	
	/**
	 * Returns a list of sensors that a given device posesses.
	 * @param	int		$device_id	The id of the device to return a list of sensors for.
	 * @return	array	An array of sensors that the device with the given id has.
	 */
	public function get_device_sensors(int $device_id) : array;
}
