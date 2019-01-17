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
	
	/** Function that gets a static variable by it's name. Useful in preparing SQL queries. */
	private $get_static;
	
	function __construct(\AirQuality\Database $in_database) {
		$this->database = $in_database;
		
		$this->get_static = function($name) { return self::$$name; };
	}
	
	
	public function get_all_devices($only_with_location) {
		$s = $this->get_static;
		
		$sql = "SELECT
			{$s("column_device_id")},
			{$s("column_device_name")},
			{$s("column_lat")},
			{$s("column_long")}
		FROM {$s("table_name")}";
		
		if($only_with_location)
			$sql .= "\nWHERE
				{$s("column_lat")} IS NOT NULL
				AND {$s("column_long")} IS NOT NULL";
		
		$sql .= ";";
		
		return $this->database->query($sql)->fetchAll();
	}
}
