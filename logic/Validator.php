<?php
namespace AirQuality;

/**
 * Makes validating user input easy.
 */
class Validator {
	/**
	 * The data that we test against.
	 * @var array
	 */
	private $target_data;
	/**
	 * An array of tests that we should run against the above target data.
	 * @var callable[]
	 */
	private $tests = [];
	
	/**
	 * Creates a new validator instance.
	 * @param array $in_target_data The target data to test against.
	 */
	public function __construct($in_target_data) {
		$this->target_data = $in_target_data;
	}
	
	/**
	 * Checks that the given key exists.
	 * @param  string $key The key that should exist.
	 * @return void
	 */
	public function exists(string $key) {
		$this->add_test(
			$key,
			function($data) { return isset($data); },
			400,
			"Error: The field $key wasn't found in your request."
		);
	}
	
	/**
	 * Ensures that the value associated with the specified key is a number.
	 * @param	string	$key	The key to check the value of.
	 * @return	void
	 */
	public function is_numberish(string $key) {
		$this->add_test(
			$key,
			function($data) { return is_numeric($data); },
			400,
			"Error: The field $key in your request isn't a number."
		);
	}
	
	/**
	 * Ensures that the value associated with the given key is at most a given 
	 * value.
	 * @param	string		$key	The key to test the value of.
	 * @param	int|float	$max	The maximum value allowed.
	 * @return	void
	 */
	public function is_max(string $key, $max) {
		$this->add_test(
			$key,
			function($data) use($max) { return floatval($data) <= $max; },
			400,
			"Error: The field $key in your request must be at most $max."
		);
	}
	/**
	 * Ensures that the value associated with the given key is at least a given 
	 * value.
	 * @param	string		$key	The key to test the value of.
	 * @param	int|float	$min	The minimum value allowed.
	 * @return	void
	 */
	public function is_min(string $key, $min) {
		$this->add_test(
			$key,
			function($data) use($min) { return floatval($data) >= $min; },
			400,
			"Error: The field $key in your request must be at least $min."
		);
	}
	/**
	 * Checks that the value associated with the given key is a least a given 
	 * number of characters long.
	 * This test is unicode aware.
	 * @param	string	$key		The key to check the value of.
	 * @param	int		$min_length	The minimum length required.
	 * @return	void
	 */
	public function is_min_length(string $key, int $min_length) {
		$this->add_test(
			$key,
			function($data) use ($min_length) { return mb_strlen($data) >= $min_length; },
			400,
			"Error: The field $key is too short - it must be a minimum of $min_length characters."
		);
	}
	/**
	 * Checks that the value associated with the given key is at most a given 
	 * number of characters long.
	 * This test is unicode aware.
	 * @param	string	$key		The key to check the value of.
	 * @param	int		$max_length	The maximum length allowed.
	 * @return	void
	 */
	public function is_max_length(string $key, int $max_length) {
		$this->add_test(
			$key,
			function($data) use ($max_length) { return mb_strlen($data) <= $max_length; },
			400,
			"Error: The field $key is too long - it must be a maximum of $max_length characters."
		);
	}
	/**
	 * Ensures that the value associated with the given key is one of a 
	 * predefined set of values.
	 * @param string $key        The key to check the associated value of.
	 * @param array  $values     The array of values to test against.
	 * @param int    $error_code The HTTP response code to return if the test fails.
	 */
	public function is_preset_value(string $key, array $values, int $error_code) {
		$this->add_test(
			$key,
			function($data) use ($values) {
				return in_array($data, $values);
			},
			$error_code,
			"Error: The value for the field $key is not valid. Valid values: " . implode(", ", $values) . "."
		);
	}
	
	/**
	 * Ensures that 2 keys have the same value.
	 * @param	string	$key_a		The first key.
	 * @param	string	$key_b		The second key.
	 * @param	string	$message	The message to return if the test fails.
	 * @return	void
	 */
	public function are_equal($key_a, $key_b, $message) {
		$key_b_data = $this->target_data[$key_b];
		$this->add_test(
			$key_a,
			function($data) use($key_b_data) {
				return $data === $key_b_data;
			},
			400,
			$message
		);
	}
	
	/**
	 * Ensures the value attached to a given key matches the specified regular 
	 * expression.
	 * @param  string $key     The key to check the value of.
	 * @param  string $regex   The regular expression to test the value with.
	 * @param  string $message Thee message to return if the test fails.
	 * @return void
	 */
	public function matches_regex($key, $regex, $message) {
		$this->add_test(
			$key,
			function($data) use($regex) {
				return preg_match($regex, $data) === 1;
			},
			400,
			$message
		);
	}
	
	/**
	 * Ensures the value associated with the specified key is a valid datetime.
	 * @param  string  $key The key of the value to check.
	 * @return void
	 */
	public function is_datetime($key) {
		$this->add_test(
			$key,
			function($data) {
				return strtotime($data) !== false;
			},
			400,
			"The datetime provided in the '$key' parameter is invalid."
		);
	}
	
	/**
	 * Add a custom test directly.
	 * It's suggested that you don't call this directly - insteaad edit this
	 * class' code to allow everyone to benefit from the improvement :-)
	 * @param	string		$key			The key to test the value of.
 	 * @param	callable	$test			The test to run.
	 * @param	int			$response_code	The HTTP response code to return if the test fails.
	 * @param	string		$message		The message to send if the test fails.
	 */
	public function add_test(string $key, callable $test, int $response_code, string $message) {
		$new_test = [
			"key" => $key,
			"test" => $test,
			"response_code" => $response_code,
			"message" => $message
		];
		
		$this->tests[] = $new_test;
	}
	
	/**
	 * Sends an error to the client and then exits.
	 * Don't put code after calling this method - it won't get executed!
	 * @param	int		$code		The HTTP response code to send.
 	 * @param	string	$message	The plain-text message to send.
	 */
	protected function send_error(int $code, string $message) {
		http_response_code($code);
		header("content-type: text/plain");
		exit($message);
	}
	
	/**
	 * Runs all the tests added to the validator so far.
	 * Note that this won't return if a test fails.
	 * @return	void
	 */
	public function run() {
		foreach($this->tests as $test) {
			
			if(!isset($this->target_data[$test["key"]]) || !$test["test"]($this->target_data[$test["key"]])) {
				$this->send_error($test["response_code"], $test["message"]);
			}
			
		}
	}
	
	
}
