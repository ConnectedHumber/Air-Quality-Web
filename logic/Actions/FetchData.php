<?php

namespace AirQuality\Actions;


class FetchData {
	private $settings;
	private $validator;
	
	public function __construct(
		\SBRL\TomlConfig $in_settings) {
		$this->settings = $in_settings;
		$this->validator = new \AirQuality\Validator($_GET);
	}
	
	public function handle() : Boolean {
		global $start_time;
		
		// 1: Validate params
		$this->validator->is_datetime("datetime");
		$this->validator->run();
		
		// 2: Pull data from database
		
		// 2.5: Validate data from database
		
		// 3: Serialise data
		$response = json_encode("Coming soon");
		
		// 4: Send response
		header("x-time-taken: " . (microtime(true) - $start_time) . "ms");
		header("content-type: application/json");
		echo($response);
		return true;
	}
}
