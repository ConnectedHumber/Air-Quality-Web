<?php

namespace AirQuality;

use \SBRL\TomlConfig;
use Psr\Container\ContainerInterface;

/**
 * Holds the main database connection.
 */
class Database
{
	/** @var TomlConfig */
	private $settings;
	/** @var \SBRL\PerformanceCounter */
	private $perfcounter;
	
	/**
	 * Whether the database connection should be read only or not.
	 * Defaults to true, as we don't need to write _anything_ to the database.
	 * @var	bool
	 */
	private const read_only = true;
	private $connection;
	
	private $pdo_options = [
		// https://devdocs.io/php/pdo.setattribute
	    \PDO::ATTR_ERRMODE				=> \PDO::ERRMODE_EXCEPTION,
	    \PDO::ATTR_DEFAULT_FETCH_MODE	=> \PDO::FETCH_ASSOC,
	    \PDO::ATTR_EMULATE_PREPARES		=> false,
		\PDO::ATTR_AUTOCOMMIT			=> false
	];
	
	function __construct(TomlConfig $in_settings, \SBRL\PerformanceCounter $in_perfcounter) {
		$this->settings = $in_settings;
		$this->perfcounter = $in_perfcounter;
		
		$this->connect(); // Connect automagically
	}
	
	public function connect() {
		$this->perfcounter->start("dbconnect");
		$this->connection = new \PDO(
			$this->get_connection_string(),
			$this->settings->get("database.username"),
			$this->settings->get("database.password"),
			$this->pdo_options
		);
		// Make this connection read-only
		if(self::read_only)
			$this->connection->query("SET SESSION TRANSACTION READ ONLY;");
		$this->perfcounter->end("dbconnect");
	}
	
	public function query($sql, $variables = []) {
		// Replace tabs with spaces for debugging purposes
		$sql = str_replace("\t", "    ", $sql);
		
		if($this->settings->get("env.mode") == "development") {
			// error_log("[Database/SQL]" . var_export($variables, true));
			error_log("[Database/SQL] $sql");
		}
		
		// FUTURE: Optionally cache prepared statements?
		$statement = $this->connection->prepare($sql);
		$statement->execute($variables);
		return $statement; // fetchColumn(), fetchAll(), etc. are defined on the statement, not the return value of execute()
	}
	
	/**
	 * Returns the connection string to use to connect to the database.
	 * This is calculated from the values specified in the settings file.
	 * @return	string	The connection string.
	 */
	private function get_connection_string() {
		return "{$this->settings->get("database.type")}:host={$this->settings->get("database.host")};dbname={$this->settings->get("database.name")};charset=utf8mb4";
	}
	
}
