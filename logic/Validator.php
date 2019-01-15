<?php
namespace AirQuality;

class Validator {
	private $target_data;
	private $tests = [];
	
	public function __construct($in_target_data) {
		$this->target_data = $in_target_data;
	}
	
	public function exists($key) {
		$this->add_test(
			$key,
			function($data) { return isset($data); },
			400,
			"Error: The field $key wasn't found in your request."
		);
	}
	
	public function is_numberish($key) {
		$this->add_test(
			$key,
			function($data) { return is_numeric($data); },
			400,
			"Error: The field $key in your request isn't a number."
		);
	}
	public function is_min_length($key, $min_length) {
		$this->add_test(
			$key,
			function($data) use ($min_length) { return mb_strlen($data) >= $min_length; },
			400,
			"Error: The field $key is too short - it must be a minimum of $min_length characters."
		);
	}
	public function is_max_length($key, $max_length) {
		$this->add_test(
			$key,
			function($data) use ($max_length) { return mb_strlen($data) <= $max_length; },
			400,
			"Error: The field $key is too long - it must be a maximum of $max_length characters."
		);
	}
	
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
	
	public function add_test($key, $test, $response_code, $message) {
		$new_test = [
			"key" => $key,
			"test" => $test,
			"response_code" => $response_code,
			"message" => $message
		];
		
		$this->tests[] = $new_test;
	}
	
	protected function send_error($code, $message) {
		http_response_code($code);
		header("content-type: text/plain");
		exit($message);
	}
	
	public function run() {
		foreach($this->tests as $test) {
			
			if(!isset($this->target_data[$test["key"]]) || !$test["test"]($this->target_data[$test["key"]])) {
				$this->send_error($test["response_code"], $test["message"]);
			}
			
		}
	}
	
	
}
