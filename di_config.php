<?php

use Psr\Container\ContainerInterface;
use SBRL\TomlConfig;

// use AirQuality\Database;

use AirQuality\Repositories\IDeviceRepository;
use AirQuality\Repositories\MariaDBDeviceRepository;
use AirQuality\Repositories\IMeasurementDataRepository;
use AirQuality\Repositories\MariaDBMeasurementDataRepository;
use AirQuality\Repositories\IMeasurementTypeRepository;
use AirQuality\Repositories\MariaDBMeasurementTypeRepository;
use AirQuality\Repositories\ISensorRepository;
use AirQuality\Repositories\MariaDBSensorRepository;

use SBRL\PerformanceCounter;

return [
	"settings.file_default" => "data/settings.toml",
	"settings.file_custom" => "settings.default.toml",
	
	// These are created during initalisation, but we want them available via dependency injection too
	TomlConfig::class => function(ContainerInterface $c) {
		global $settings;
		return $settings;
	},
	PerformanceCounter::class => function(ContainerInterface $c) {
		global $perfcounter;
		return $perfcounter;
	},
	
	// Interfaces that need mapping to their implementations
	IDeviceRepository::class => DI\autowire(MariaDBDeviceRepository::class),
	IMeasurementDataRepository::class => DI\autowire(MariaDBMeasurementDataRepository::class),
	IMeasurementTypeRepository::class => DI\autowire(MariaDBMeasurementTypeRepository::class),
	ISensorRepository::class => DI\autowire(MariaDBSensorRepository::class)
];
