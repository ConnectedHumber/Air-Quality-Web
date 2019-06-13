<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;

use \AirQuality\PerfFormatter;

class Index implements IAction {
	/** @var TomlConfig */
	private $settings;
	
	/** @var \ParsedownExtra */
	private $parsedown_ext;
	
	public function __construct(
		TomlConfig $in_settings) {
		$this->settings = $in_settings;
	}
	
	public function handle() : bool {
		global $start_time;
		
		$start_handle = microtime(true);
		
		
		// 1: Parse markdown
		$result = "Welcome to the Air Quality Web HTTP API!

Although the web interface is the default thing you see, it actually uses this HTTP API as a backend - which can be interacted with directly.

Official usage documentation for the latest version of the API can be found here: https://aq.connectedhumber.org/__nightdocs/05-API-Docs.html

Note that if you have deployed your own version of the air quality web interface, you will need to ensure you're up-to-date with the latest commits in the \"master\" branch, otherwise the HTTP API documentation may not be completely accurate with respect to the version you're running.
";
		
		
		// 2: Send response
		header("content-length: " . strlen($result));
		header("content-type: text/plain");
		header("x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, null));
		echo($result);
		return true;
	}
}
