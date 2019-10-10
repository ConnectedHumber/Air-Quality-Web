<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;
use \AirQuality\Repositories\IDeviceRepository;
use \AirQuality\Repositories\IMeasurementTypeRepository;
use \AirQuality\ApiResponseSender;

use \AirQuality\Validator;


/**
 * Action that lists the devices near a given location.
 */
class ListDevicesNear implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var \SBRL\PerformanceCounter */
	private $perfcounter;
	
	/** @var IDeviceRepository */
	private $device_repo;
	
	/** @var IMeasurementTypeRepository */
	private $type_repo;
	
	/** @var ApiResponseSender */
	private $sender;
	
	/** @var Validator */
	private $validator_get;
	/** @var Validator */
	private $validator_post;
	
	public function __construct(
		TomlConfig $in_settings,
		IDeviceRepository $in_device_repo,
		ApiResponseSender $in_sender,
		\SBRL\PerformanceCounter $in_perfcounter) {
		$this->settings = $in_settings;
		$this->device_repo = $in_device_repo;
		$this->sender = $in_sender;
		$this->perfcounter = $in_perfcounter;
		
		$this->validator_get = new Validator($_GET);
		$this->validator_post = new Validator($_POST);
	}
	
	public function handle() : bool {
		global $start_time;
		
		if(strtolower($_SERVER["REQUEST_METHOD"]) !== "post") {
			$this->sender->send_error_plain(405, "Error: The devices-near action only takes a POST request, but you sent a {$_SERVER["REQUEST_METHOD"]} request. The parameters 'longitude' and 'latitude' should be specified in the POST body, and 'count' as a regular GET parameter.\nExample POST body (without quotes): 'latitude=12.345678&longitude=98.765432'\nDon't forget that the content-type header should be set to 'application/x-www-form-urlencoded'.", [
				[ "x-time-taken", $this->perfcounter->render() ]
			]);
			return false;
		}
		
		// 1: Validate params
		$this->validator_get->is_numberish("count");
		$this->validator_get->run();
		
		$this->validator_post->is_numberish("latitude");
		$this->validator_post->is_numberish("longitude");
		$this->validator_post->run();
		
		
		// 2: Pull data from database
		$this->perfcounter->start("sql");
		$data = $this->device_repo->get_near_location(
			floatval($_POST["latitude"]),
			floatval($_POST["longitude"]),
			intval($_GET["count"])
		);
		$this->perfcounter->end("sql");
		
		// 3: Serialise data
		$this->perfcounter->start("encode");
		$response = json_encode($data);
		$this->perfcounter->end("encode");
		
		// 4: Send response
		
		// Send a cache-control header, but only in production mode
		// FUTURE: Move last-seen to a different API call if caching becomes critically important?
		if($this->settings->get("env.mode") == "production") {
			header("cache-control: public, max-age=" . $this->settings->get("cache.max-age-supershort"));
		}
		
		header("content-length: " . strlen($response));
		header("content-type: application/json");
		header("x-time-taken: " . $this->perfcounter->render());
		echo($response);
		return true;
	}
}
