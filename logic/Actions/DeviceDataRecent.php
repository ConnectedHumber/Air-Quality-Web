<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;
use \SBRL\ResponseEncoder;
use \AirQuality\Repositories\IMeasurementDataRepository;
use \AirQuality\Repositories\IMeasurementTypeRepository;
use \AirQuality\ApiResponseSender;

use \AirQuality\Validator;


/**
 * Action that retrieves recent data for a device.
 */
class DeviceDataRecent implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var \SBRL\PerformanceCounter */
	private $perfcounter;
	
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
		ApiResponseSender $in_sender,
		\SBRL\PerformanceCounter $in_perfcounter) {
		$this->settings = $in_settings;
		$this->measurement_repo = $in_measurement_repo;
		$this->type_repo = $in_type_repo;
		$this->sender = $in_sender;
		$this->perfcounter = $in_perfcounter;
		
		$this->validator = new Validator($_GET);
	}
	
	public function handle() : bool {
		global $start_time;
		
		
		// 1: Validate params
		$this->validator->is_numberish("device-id");
		$this->validator->exists("reading-type");
		$this->validator->is_max_length("reading-type", 256);
		$this->validator->is_numberish("count");
		$this->validator->is_min("count", 0);
		$this->validator->is_max("count", $this->settings->get("limits.device_data_recent.max_rows"));
		
		if(!empty($_GET["format"]))
			$this->validator->is_preset_value("format", ["json", "csv"], 406);
		
		$this->validator->run();
		
		$format = $_GET["format"] ?? "json";
		
		$count = intval($_GET["count"]);
		
		$reading_type_id = $this->type_repo->get_id($_GET["reading-type"]);
		
		if($reading_type_id == null) {
			$this->sender->send_error_plain(
				400, "Error: That reading type is invalid.", [
					[ "x-time-taken", $this->perfcounter->render() ]
				]
			);
			return false;
		}
		
		// 2: Pull data from database
		$this->perfcounter->start("sql");
		$data = $this->measurement_repo->get_recent_readings(
			intval($_GET["device-id"]),
			$reading_type_id,
			$count
		);
		$this->perfcounter->end("sql");
		
		// 2.5: Validate data from database
		if(empty($data)) {
			http_response_code(404);
			header("content-type: text/plain");
			header("x-time-taken: " . $this->perfcounter->render());
			echo("Error: No data has been recorded from the device id for that measurement type in the selected time scale or it doesn't exist.");
			return false;
		}
		
		
		// 3: Serialise data
		
		// FUTURE: Refactor this into an AbstractAction or something, but the careful not to shift too much work there
		// We might want to consider a HttpResponse container or something if we can find a decent PSR implementation
		$this->perfcounter->start("encode");
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
		$this->perfcounter->end("encode");
		
		
		// 4: Send response
		header("content-length: " . strlen($response));
		header("content-type: $response_type");
		header("content-disposition: inline; filename=$response_suggested_filename");
		header("x-time-taken: " . $this->perfcounter->render());
		echo($response);
		return true;
	}
}
