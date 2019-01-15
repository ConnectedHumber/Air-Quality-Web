<?php

namespace AirQuality\Repositories;

/**
 * Fetches device info from a MariaDB database.
 */
class MariaDBDeviceRepository implements IDeviceRepository {
	public static $table_name = "devices";
	public static $column_device_id = "device_id";
	public static $column_device_name = "device_name";
	public static $column_device_type = "device_type";
	public static $column_owner_id = "owner_id";
	public static $column_lat = "device_latitude";
	public static $column_long = "device_longitude";
	
	// ------------------------------------------------------------------------
	
	/**
	 * The database connection.
	 * @var \AirQuality\Database
	 */
	private $database;
	
	function __construct(\AirQuality\Database $in_database) {
		$this->database = $in_database;
	}
	
}
