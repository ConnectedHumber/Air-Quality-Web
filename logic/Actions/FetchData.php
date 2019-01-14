<?php

namespace AirQuality\Actions;


class FetchData {
	private $settings;
	private $validator;
	
	public function __construct(
		\SBRL\TomlConfig $in_settings,
		\AirQuality\Database $in_database) {
		$this->settings = $in_settings;
		$this->database = $in_database;
		$this->validator = new \AirQuality\Validator($_GET);
	}
	
	public function handle() {
		$this->validator->is_datetime("datetime");
		$this->validator->run();
		
		echo("Params valid!");
	}
}
