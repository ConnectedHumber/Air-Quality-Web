<?php

namespace AirQuality\Repositories;

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
	public static $column_metadata_device_id = "device_id";
	public static $column_metadata_lat = "reading_latitude";
	public static $column_metadata_long = "reading_longitude";
	
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
		
		$this->get_static = function($name) { return self::$$name; };
		$this->get_static_extra = function($class_name, $name) {
			return $class_name::$$name;
		};
	}
	
	public function get_readings_by_date(\DateTime $datetime, int $type_id) {
		$s = $this->get_static;
		$o = $this->get_static_extra;
		
		// OPTIMIZE: I think we can drastically improve the performance of this query by pre-calculating the start & end dates of the window
		return $this->database->query(
			"SELECT
				{$s("table_name_values")}.{$s("column_values_value")},
				{$s("table_name_values")}.{$s("column_values_reading_id")},
				
				{$s("table_name_metadata")}.{$s("column_metadata_device_id")},
				COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
					{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
				) AS datetime,
				COUNT({$s("table_name_metadata")}.{$s("column_metadata_device_id")}) AS record_count
			FROM {$s("table_name_values")}
			JOIN {$s("table_name_metadata")} ON {$s("table_name_values")}.{$s("column_values_reading_id")} = {$s("table_name_metadata")}.id
			WHERE ABS(TIME_TO_SEC(TIMEDIFF(
				:datetime,
				COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
					{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
				)
			))) < :max_reading_timediff
			AND 
				{$s("table_name_values")}.{$s("column_values_reading_type")} = :reading_type
			GROUP BY {$s("table_name_metadata")}.{$s("column_metadata_device_id")}
			ORDER BY {$s("table_name_metadata")}.{$s("column_metadata_recordedon")}
				", [
				// The database likes strings, not PHP DateTime() instances
				"datetime" => $datetime->format(\DateTime::ISO8601),
				"reading_type" => $type_id,
				"max_reading_timediff" => $this->settings->get("data.max_reading_timediff")
			]
		)->fetchAll();
	}
	
	public function get_device_reading_bounds(int $device_id) {
		$s = $this->get_static;
		return $this->database->query(
			"SELECT
				MIN(COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
					{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
				)) AS start,
				MAX(COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
					{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
				)) AS end
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
				
				MIN(COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
					{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
				)) AS datetime
			FROM {$s("table_name_values")}
			JOIN {$s("table_name_metadata")} ON
				{$s("table_name_metadata")}.{$s("column_metadata_id")} = {$s("table_name_values")}.{$s("column_values_reading_id")}
			WHERE
				{$s("table_name_metadata")}.{$s("column_metadata_device_id")} = :device_id AND
				{$s("table_name_values")}.{$s("column_values_reading_type")} = :reading_type AND
				
				COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
					{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
				) >= :start_datetime AND
				COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
					{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
				) <= :end_datetime
			GROUP BY CEIL(UNIX_TIMESTAMP(COALESCE(
				{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
				{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
			)) / :average_seconds);", [
				"device_id" => $device_id,
				"reading_type" => $type_id,
				"start_datetime" => $start->format(\DateTime::ISO8601),
				"end_datetime" => $end->format(\DateTime::ISO8601),
				"average_seconds" => $average_seconds
			]
		)->fetchAll();
	}
	
	public function get_recent_readings(int $device_id, int $type_id, int $count) {
		if($count <= 0) return [];
		
		$s = $this->get_static;
		return $this->database->query(
			"SELECT
				AVG({$s("table_name_values")}.{$s("column_values_value")}) AS {$s("column_values_value")},
				MIN({$s("table_name_values")}.{$s("column_values_reading_id")}) AS {$s("column_values_reading_id")},
				
				MIN(COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
					{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
				)) AS datetime
			FROM {$s("table_name_values")}
			JOIN {$s("table_name_metadata")} ON
				{$s("table_name_metadata")}.{$s("column_metadata_id")} = {$s("table_name_values")}.{$s("column_values_reading_id")}
			WHERE
				{$s("table_name_metadata")}.{$s("column_metadata_device_id")} = :device_id AND
				{$s("table_name_values")}.{$s("column_values_reading_type")} = :reading_type
			ORDER BY COALESCE(
				{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
				{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
			)
			LIMIT :count;", [
				"device_id" => $device_id,
				"reading_type" => $type_id,
				"count" => $count
			]
		)->fetchAll();
	}
}
