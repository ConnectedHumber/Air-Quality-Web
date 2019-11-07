<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;
use \SBRL\ResponseEncoder;
use \AirQuality\Repositories\IMeasurementTypeRepository;
use \AirQuality\ApiResponseSender;


class ListReadingTypes implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var \SBRL\PerformanceCounter */
	private $perfcounter;
	
	/** @var IMeasurementTypeRepository */
	private $types_repo;
	
	/** @var ApiResponseSender */
	private $sender;
	
	public function __construct(
		TomlConfig $in_settings,
		IMeasurementTypeRepository $in_types_repo,
		ApiResponseSender $in_sender,
		\SBRL\PerformanceCounter $in_perfcounter) {
		$this->settings = $in_settings;
		$this->types_repo = $in_types_repo;
		$this->sender = $in_sender;
		$this->perfcounter = $in_perfcounter;
	}
	
	public function handle() : bool {
		global $start_time;
		
		
		// 1: Parse & validate parameters
		$device_id = !empty($_GET["device-id"]) ? intval($_GET["device-id"]) : null;
		$days_to_analyse = intval($_GET["days"] ?? "1") - 1;
		
		$format = $_GET["format"] ?? "json";
		if(!in_array($format, ["json", "csv"])) {
			$this->sender->send_error_plain(406,
				"Error: The format '$format' isn't recognised. Valid formats: " . implode(", ", $format) . "."
			);
			return false;
		}
		
		// 1: Pull data from database
		$data = null;
		
		$this->perfcounter->start("sql");
		if(!is_int($device_id))
			$data = $this->types_repo->get_all_types();
		else
			$data = $this->types_repo->get_types_by_device($device_id, $days_to_analyse);
		$this->perfcounter->end("sql");
		
		// 1.5: Validate data from database
		if(empty($data)) {
			header("x-notice: No reading types found for that request");
		}
		
		// 3: Serialise data
		$this->perfcounter->start("encode");
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
		$this->perfcounter->end("encode");
		
		// 4: Send response
		
		// Don't a cache control header, because new types might get added at any time
		// TODO: Investigate adding a short-term (~10mins?) cache-control header here
		
		// header("content-length: " . strlen($response));
		header("content-type: $response_type");
		header("content-disposition: inline; filename=$response_suggested_filename");
		header("x-time-taken: " . $this->perfcounter->render());
		echo($response);
		return true;
	}
}
