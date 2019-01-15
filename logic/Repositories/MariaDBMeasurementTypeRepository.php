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
	
	function __construct(\AirQuality\Database $in_database) {
		$this->database = $in_database;
	}
	
	
	
	public function is_valid_type(string $type_name) : boolean {
		return !empty($this->database->query(
			"SELECT $this->column_id FROM $this->table_name;",
			[]
		)->fetchColumn());
	}
	public function get_friendly_name(string $type_name) : string {
		return $this->database->query(
			"SELECT $this->column_friendly_text FROM $this->table_name WHERE $this->column_id = :type_name;", [
				"type_name" => $type_name
			]
		)->fetchColumn();
		// TODO: Cache results here? Maybe https://packagist.org/packages/thumbtack/querycache will be of some use
		throw new Exception("Error: Not implemented yet :-\\");
	}
	
    public function get_all_types() {
		return $this->database->query(
			"SELECT * FROM $this->table_name"
		)->fetchAll();
	}
}
