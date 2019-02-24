<?php

namespace SBRL;

/**
 * Serialises an object to a variety of formats.
 */
class ResponseEncoder
{
	/**
	 * Encodes an array of associative arrays to CSV.
	 * @param	array	$data	The data to encode.
	 * @return	string	The data encoded to csv.
	 */
	public static function encode_csv($data) {
		if(empty($data))
			return "";
		
		$result = fopen('php://temp/maxmemory:'. (5*1024*1024), 'r+');
		fputcsv($result, array_keys($data[0]));
		foreach($data as $row)
			fputcsv($result, array_values($row));
		rewind($result);
		
		$response = \stream_get_contents($result);
		
		fclose($result);
		
		return $response;
	}
}
