<?php

namespace AirQuality\Repositories;

/**
 * Fetches measurement readings from a MariaDB database.
 */
class MariaDBMeasurementDataRepository implements IMeasurementDataRepository {
	public static $table_name_metadata = "readings";
	public static $table_name_values = "reading_values";
	
	public static $column_values_id = "id";
	public static $column_values_reading_id = "reading_id";
	public static $column_values_value = "value";
	public static $column_values_reading_value_types_id = "reading_value_types_id";
	
	public static $column_metadata_id = "id";
	public static $column_metadata_storedon = "storedon";
	public static $column_metadata_recordedon = "recordedon";
	public static $column_metadata_device_id = "device_id";
	public static $column_metadata_lat = "reading_latitude";
	public static $column_metadata_long = "reading_longitude";
	
	// ------------------------------------------------------------------------
	
	/**
	 * The database connection.
	 * @var \AirQuality\Database
	 */
	private $database;
	
	function __construct(\AirQuality\Database $in_database) {
		$this->database = $in_database;
	}
	
	public function get_readings_by_date(\DateTime $datetime, string $reading_type) {
		return $this->database->query(
			"SELECT
				$this->table_name_values.*,
				$this->table_name_metadata.device_id,
				COALESCE(
					$this->table_name_metadata.$this->column_metadata_recordedon,
					$this->table_name_metadata.$this->column_metadata_storedon
				) AS datetime,
				COALESCE(
					$this->table_name_metadata.$this->column_metadata_lat,
					{MariaDBDeviceRepository::$table_name}.device_latitude
				) AS latitude,
				COALESCE(
					$this->table_name_metadata.$this->column_metadata_long,
					devices.device_longitude
				) AS longitude
			FROM $this->table_name_values
			JOIN $this->table_name_metadata ON $this->table_name_values.$this->column_values_reading_id = $this->table_name_metadata.id
			JOIN devices ON $this->table_name_metadata.$this->column_metadata_device_id = devices.device_id
			WHERE COALESCE(
				$this->table_name_metadata.$this->column_metadata_recordedon,
				$this->table_name_metadata.$this->column_metadata_storedon
			) = :datetime",
			[
				"datetime" => $datetime,
				"reading_type" => $reading_type
			]
		)->fetchAll();
	}
}
