<?php

namespace AirQuality\Repositories;

interface IMeasurementTypeRepository {
	/**
	 * Returns whether the specified type is valid or not.
	 * @param	string	$id		The id of the type to validate.
	 * @return	bool	Whether the specified type name is valid or not.
	 */
	public function is_valid_type(int $id) : bool;
	
	/**
	 * Get the id associated with the given short description.
	 * @param	string	$short_descr	The short description to convert.
	 * @return	int		The id associated with the specified short description.
	 */
	public function get_id(string $short_descr) : int;
	
	/**
	 * Gets the friendly name for the specified type name.
	 * @param	int		$id		The measurement type id to get the friendly name for.
	 * @return	string	The friendly name for the specified type name.
	 */
	public function get_friendly_name(int $id) : string;
	
	/**
	 * Returns all the currently known meeasurement types.
	 * @return	array	All the measurement types currently known.
	 */
    public function get_all_types();
	
	/**
	 * Gets the all the measurement types ever reported by a given device id.
	 * @return	string[]	A list of device ids.
	 */
	public function get_types_by_device(int $device_id);
}
