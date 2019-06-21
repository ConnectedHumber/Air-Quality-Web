<?php

namespace AirQuality\Repositories;

/**
 * Defines the interface of repositories that fetch device information.
 */
interface IDeviceRepository {
	/**
	 * Returns an array of all the devices in the system with basic information
	 * about each.
	 * @param   bool    $only_with_location Whether only devices with a defined location should be returned.
	 * @return  array	A list of devices and their basic information.
	 */
	public function get_all_devices($only_with_location);
	
	/**
	 * Gets a bunch of information about a device.
	 * This method returns _considerably_ more information than the above one 
	 * that lists a bunch of devices, but only works for 1 device at a time.
	 * @param	int		$device_id	The id of the device to get information for.
	 * @return	array	The extended information available on the given device.
	 */
	public function get_device_info_ext($device_id);
	
	/**
	 * Gets a list of devices that are near the specified location.
	 * @param	float	$lat	The latitude of the location to get devices near.
	 * @param	float	$long	The longitude of the location to get devices near.
	 * @param	int		$count	The number of nearby devices to return.
	 * @return	array	An array of nearby devices.
	 */
	public function get_near_location(float $lat, float $long, int  $count);
}
