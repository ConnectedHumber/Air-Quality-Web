<?php

namespace AirQuality;

/**
 * Automates the sending of API responses.
 */
class ApiResponseSender
{
	/**
	 * Creates a new ApiResponseSender.
	 */
	function __construct() {
		
	}
	
	/**
	 * Sends a plain-text error message.
	 * @param	int		$code			The HTTP status code to send.
	 * @param	string	$message		The plain-text message to send.
	 * @param	array	$extra_headers	Any extra headers to return, in the format [["header", "value"], ["header", "value"], .....]
	 * @return	void
	 */
	public function send_error_plain($code, $message, $extra_headers = []) {
		http_response_code($code);
		header("content-type: text/plain");
		header("content-length: " . strlen($message)); // strlen isn't multibyte-safe, so it'll give us the actual length of the string in bytes, not characters - which is precisely what we want here :D
		foreach($extra_headers as $header)
			header("{$header[0]}: {$header[1]}");
		
		echo($message);
	}
}
