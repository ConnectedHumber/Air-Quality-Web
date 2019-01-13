<?php

namespace AirQuality\Actions;


class Index {
	private $settings;
	private $renderer;
	
	public function __construct(
		\SBRL\TomlConfig $in_settings) {
		$this->settings = $in_settings;
		$this->renderer = $in_renderer;
	}
	
	public function handle() {
		echo($this->renderer->render_file(ROOT_DIR."templates/main.html", [
			"title" => "Home",
			"content" => file_get_contents(ROOT_DIR."templates/mockup.html"),
			"footer_html" => ""
		]));
	}
}
