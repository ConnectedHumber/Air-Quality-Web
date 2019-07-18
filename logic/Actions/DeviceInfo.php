<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;
use \AirQuality\Repositories\IDeviceRepository;
use \AirQuality\Repositories\ISensorRepository;
use \AirQuality\Repositories\IMeasurementTypeRepository;
use \AirQuality\ApiResponseSender;

use \AirQuality\Validator;


class DeviceInfo implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var \SBRL\PerformanceCounter */
	private $perfcounter;
	
	/** @var IDeviceRepository */
	private $device_repo;
	
	/** @var ISensorRepository */
	private $sensor_repo;
	
	/** @var IMeasurementTypeRepository */
	private $type_repo;
	
	/** @var ApiResponseSender */
	private $sender;
	
	/** @var Validator */
	private $validator;
	
	public function __construct(
		TomlConfig $in_settings,
		IDeviceRepository $in_device_repo,
		ISensorRepository $in_sensor_repo,
		ApiResponseSender $in_sender,
		\SBRL\PerformanceCounter $in_perfcounter) {
		$this->settings = $in_settings;
		$this->device_repo = $in_device_repo;
		$this->sensor_repo = $in_sensor_repo;
		$this->sender = $in_sender;
		$this->perfcounter = $in_perfcounter;
		
		$this->validator = new Validator($_GET);
	}
	
	public function handle() : bool {
		global $start_time;
		
		
		// 1: Validate params
		$this->validator->is_numberish("device-id");
		$this->validator->run();
		
		// 2: Pull data from database
		$this->perfcounter->start("sql");
		$data = $this->device_repo->get_device_info_ext(
			intval($_GET["device-id"])
		);
		$data_sensor = $this->sensor_repo->get_device_sensors(
			intval($_GET["device-id"])
		);
		$this->perfcounter->end("sql");
		
		// 2.5: Validate data from database
		if(empty($data)) {
			$this->sender->send_error_plain(404, "Error: No data could be found for that device id.", [
				[ "x-time-taken: ", $this->perfcounter->render() ]
			]);
			return false;
		}
		
		// 3: Serialise data
		$this->perfcounter->start("encode");
		$data["sensors"] = $data_sensor;
		$response = json_encode($data);
		$this->perfcounter->end("encode");
		
		// 4: Send response
		
		// Send a cache-control header, but only in production mode
		if($this->settings->get("env.mode") == "production") {
			header("cache-control: public, max-age=" . $this->settings->get("cache.max-age"));
		}
		
		header("content-length: " . strlen($response));
		header("content-type: application/json");
		header("x-time-taken: " . $this->perfcounter->render());
		echo($response);
		return true;
	}
}
