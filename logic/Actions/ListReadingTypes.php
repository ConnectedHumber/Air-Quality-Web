<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;
use \SBRL\ResponseEncoder;
use \AirQuality\Repositories\IMeasurementTypeRepository;
use \AirQuality\ApiResponseSender;

use \AirQuality\PerfFormatter;

class ListReadingTypes implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var IMeasurementTypeRepository */
	private $types_repo;
	
	/** @var ApiResponseSender */
	private $sender;
	
	public function __construct(
		TomlConfig $in_settings,
		IMeasurementTypeRepository $in_types_repo,
		ApiResponseSender $in_sender) {
		$this->settings = $in_settings;
		$this->types_repo = $in_types_repo;
		$this->sender = $in_sender;
	}
	
	public function handle() : bool {
		global $start_time;
		
		$start_handle = microtime(true);
		
		// 1: Parse & validate parameters
		$device_id = !empty($_GET["device-id"]) ? intval($_GET["device-id"]) : null;
		
		$format = $_GET["format"] ?? "json";
		if(!in_array($format, ["json", "csv"])) {
			$this->sender->send_error_plain(406,
				"Error: The format '$format' isn't recognised. Valid formats: " . implode(", ", $format) . "."
			);
			return false;
		}
		
		// 1: Pull data from database
		$data = null;
		if(!is_int($device_id))
			$data = $this->types_repo->get_all_types();
		else
			$data = $this->types_repo->get_types_by_device($device_id);
		
		// 1.5: Validate data from database
		if(empty($data)) {
			header("x-notice: No reading types found for that request");
		}
		
		// 3: Serialise data
		$start_encode = microtime(true);
		$response = null;
		$response_type = "application/octet-stream";
		$response_suggested_filename = "data-" . date(\DateTime::ATOM) . "";
		switch($format) {
			case "json":
				$response_type = "application/json";
				$response_suggested_filename .= ".json";
				$response = json_encode($data);
				break;
			case "csv":
				$response_type = "text/csv";
				$response_suggested_filename .= ".csv";
				$response = ResponseEncoder::encode_csv($data);
				break;
		}
		
		// 4: Send response
		
		// Don't a cache control header, because new types might get added at any time
		// TODO: Investigate adding a short-term (~10mins?) cache-control header here
		
		header("content-length: " . strlen($response));
		header("content-type: $response_type");
		header("content-disposition: inline; filename=$response_suggested_filename");
		header("x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, $start_encode));
		echo($response);
		return true;
	}
}
