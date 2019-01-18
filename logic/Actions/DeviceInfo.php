<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;
use \AirQuality\Repositories\IDeviceRepository;
use \AirQuality\ApiResponseSender;

use \AirQuality\Validator;
use \AirQuality\PerfFormatter;

class DeviceInfo implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var IDeviceRepository */
	private $device_repo;
	
	/** @var IMeasurementTypeRepository */
	private $type_repo;
	
	/** @var ApiResponseSender */
	private $sender;
	
	/** @var Validator */
	private $validator;
	
	public function __construct(
		TomlConfig $in_settings,
		IDeviceRepository $in_device_repo,
		ApiResponseSender $in_sender) {
		$this->settings = $in_settings;
		$this->device_repo = $in_device_repo;
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
		$data = $this->device_repo->get_device_info_ext(
			$_GET["device-id"]
		);
		
		// 2.5: Validate data from database
		if(empty($data)) {
			$this->sender->send_error_plain(404, "Error: No data could be found for that device id.", [
				[ "x-time-taken: ", PerfFormatter::format_perf_data($start_time, $start_handle, null) ]
			]);
			return false;
		}
		
		// 3: Serialise data
		$start_encode = microtime(true);
		$response = json_encode($data);
		
		// 4: Send response
		
		// Send a cache-control header, but only in production mode
		if($this->settings->get("env.mode") == "production") {
			header("cache-control: public, max-age=" . $this->settings->get("cache.max-age"));
		}
		
		header("content-length: " . strlen($response));
		header("content-type: application/json");
		header("x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, $start_encode));
		echo($response);
		return true;
	}
}
