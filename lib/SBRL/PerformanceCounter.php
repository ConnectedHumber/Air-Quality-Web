<?php

namespace SBRL;

use Exception;

/**
 * Records performance information.
 */
class PerformanceCounter
{
	/**
	 * An associative array of performance information.
	 * It should take the form key => [float] | float.
	 * HACK: If the float is the only item in an array, then it hasn't been ended yet.
	 * @var array
	 */
	private $data = [];
	
	/**
	 * An array of performance counters to hide when rendering.
	 * Useful to keep some counters around for later, but keep them hidden so as to not clutter everything up.
	 * @var string[]
	 */
	private $hidden = [];
	
	/**
	 * Creates a new performance counter instea
	 */
	function __construct() {
		// code...
	}
	
	/**
	 * Starts recording the time taken for a given key.
	 * Calling end($key) is optional
	 * @param  string $key The key to start recording the time taken for.
	 */
	public function start(string $key) {
		$this->data[$key] = [microtime(true)];
	}
	
	/**
	 * Ends recording the time taken for a given key.
	 * @param	string	$key	The key to end counting for.
	 * @return	float	The time taken, in milliseconds
	 */
	public function end(string $key) {
		if(empty($this->data[$key]))
			throw new Exception("Error: We can't end counting for $key because we haven't started yet");
		
		$this->data[$key] = (microtime(true) - $this->data[$key][0]) * 1000;
		return $this->data[$key];
	}
	
	/**
	 * Renders the performance information as a short string.
	 * Suitable for sending in a HTTP header, for example.
	 * @return	string	The rendered performance information.
	 */
	public function render() {
		$result = "";
		$parts = [];
		foreach($this->data as $key => $value) {
			if(in_array($key, $this->hidden))
				continue;
			
			if(is_array($value))
				$value = $this->end($key);
			
			$render = round($value, 2) . "ms $key";
			if($key == "total") {
				$result .= "$render | ";
				continue;
			}
			$parts[] = $render;
		}
		
		$result .= implode(", ", $parts);
		
		return $result;
	}
}
