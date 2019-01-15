<?php

namespace AirQuality;

/**
 * Formats performance data to be sent in a HTTP header.
 */
class PerfFormatter {
	function __construct() {
		
	}
	
	public static function format_perf_data($start_init, $start_handle, $start_encode) {
		$now = microtime(true);
		
		$time_total = round(($now - $start_init) * 1000, 2);
		$time_setup = round(($start_handle - $start_init) * 1000, 2);
		$time_handle = round((($start_encode ?? $now) - $start_handle) * 1000, 2);
		$time_encode = round(($now - $start_encode) * 1000, 2);
		
		$result = "{$time_total}ms total | {$time_setup}ms setup, {$time_handle}ms handle";
		if(!empty($start_encode))
			$result .= ", {$time_encode}ms encode";
		
		return $result;
	}
}
