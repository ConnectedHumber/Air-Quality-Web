<?php

namespace AirQuality;

/**
 * Holds various constant value.
 */
class Constants 
{
	/**
	 * The DateTime->format() string for passing DateTimes to MariaDB.
	 * Note that if you don't use thsi format and use the ISO standard instead, it will silently complain at you, taking absolutely _ages_ over doing so.
	 * @var string
	 */
	const DATETIME_FORMAT_SQL = "Y-m-d H:i:s";
	
	/**
	 * You should never instantiate an instance of this class!
	 */
	private function __construct() {  }
}
