<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;


class Index implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var \SBRL\PerformanceCounter */
	private $perfcounter;
	
	/** @var \ParsedownExtra */
	private $parsedown_ext;
	
	public function __construct(
		TomlConfig $in_settings,
		\SBRL\PerformanceCounter $in_perfcounter) {
		$this->settings = $in_settings;
		$this->perfcounter = $in_perfcounter;
	}
	
	public function handle() : bool {
		global $start_time;
		
		$this->perfcounter->start("handle");
		
		// 1: Parse markdown
		$result = "Welcome to the Air Quality Web HTTP API!

Although the web interface is the default thing you see, it actually uses this HTTP API as a backend - which can be interacted with directly.

Official usage documentation for the latest version of the API can be found here: https://sensors.connectedhumber.org/__nightdocs/05-API-Docs.html

Note that if you have deployed your own version of the air quality web interface, you will need to ensure you're up-to-date with the latest commits in the \"master\" branch, otherwise the HTTP API documentation may not be completely accurate with respect to the version you're running.
";
		
		
		// 2: Send response
		header("content-length: " . strlen($result));
		header("content-type: text/plain");
		header("x-time-taken: " . $this->perfcounter->render());
		echo($result);
		return true;
	}
}
