<?php

namespace AirQuality\Repositories;

interface IMeasurementTypeRepository {
	/**
	 * Returns whether the specified type is valid or not.
	 * @param	string	$type_name	The name of the type to validate.
	 * @return	boolean	Whether the specified type name is valid or not.
	 */
	public function is_valid_type(string $type_name);
	
	/**
	 * Gets the friendly name for the specified type name.
	 * @param	string	$type_name	The type name to get the friendly name for.
	 * @return	string	The friendly name for the specified type name.
	 */
	public function get_friendly_name(string $type_name);
	
	/**
	 * Returns all the currently known meeasurement types.
	 * @return	array	All the measurement types currently known.
	 */
    public function get_all_types();
}
