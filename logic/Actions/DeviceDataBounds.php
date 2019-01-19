<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;
use \AirQuality\Repositories\IMeasurementDataRepository;
use \AirQuality\ApiResponseSender;

use \AirQuality\Validator;
use \AirQuality\PerfFormatter;

class DeviceDataBounds implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var IMeasurementDataRepository */
	private $measurement_repo;
	
	/** @var ApiResponseSender */
	private $sender;
	
	/** @var Validator */
	private $validator;
	
	public function __construct(
		TomlConfig $in_settings,
		IMeasurementDataRepository $in_measurement_repo,
		ApiResponseSender $in_sender) {
		$this->settings = $in_settings;
		$this->measurement_repo = $in_measurement_repo;
		$this->sender = $in_sender;
		
		$this->validator = new Validator($_GET);
	}
	
	public function handle() : bool {
		global $start_time;
		
		$start_handle = microtime(true);
		
		// 1: Validate params
		$this->validator->is_numberish("device-id");
		$this->validator->run();
		
		
		// 2: Pull data from database
		$data = $this->measurement_repo->get_device_reading_bounds(
			intval($_GET["device-id"])
		);
		
		// 2.5: Validate data from database
		if(empty($data)) {
			http_response_code(404);
			header("content-type: text/plain");
			header("x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, null));
			echo("Error: No data has been recorded from the device id or it doesn't exist.");
			return false;
		}
		
		
		// 3: Serialise data
		$start_encode = microtime(true);
		$response = json_encode($data);
		
		
		// 4: Send response
		header("content-length: " . strlen($response));
		header("content-type: application/json");
		header("x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, $start_encode));
		echo($response);
		return true;
	}
}
