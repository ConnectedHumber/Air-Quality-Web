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
	
	/** Function that gets a static variable by it's name. Useful in preparing SQL queries. */
	private $get_static;
	
	private $get_static_extra;
	
	function __construct(Database $in_database, TomlConfig $in_settings) {
		$this->database = $in_database;
		$this->settings = $in_settings;
		
		$this->get_static = function($name) { return self::$$name; };
		$this->get_static_extra = function($class_name, $name) {
			return $class_name::$$name;
		};
	}
	
	public function get_readings_by_date(\DateTime $datetime, string $reading_type) {
		$s = $this->get_static;
		$o = $this->get_static_extra;
		return $this->database->query(
			"SELECT
				{$s("table_name_values")}.*,
				{$s("table_name_metadata")}.device_id,
				COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
					{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
				) AS datetime,
				COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_lat")},
					{$o(MariaDBDeviceRepository::class, "table_name")}.{$o(MariaDBDeviceRepository::class, "column_lat")}
				) AS latitude,
				COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_long")},
					{$o(MariaDBDeviceRepository::class, "table_name")}.{$o(MariaDBDeviceRepository::class, "column_long")}
				) AS longitude
			FROM {$s("table_name_values")}
			JOIN {$s("table_name_metadata")} ON {$s("table_name_values")}.{$s("column_values_reading_id")} = {$s("table_name_metadata")}.id
			JOIN {$o(MariaDBDeviceRepository::class, "table_name")} ON {$s("table_name_metadata")}.{$s("column_metadata_device_id")} = {$o(MariaDBDeviceRepository::class, "table_name")}.{$o(MariaDBDeviceRepository::class, "column_device_id")}
			WHERE ABS(TIME_TO_SEC(TIMEDIFF(
				:datetime,
				COALESCE(
					{$s("table_name_metadata")}.{$s("column_metadata_recordedon")},
					{$s("table_name_metadata")}.{$s("column_metadata_storedon")}
				)
			))) < :max_reading_timediff
			AND 
				{$s("table_name_values")}.{$s("column_values_reading_type")} = :reading_type
			
				", [
				// The database likes strings, not PHP DateTime() instances
				"datetime" => $datetime->format(\DateTime::ISO8601),
				"reading_type" => $reading_type,
				"max_reading_timediff" => $this->settings->get("data.max_reading_timediff")
			]
		)->fetchAll();
	}
}
