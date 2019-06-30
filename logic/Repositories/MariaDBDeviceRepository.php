<?php

namespace AirQuality\Repositories;

use \AirQuality\Repositories\MariaDBMeasurementDataRepository;

use Location\Coordinate;
use Location\Distance\Vincenty;


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
	public static $column_point = "lat_lon";
	public static $column_altitude = "device_altitude";
	
	public static $table_name_type = "device_types";
	public static $column_type_id = "device_type";
	public static $column_type_processor = "processor";
	public static $column_type_connection = "Connection";
	public static $column_type_particle_sensor = "particle_sensor";
	public static $column_type_temp_sensor = "temp_sensor";
	public static $column_type_power = "power";
	public static $column_type_software = "Software";
	public static $column_type_notes = "Other";

	
	
	// ------------------------------------------------------------------------
	
	/**
	 * The database connection.
	 * @var \AirQuality\Database
	 */
	private $database;
	
	/**
	 * The distance calculator. From the mjaschen/phpgeo library on packagist.
	 * @var Vincenty
	 */
	private $distance_calculator;
	
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
	
	function __construct(\AirQuality\Database $in_database, Vincenty $in_distance_calculator) {
		$this->database = $in_database;
		$this->distance_calculator = $in_distance_calculator;
		
		$this->get_static = function($name) { return self::$$name; };
		$this->get_static_extra = function($class_name, $name) {
			return $class_name::$$name;
		};
	}
	
	
	public function get_all_devices($only_with_location) {
		$s = $this->get_static;
		$o = $this->get_static_extra;
		
		$data_repo_name = MariaDBMeasurementDataRepository::class;
		$data_repo_table_meta = $o($data_repo_name, "table_name_metadata");
		$data_repo_col_datetime = "$data_repo_table_meta.{$o($data_repo_name, "column_metadata_datetime")}";
		$data_repo_col_device_id = "$data_repo_table_meta.{$o($data_repo_name, "column_metadata_device_id")}";
		
		$sql = "SELECT
			{$s("table_name")}.{$s("column_device_id")} AS id,
			{$s("table_name")}.{$s("column_device_name")} AS name,
			{$s("table_name")}.{$s("column_lat")} AS latitude,
			{$s("table_name")}.{$s("column_long")} AS longitude,
			{$s("table_name")}.{$s("column_altitude")} AS altitude,
			{$s("table_name")}.{$s("column_device_type")} AS type_id,
			MAX($data_repo_col_datetime) AS last_seen
		FROM {$s("table_name")}
		JOIN $data_repo_table_meta ON
		   $data_repo_col_device_id = {$s("table_name")}.{$s("column_device_id")}";
		
		if($only_with_location)
			$sql .= "\nWHERE
				{$s("column_lat")} IS NOT NULL
				AND {$s("column_long")} IS NOT NULL";
		
		$sql .= "
		GROUP BY $data_repo_col_device_id;";
		
		return $this->database->query($sql)->fetchAll();
	}
	
	public function get_device_info_ext($device_id) {
		$s = $this->get_static;
		
		$query_result = $this->database->query(
			"SELECT
				{$s("table_name")}.{$s("column_device_id")} AS id,
				{$s("table_name")}.{$s("column_device_name")} AS name,
				{$s("table_name")}.{$s("column_lat")} AS latitude,
				{$s("table_name")}.{$s("column_long")} AS longitude,
				{$s("table_name")}.{$s("column_altitude")} AS altitude,
				{$s("table_name_type")}.*
			FROM {$s("table_name")}
			JOIN {$s("table_name_type")} ON
				{$s("table_name")}.{$s("column_device_type")} = {$s("table_name_type")}.{$s("column_type_id")}
			WHERE {$s("table_name")}.{$s("column_device_id")} = :device_id;", [
				"device_id" => $device_id
			]
		)->fetch(); // gets the next row from the query
		
		$result = [];
		foreach($query_result as $key => $value) {
			// Hack! Filter out some useless columns
			// We do this so that we can return everything we know about the 
			// device in a manner that means we don't need to alter this code 
			// if additional columns are added later.
			
			if($key == self::$column_type_id)
				continue;
			
			$result[strtolower($key)] = $value;
		}
		return $result;
	}
	
	public function get_near_location(float $lat, float $long, int $count) {
		$s = $this->get_static;
		
		$result = $this->database->query(
			"SELECT
				{$s("table_name")}.{$s("column_device_id")} AS id,
				{$s("table_name")}.{$s("column_device_name")} AS name,
				{$s("table_name")}.{$s("column_lat")} AS latitude,
				{$s("table_name")}.{$s("column_long")} AS longitude,
				ST_DISTANCE_SPHERE(POINT(:latitude, :longitude), {$s("table_name")}.{$s("column_point")}) AS distance_calc
			FROM {$s("table_name")}
			WHERE {$s("table_name")}.{$s("column_point")} IS NOT NULL
			ORDER BY ST_DISTANCE_SPHERE(POINT(:latitude_again, :longitude_again), {$s("table_name")}.{$s("column_point")})
			LIMIT :count;", [
				"latitude" => $lat,
				"longitude" => $long,
				"latitude_again" => $lat,
				"longitude_again" => $long,
				"count" => $count
			]
		)->fetchAll();
		
		// Calculate the *actual* distance in metres.
		// This is complicated and requires nasty formulae, so we're using a library here
		// FUTURE: Apparently said library supports caching with PSR-6 - maybe we could take advantage of a PSR-6 implementation both here and elsewhere?
		$loc = new Coordinate($lat, $long);
		foreach($result as &$item) {
			$item["distance_actual"] = $this->distance_calculator->getDistance(
				$loc,
				new Coordinate(
					floatval($item["latitude"]),
					floatval($item["longitude"])
				)
			);
		}
		
		return $result;
	}
}
