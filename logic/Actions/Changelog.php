<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;

use \AirQuality\PerfFormatter;

class Changelog implements IAction {
	/** @var TomlConfig */
	private $settings;
	
	/** @var \ParsedownExtra */
	private $parsedown_ext;
	
	public function __construct(
		TomlConfig $in_settings,
		\ParsedownExtra $in_parsedown_ext) {
		$this->settings = $in_settings;
		$this->parsedown_ext = $in_parsedown_ext;
	}
	
	public function handle() : bool {
		global $start_time;
		
		$start_handle = microtime(true);
		
		
		// 1: Parse markdown
		$result = $this->parsedown_ext->text(file_get_contents(ROOT_DIR."Changelog.md"));
		
		
		// 2: Send response
		header("content-length: " . strlen($result));
		header("content-type: text/html");
		header("x-time-taken: " . PerfFormatter::format_perf_data($start_time, $start_handle, null));
		echo($result);
		return true;
	}
}
