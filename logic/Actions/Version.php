<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;


class Version implements IAction {
	/** @var TomlConfig */
	private $settings;
	
	/** @var \SBRL\PerformanceCounter */
	private $perfcounter;
	
	public function __construct(
		TomlConfig $in_settings,
		\SBRL\PerformanceCounter $in_perfcounter) {
		$this->settings = $in_settings;
		$this->perfcounter = $in_perfcounter;
	}
	
	public function handle() : bool {
		global $start_time;
		
		
		// 1: Parse markdown
		$result = file_get_contents(ROOT_DIR."version");
		
		
		// 2: Send response
		header("content-length: " . strlen($result));
		header("content-type: text/plain");
		header("x-time-taken: " . $this->perfcounter->render());
		echo($result);
		return true;
	}
}
