<?php

namespace AirQuality;

/**
 * Automates the sending of API responses.
 */
class ApiResponseSender
{
	
	function __construct() {
		
	}
	
	public function send_error_plain($code, $message, $extra_headers = []) {
		http_response_code($code);
		header("content-type: text/plain");
		header("content-length: " . strlen($message)); // strlen isn't multibyte-safe, so it'll give us the actual length of the string in bytes, not characters - which is precisely what we want here :D
		foreach($extra_headers as $header)
			header("{$header[0]}: {$header[1]}");
		
		echo($message);
	}
}
