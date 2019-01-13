<?php

use Psr\Container\ContainerInterface;
use SBRL\TomlConfig;

return [
	"settings.file_default" => "data/settings.toml",
	"settings.file_custom" => "settings.default.toml",
	
	\SBRL\TomlConfig::class => function(ContainerInterface $c) {
		return new TomlConfig(
			$c->get("settings.file_default"),
			$c->get("settings.file_custom")
		);
	},
	
	\SBRL\SessionManager::class => DI\factory([ \SBRL\SessionManager::class, "get_instance" ])
];
