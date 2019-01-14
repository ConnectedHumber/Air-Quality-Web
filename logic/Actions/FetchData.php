<?php

namespace AirQuality\Actions;


class FetchData {
	private $settings;
	private $renderer;
	
	public function __construct(
		\SBRL\TomlConfig $in_settings) {
		$this->settings = $in_settings;
	}
	
	public function handle() {
		echo("Testing");
	}
}
