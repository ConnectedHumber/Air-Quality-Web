<?php

namespace AirQuality\Repositories;

use \AirQuality\Constants;
use \AirQuality\Database;
use \SBRL\TomlConfig;

/**
 * Fetches measurement readings from a MariaDB database.
 */
class MariaDBMeasurementDataRepository implements IMeasurementDataRepository {
	public static $table_name_metadata = "readings";
	public static $table_name_values = "reading_values";
	
	public static $column_values_id = "id";
	public static $column_values_reading_id = "reading_id";
	public static $column_values_value = "value";
	public static $column_values_reading_type = "reading_value_types_id";
	
	public static $column_metadata_id = "id";
	public static $column_metadata_storedon = "storedon";
	public static $column_metadata_recordedon = "recordedon";
	/**
	 * A coaleasce of storedon and recorded on.
	 * @var string
	 */
	public static $column_metadata_datetime = "datetime";
	public static $column_metadata_device_id = "device_id";
	public static $column_metadata_lat = "reading_latitude";
	public static $column_metadata_long = "reading_longitude";
	
	public static $column_metadata_datetime_poly;
	
	// ------------------------------------------------------------------------
	
	/** @var TomlConfig */
	private $settings;
	
	/**
	 * The database connection.
	 * @var Database
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
	 * Creates a new reepository instance.
	 * It is suggested that PHP-DI is utilised for instantiation via the associated interface.
	 * @param Database   $in_database The database connection to use.
	 * @param TomlConfig $in_settings The settings to operate with.
	 */
	function __construct(Database $in_database, TomlConfig $in_settings) {
		$this->database = $in_database;
		$this->settings = $in_settings;
		
		self::$column_metadata_datetime_poly = "COALESCE(".self::$table_name_metadata.".".self::$column_metadata_recordedon.",".self::$table_name_metadata.".".self::$column_metadata_storedon.")";
		
		
		$this->get_static = function($name) { return self::$$name; };
		$this->get_static_extra = function($class_name, $name) {
			return $class_name::$$name;
		};
	}
	
	public function get_readings_by_date(\DateTime $datetime, int $type_id) {
		$max_reading_timediff = $this->settings->get("data.max_reading_timediff");
		
		$start_datetime = (clone $datetime)->sub(new \DateInterval("PT${max_reading_timediff}S"));
		$end_datetime = (clone $datetime)->add(new \DateInterval("PT${max_reading_timediff}S"));
		
		$s = $this->get_static;
		$o = $this->get_static_extra;
		
		// OPTIMIZE: I think we can drastically improve the performance of this query by pre-calculating the start & end dates of the window
		return $this->database->query(
			"SELECT
				{$s("table_name_values")}.{$s("column_values_value")},
				{$s("table_name_values")}.{$s("column_values_reading_id")},
				
				{$s("table_name_metadata")}.{$s("column_metadata_device_id")},
				{$s("column_metadata_datetime_poly")} AS datetime,
				COUNT({$s("table_name_metadata")}.{$s("column_metadata_device_id")}) AS record_count
			FROM {$s("table_name_values")}
			JOIN {$s("table_name_metadata")} ON {$s("table_name_values")}.{$s("column_values_reading_id")} = {$s("table_name_metadata")}.id
			WHERE
			{$s("column_metadata_datetime_poly")} >= :start_datetime AND
			{$s("column_metadata_datetime_poly")} <= :end_datetime
			AND 
				{$s("table_name_values")}.{$s("column_values_reading_type")} = :reading_type
			GROUP BY {$s("table_name_metadata")}.{$s("column_metadata_device_id")}
			ORDER BY {$s("column_metadata_datetime_poly")}
				", [
				"reading_type" => $type_id,
				// The database likes strings, not PHP DateTime() instances
				"start_datetime" => $start_datetime->format(Constants::DATETIME_FORMAT_SQL),
				"end_datetime" => $end_datetime->format(Constants::DATETIME_FORMAT_SQL),
			]
		)->fetchAll();
	}
	
	public function get_device_reading_bounds(int $device_id) {
		$s = $this->get_static;
		return $this->database->query(
			"SELECT
				MIN({$s("column_metadata_datetime_poly")}) AS start,
				MAX({$s("column_metadata_datetime_poly")}) AS end
			FROM {$s("table_name_metadata")}
			WHERE {$s("table_name_metadata")}.{$s("column_metadata_device_id")} = :device_id;", [
				"device_id" => $device_id
			]
		)->fetch();
	}
	
	public function get_readings_by_device(int $device_id, int $type_id, \DateTime $start, \DateTime $end, int $average_seconds = 1) {
		if($average_seconds < 1)
			throw new \Exception("Error: average_seconds must be greater than 1, but '$average_seconds' was specified.");
		$s = $this->get_static;
		return $this->database->query(
			"SELECT
				AVG({$s("table_name_values")}.{$s("column_values_value")}) AS {$s("column_values_value")},
				MIN({$s("table_name_values")}.{$s("column_values_reading_id")}) AS {$s("column_values_reading_id")},
				
				MIN({$s("column_metadata_datetime_poly")}) AS datetime
			FROM {$s("table_name_values")}
			JOIN {$s("table_name_metadata")} ON
				{$s("table_name_metadata")}.{$s("column_metadata_id")} = {$s("table_name_values")}.{$s("column_values_reading_id")}
			WHERE
				{$s("table_name_metadata")}.{$s("column_metadata_device_id")} = :device_id AND
				{$s("table_name_values")}.{$s("column_values_reading_type")} = :reading_type AND
				
				{$s("column_metadata_datetime_poly")} >= :start_datetime AND
				{$s("column_metadata_datetime_poly")} <= :end_datetime
			GROUP BY CEIL(UNIX_TIMESTAMP({$s("column_metadata_datetime_poly")}) / :average_seconds);", [
				"device_id" => $device_id,
				"reading_type" => $type_id,
				"start_datetime" => $start->format(Constants::DATETIME_FORMAT_SQL),
				"end_datetime" => $end->format(Constants::DATETIME_FORMAT_SQL),
				"average_seconds" => $average_seconds
			]
		)->fetchAll();
	}
	
	public function get_recent_readings(int $device_id, int $type_id, int $count) {
		if($count <= 0) return [];
		
		$s = $this->get_static;
		return $this->database->query(
			"SELECT
				{$s("table_name_values")}.{$s("column_values_value")} AS {$s("column_values_value")},
				{$s("table_name_values")}.{$s("column_values_reading_id")} AS {$s("column_values_reading_id")},
				
				{$s("column_metadata_datetime_poly")} AS datetime
			FROM {$s("table_name_values")}
			JOIN {$s("table_name_metadata")} ON
				{$s("table_name_metadata")}.{$s("column_metadata_id")} = {$s("table_name_values")}.{$s("column_values_reading_id")}
			WHERE
				{$s("table_name_metadata")}.{$s("column_metadata_device_id")} = :device_id AND
				{$s("table_name_values")}.{$s("column_values_reading_type")} = :reading_type
			ORDER BY {$s("column_metadata_datetime_poly")} DESC
			LIMIT :count;", [
				"device_id" => $device_id,
				"reading_type" => $type_id,
				"count" => $count
			]
		)->fetchAll();
	}
}
