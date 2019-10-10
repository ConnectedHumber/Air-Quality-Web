<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;
use \SBRL\ResponseEncoder;
use \AirQuality\Repositories\IDeviceRepository;
use \AirQuality\ApiResponseSender;


class ListDevices implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var IDeviceRepository */
	private $device_repo;
	/** @var \SBRL\PerformanceCounter */
	private $perfcounter;
	
	/** @var ApiResponseSender */
	private $sender;
	
	public function __construct(
		TomlConfig $in_settings,
		IDeviceRepository $in_device_repo,
		ApiResponseSender $in_sender,
		\SBRL\PerformanceCounter $in_perfcounter) {
		$this->settings = $in_settings;
		$this->device_repo = $in_device_repo;
		$this->sender = $in_sender;
		$this->perfcounter = $in_perfcounter;
	}
	
	public function handle() : bool {
		global $start_time;
		
		
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
		$this->perfcounter->start("sql");
		$data = $this->device_repo->get_all_devices($only_with_location);
		$this->perfcounter->end("sql");
		
		
		// 2.5: Validate data from database
		if(empty($data)) {
			$this->sender->send_error_plain(404,
				"Error: No devices are currently present in the system.",
				[ "x-time-taken: ", $this->perfcounter->render() ]
			);
			return false;
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
		
		// Don't cache for ages, because new devices might get added at any time
		// FUTURE: Move last-seen to a different API call if caching becomes critically important?
		if($this->settings->get("env.mode") == "production") {
			header("cache-control: public, max-age=" . $this->settings->get("cache.max-age-supershort"));
		}
		
		header("content-length: " . strlen($response));
		header("content-type: $response_type");
		header("content-disposition: inline; filename=$response_suggested_filename");
		header("x-time-taken: " . $this->perfcounter->render());
		echo($response);
		return true;
	}
}
