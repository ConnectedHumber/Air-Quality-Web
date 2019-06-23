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
	/**
	 * The internal PDO connection to the database.
	 * @var \PDO
	 */
	private $connection;
	
	/**
	 * The PDO connection options.
	 * @var array
	 */
	private $pdo_options = [
		// https://devdocs.io/php/pdo.setattribute
	    \PDO::ATTR_ERRMODE				=> \PDO::ERRMODE_EXCEPTION,
	    \PDO::ATTR_DEFAULT_FETCH_MODE	=> \PDO::FETCH_ASSOC,
	    \PDO::ATTR_EMULATE_PREPARES		=> false,
		\PDO::ATTR_AUTOCOMMIT			=> false
	];
	
	/**
	 * Initialises a new Database class instance that manages a single 
	 * connection to a database.
	 * @param	TomlConfig					$in_settings	The settings object to use to connect to the database
	 * @param	\SBRL\PerformanceCounter	$in_perfcounter	The performance counter for debugging purposes.
	 */
	function __construct(TomlConfig $in_settings, \SBRL\PerformanceCounter $in_perfcounter) {
		$this->settings = $in_settings;
		$this->perfcounter = $in_perfcounter;
		
		$this->connect(); // Connect automagically
	}
	
	/**
	 * Initailises the connection to the database according to the currently loaded settings.
	 * @return void
	 */
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
	
	/**
	 * Makes a query against the database.
	 * @param	string	$sql		The (potentially parametised) query to make.
	 * @param	array	$variables	Optional. The variables to substitute into the SQL query.
	 * @return	\PDOStatement		The result of the query, as a PDOStatement.
	 */
	public function query($sql, $variables = []) {
		// Replace tabs with spaces for debugging purposes
		$sql = str_replace("\t", "    ", $sql);
		
		if($this->settings->get("env.mode") == "development") {
			error_log("[Database/SQL:Variables]" . var_export($variables, true));
			error_log("[Database/SQL:Exec] $sql");
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
