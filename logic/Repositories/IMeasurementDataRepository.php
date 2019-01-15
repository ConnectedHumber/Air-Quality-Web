<?php

namespace AirQuality\Repositories;

interface IMeasurementDataRepository {
    public function get_readings_by_date(\DateTime $datetime, string $reading_type);
}
