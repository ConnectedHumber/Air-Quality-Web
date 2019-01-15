<?php

use Psr\Container\ContainerInterface;
use SBRL\TomlConfig;

use AirQuality\Database;

use AirQuality\Repositories\IDeviceRepository;
use AirQuality\Repositories\MariaDBDeviceRepository;
use AirQuality\Repositories\IMeasurementDataRepository;
use AirQuality\Repositories\MariaDBMeasurementDataRepository;
use AirQuality\Repositories\IMeasurementTypeRepository;
use AirQuality\Repositories\MariaDBMeasurementTypeRepository;

return [
	"settings.file_default" => "data/settings.toml",
	"settings.file_custom" => "settings.default.toml",
	
	\SBRL\TomlConfig::class => function(ContainerInterface $c) {
		return new TomlConfig(
			$c->get("settings.file_default"),
			$c->get("settings.file_custom")
		);
	},
	
	IDeviceRepository::class => DI\autowire(MariaDBDeviceRepository::class),
	IMeasurementDataRepository::class => DI\autowire(MariaDBMeasurementDataRepository::class),
	IMeasurementTypeRepository::class => DI\autowire(MariaDBMeasurementTypeRepository::class)
];
