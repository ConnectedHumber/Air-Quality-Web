<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;

use \AirQuality\PerfFormatter;

class Version implements IAction {
	/** @var TomlConfig */
	private $settings;
	
	
	public function __construct(
		TomlConfig $in_settings) {
		$this->settings = $in_settings;
	}
	
	public function handle() : bool {
		global $start_time;
		
		$start_handle = microtime(true);
		
		
		// 1: Parse markdown
		$result = file_get_contents(ROOT_DIR."version");
		
		
		// 2: Send response
		header("content-length: " . strlen($result));
		header("content-type: text/plain");
		header("x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, null));
		echo($result);
		return true;
	}
}
