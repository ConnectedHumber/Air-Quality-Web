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
}
