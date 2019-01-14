<?php

namespace AirQuality\Repositories;

interface IMeasurementTypeRepository {
	public function is_valid_type();
    public function get_all_types();
}
