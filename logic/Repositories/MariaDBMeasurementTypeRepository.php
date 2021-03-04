<?php

namespace AirQuality\Repositories;

/**
 * Fetches device info from a MariaDB database.
 */
class MariaDBMeasurementTypeRepository implements IMeasurementTypeRepository {
	public static $table_name = "reading_value_types";
	
	public static $column_id = "id";
	public static $column_short_description = "short_descr";
	public static $column_friendly_text = "friendly_text";
	
	// ------------------------------------------------------------------------
	
	/**
	 * The database connection.
	 * @var \AirQuality\Database
	 */
	private $database;
	
	/**
	 * Functions that get a static variable by it's name. Useful in preparing SQL queries.
	 * @var callable
	 */
	private $get_static;
	/**
	 * Functions that get a static variable by it's class and property names. Useful in preparing SQL queries.
	 * @var callable
	 */
	private $get_static_extra;
	
	function __construct(\AirQuality\Database $in_database) {
		$this->database = $in_database;
		$this->get_static = function($name) { return self::$$name; };
		$this->get_static_extra = function($class_name, $name) {
			return $class_name::$$name;
		};
	}
	
	public function is_valid_type(int $id) : bool {
		$s = $this->get_static;
		return !empty($this->database->query(
			"SELECT {$s("column_id")} FROM {$s("table_name")} WHERE {$s("column_id")} = :id;", [
				"id" => $id
			]
		)->fetchColumn());
	}
	
	public function get_id(string $short_descr) {
		$s = $this->get_static;
		
		$result = $this->database->query(
			"SELECT {$s("column_id")} FROM {$s("table_name")} WHERE {$s("column_short_description")} = :short_descr", [
				"short_descr" => $short_descr
			]
		)->fetchColumn();
		
		if($result == false)
			return null;
		
		return $result;
	}
	
	public function get_friendly_name(int $id) : string {
		// TODO: Cache results here? Maybe https://packagist.org/packages/thumbtack/querycache will be of some use
		
		$s = $this->get_static;
		return $this->database->query(
			"SELECT {$s("column_friendly_text")} FROM {$s("table_name")} WHERE $this->column_id = :id;", [
				"id" => $id
			]
		)->fetchColumn();
	}
	
    public function get_all_types() {
		$s = $this->get_static;
		return $this->database->query(
			"SELECT * FROM {$s("table_name")}"
		)->fetchAll();
	}
	
	public function get_types_by_device($device_id) {
		$data = [
			"device_id" => $device_id
		];
		$s = $this->get_static;
		$o = $this->get_static_extra;
		
		$repo_device = MariaDBDeviceRepository::class;
		$repo_sensor = MariaDBSensorRepository::class;
		/*
		SELECT reading_value_types.*
		FROM devices
		JOIN device_sensors ON device_sensors.device_id = devices.device_id
		JOIN sensors ON sensors.id = device_sensors.sensors_id
		JOIN sensor_reading_value_types ON sensor_reading_value_types.sensor_id = sensors.id
		JOIN reading_value_types ON reading_value_types.id = sensor_reading_value_types.reading_value_types_id
		WHERE devices.device_id=10
		GROUP BY reading_value_types.id;
		 */
		return $this->database->query(
			"SELECT {$s("table_name")}.*
			FROM {$o($repo_device, "table_name")}
			JOIN {$o($repo_sensor, "table_name_assoc")}
				ON {$o($repo_sensor, "table_name_assoc")}.{$o($repo_sensor, "col_assoc_device_id")} = {$o($repo_device, "table_name")}.{$o($repo_device, "column_device_id")}
			JOIN {$o($repo_sensor, "table_name")}
				ON {$o($repo_sensor, "table_name_assoc")}.{$o($repo_sensor, "col_assoc_sensor_id")} = {$o($repo_sensor, "table_name")}.{$o($repo_sensor, "col_id")}
			JOIN {$o($repo_sensor, "table_name_rtassoc")}
				ON {$o($repo_sensor, "table_name")}.{$o($repo_sensor, "col_id")} = {$o($repo_sensor, "table_name_rtassoc")}.{$o($repo_sensor, "col_rtassoc_sensor_id")}
			JOIN {$s("table_name")}
				ON {$o($repo_sensor, "table_name_rtassoc")}.{$o($repo_sensor, "col_rtassoc_rvt_id")} = {$s("table_name")}.{$s("column_id")}
			WHERE {$o($repo_device, "table_name")}.{$o($repo_device, "column_device_id")} = :device_id
			GROUP BY {$s("table_name")}.{$s("column_id")};",
			$data
		)->fetchAll();
	}
}
