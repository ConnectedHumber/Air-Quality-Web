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
	
	/** Functions that get a static variable by it's name. Useful in preparing SQL queries. */
	private $get_static;
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
		$s = $this->get_static;
		$o = $this->get_static_extra;
		return $this->database->query(
			"SELECT
				{$s("table_name")}.*,
				COUNT({$s("table_name")}.{$s("column_id")}) AS count
			FROM {$o(MariaDBMeasurementDataRepository::class, "table_name_values")}
			JOIN {$o(MariaDBMeasurementDataRepository::class, "table_name_metadata")} ON
				{$o(MariaDBMeasurementDataRepository::class, "table_name_metadata")}.{$o(MariaDBMeasurementDataRepository::class, "column_metadata_id")} = {$o(MariaDBMeasurementDataRepository::class, "table_name_values")}.{$o(MariaDBMeasurementDataRepository::class, "column_values_reading_id")}
			JOIN {$s("table_name")} ON
				{$s("table_name")}.{$s("column_id")} = {$o(MariaDBMeasurementDataRepository::class, "table_name_values")}.{$o(MariaDBMeasurementDataRepository::class, "column_values_reading_type")}
			WHERE {$o(MariaDBMeasurementDataRepository::class, "table_name_metadata")}.{$o(MariaDBMeasurementDataRepository::class, "column_metadata_device_id")} = :device_id
			GROUP BY {$s("table_name")}.{$s("column_id")};", [
				"device_id" => $device_id
			]
		)->fetchAll();
	}
}
