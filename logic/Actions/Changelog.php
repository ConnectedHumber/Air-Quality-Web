<?php

namespace AirQuality\Actions;

use \SBRL\TomlConfig;


class Changelog implements IAction {
	/** @var TomlConfig */
	private $settings;
	/** @var \SBRL\PerformanceCounter */
	private $perfcounter;
	
	/** @var \ParsedownExtra */
	private $parsedown_ext;
	
	public function __construct(
		TomlConfig $in_settings,
		\ParsedownExtra $in_parsedown_ext,
		\SBRL\PerformanceCounter $in_perfcounter) {
		$this->settings = $in_settings;
		$this->parsedown_ext = $in_parsedown_ext;
		$this->perfcounter = $in_perfcounter;
	}
	
	public function handle() : bool {
		global $start_time;
		
		
		
		// 1: Parse markdown
		$this->perfcounter->start("parse");
		$result = $this->parsedown_ext->text(file_get_contents(ROOT_DIR."Changelog.md"));
		$this->perfcounter->end("parse");
		
		
		// 2: Send response
		header("content-length: " . strlen($result));
		header("content-type: text/html");
		header("x-time-taken: " . $this->perfcounter->render());
		echo($result);
		return true;
	}
}
