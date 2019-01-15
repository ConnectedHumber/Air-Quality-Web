<?php

namespace AirQuality\Repositories;

/**
 * Fetches device info from a MariaDB database.
 */
class MariaDBMeasurementTypeRepository implements IMeasurementTypeRepository {
	public static $table_name = "reading_value_types";
	
	public static $column_id = "id";
	public static $column_friendly_text = "friendly_text";
	
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
	
	public function is_valid_type(string $type_name) : boolean {
		$s = $this->get_static;
		return !empty($this->database->query(
			"SELECT {$s("column_id")} FROM {$s("table_name")};"
		)->fetchColumn());
	}
	public function get_friendly_name(string $type_name) : string {
		// TODO: Cache results here? Maybe https://packagist.org/packages/thumbtack/querycache will be of some use
		
		$s = $this->get_static;
		return $this->database->query(
			"SELECT {$s("column_friendly_text")} FROM {$s("table_name")} WHERE $this->column_id = :type_name;", [
				"type_name" => $type_name
			]
		)->fetchColumn();
	}
	
    public function get_all_types() {
		$s = $this->get_static;
		return $this->database->query(
			"SELECT * FROM {$s("table_name")}"
		)->fetchAll();
	}
}
