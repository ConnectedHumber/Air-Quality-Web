<?php

namespace AirQuality\Repositories;

use Location\Coordinate;
use Location\Distance\Vincenty;


/**
 * Fetches device info from a MariaDB database.
 */
class MariaDBSensorRepository implements ISensorRepository {
	public static $table_name = "sensors";
	public static $col_id = "id";
	public static $col_type = "Type";
	public static $col_description = "Description";
	
	public static $table_name_assoc = "device_sensors";
	public static $col_assoc_device_id = "device_id";
	public static $col_assoc_sensor_id = "sensors_id";
	
	public static $table_name_rtassoc = "sensor_reading_value_types";
	public static $col_rtassoc_sensor_id = "sensor_id";
	public static $col_rtassoc_rvt_id = "reading_value_types_id";
	
	
	// ------------------------------------------------------------------------
	
	/**
	 * The database connection.
	 * @var \AirQuality\Database
	 */
	private $database;
	
	/** 
	 * Function that gets a static variable by it's name. Useful in preparing SQL queries.
	 * @var callable
	 */
	private $get_static;
	/**
	 * Function that gets a static variable by it's name & class. Useful in preparing SQL queries.
	 * @var callable
	 */
	private $get_static_extra;
	
	/**
	 * Creates a new ISensorRepository implementation that's designed for 
	 * talking to MariaDB databases.
	 * @param	\AirQuality\Database	$in_database	The database connection instance to use to talk to the database.
	 */
	function __construct(\AirQuality\Database $in_database) {
		$this->database = $in_database;
		
		$this->get_static = function($name) { return self::$$name; };
		$this->get_static_extra = function($class_name, $name) {
			return $class_name::$$name;
		};
	}
	
	
	public function get_all_sensors() {
		$s = $this->get_static;
		
		return $this->database->query(
			"SELECT
				{$s("table_name")}.{$s("col_id")} AS id,
				{$s("table_name")}.{$s("col_type")} AS type,
				{$s("table_name")}.{$s("col_description")} AS description
			FROM {$s("table_name")};", [
				
			]
		)->fetchAll();
	}
	
	public function get_device_sensors(int $device_id) : array {
		$s = $this->get_static;
		
		return $this->database->query(
			"SELECT
				{$s("table_name")}.{$s("col_id")} AS id,
				{$s("table_name")}.{$s("col_type")} AS type,
				{$s("table_name")}.{$s("col_description")} AS description
			FROM {$s("table_name_assoc")}
			JOIN {$s("table_name")}
				ON {$s("table_name")}.{$s("col_id")} = {$s("table_name_assoc")}.{$s("col_assoc_sensor_id")}
			WHERE {$s("table_name_assoc")}.{$s("col_assoc_device_id")} = :device_id;", [
				"device_id" => $device_id
			]
		)->fetchAll();
	}
}
