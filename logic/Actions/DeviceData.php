<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;
use \SBRL\ResponseEncoder;
use \AirQuality\Repositories\IMeasurementDataRepository;
use \AirQuality\Repositories\IMeasurementTypeRepository;
use \AirQuality\ApiResponseSender;

use \AirQuality\Validator;
use \AirQuality\PerfFormatter;

class DeviceData implements IAction {
	/** @var TomlConfig */
	private $settings;
	
	/** @var IMeasurementDataRepository */
	private $measurement_repo;
	/** @var IMeasurementTypeRepository */
	private $type_repo;
	
	/** @var ApiResponseSender */
	private $sender;
	
	/** @var Validator */
	private $validator;
	
	public function __construct(
		TomlConfig $in_settings,
		IMeasurementDataRepository $in_measurement_repo,
		IMeasurementTypeRepository $in_type_repo,
		ApiResponseSender $in_sender) {
		$this->settings = $in_settings;
		$this->measurement_repo = $in_measurement_repo;
		$this->type_repo = $in_type_repo;
		$this->sender = $in_sender;
		
		$this->validator = new Validator($_GET);
	}
	
	public function handle() : bool {
		global $start_time;
		
		$start_handle = microtime(true);
		
		// 1: Validate params
		$this->validator->is_numberish("device-id");
		$this->validator->exists("reading-type");
		$this->validator->is_max_length("reading-type", 256);
		$this->validator->is_datetime("start");
		$this->validator->is_datetime("end");
		if(!empty($_GET["format"]))
			$this->validator->is_preset_value("format", ["json", "csv"], 406);
		
		$this->validator->run();
		
		$format = $_GET["format"] ?? "json";
		
		
		if(new \DateTime($_GET["start"]) > new \DateTime($_GET["end"])) {
			$this->sender->send_error_plain(
				400, "Error: The start date must be earlier than the end date.", [
					[ "x-time-taken", PerfFormatter::format_perf_data($start_time, $start_handle, null) ]
				]
			);
			return false;
		}
		
		if(!empty($_GET["average-seconds"]) && intval($_GET["average-seconds"]) == 0) {
			$this->sender->send_error_plain(
				400, "Error: That average-seconds value is invalid (an integer greater than 0 required).", [
					[ "x-time-taken", PerfFormatter::format_perf_data($start_time, $start_handle, null) ]
				]
			);
			return false;
		}
		
		$reading_type_id = $this->type_repo->get_id($_GET["reading-type"]);
		
		if($reading_type_id == null) {
			$this->sender->send_error_plain(
				400, "Error: That reading type is invalid.", [
					[ "x-time-taken", PerfFormatter::format_perf_data($start_time, $start_handle, null) ]
				]
			);
			return false;
		}
		
		// 2: Pull data from database
		$data = $this->measurement_repo->get_readings_by_device(
			intval($_GET["device-id"]),
			$reading_type_id,
			new \DateTime($_GET["start"]),
			new \DateTime($_GET["end"]),
			!empty($_GET["average-seconds"]) ? intval($_GET["average-seconds"]) : 1
		);
		
		// 2.5: Validate data from database
		if(empty($data)) {
			http_response_code(404);
			header("content-type: text/plain");
			header("x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, null));
			echo("Error: No data has been recorded from the device id for that measurement type in the selected time scale or it doesn't exist.");
			return false;
		}
		
		
		// 3: Serialise data
		$start_encode = microtime(true);
		$response_type = "application/octet-stream";
		$response_suggested_filename = "data-" . date(\DateTime::ATOM) . "";
		$response = null;
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
		header("content-length: " . strlen($response));
		header("content-type: $response_type");
		header("content-disposition: inline; filename=$response_suggested_filename");
		header("x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, $start_encode));
		echo($response);
		return true;
	}
}
