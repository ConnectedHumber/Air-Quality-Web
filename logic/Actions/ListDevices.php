<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;
use \SBRL\ResponseEncoder;
use \AirQuality\Repositories\IDeviceRepository;
use \AirQuality\ApiResponseSender;

use \AirQuality\PerfFormatter;

class ListDevices implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var IDeviceRepository */
	private $device_repo;
	
	/** @var ApiResponseSender */
	private $sender;
	
	public function __construct(
		TomlConfig $in_settings,
		IDeviceRepository $in_device_repo,
		ApiResponseSender $in_sender) {
		$this->settings = $in_settings;
		$this->device_repo = $in_device_repo;
		$this->sender = $in_sender;
	}
	
	public function handle() : bool {
		global $start_time;
		
		$start_handle = microtime(true);
		
		// 1: Parse & validate parameters
		$only_with_location = !empty($_GET["only-with-location"]);
		
		$format = $_GET["format"] ?? "json";
		if(!in_array($format, ["json", "csv"])) {
			$this->sender->send_error_plain(406,
				"Error: The format '$format' isn't recognised. Valid formats: " . implode(", ", $format) . "."
			);
			exit;
		}
		
		
		// 2: Pull data from database
		$data = $this->device_repo->get_all_devices($only_with_location);
		
		
		// 2.5: Validate data from database
		if(empty($data)) {
			$this->sender->send_error_plain(404,
				"Error: No devices are currently present in the system.",
				[ "x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, null) ]
			);
			return false;
		}
		
		
		// 3: Serialise data
		$start_encode = microtime(true);
		$response = null;
		$response_type = "application/octet-stream";
		$response_suggested_filename = "data-" . date(\DateTime::ATOM) . "";
		switch($format) {
			case "json":
				$response_type = "application/json";
				$response = json_encode($data);
				break;
			case "csv":
				$response_type = "text/csv";
				$response = ResponseEncoder::encode_csv($data);
				break;
		}
		
		// 4: Send response
		
		// Don't a cache control header, because new devices might get added at any time
		// TODO: Investigate adding a short-term (~10mins?) cache-control header here
		
		header("content-length: " . strlen($response));
		header("content-type: $response_type");
		header("content-disposition: inline; filename=$response_suggested_filename");
		header("x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, $start_encode));
		echo($response);
		return true;
	}
}
