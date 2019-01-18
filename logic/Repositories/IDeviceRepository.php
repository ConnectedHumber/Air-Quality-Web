<?php

namespace AirQuality\Repositories;

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
}
