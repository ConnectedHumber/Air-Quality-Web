<?php
$start_time = microtime(true);

define("ROOT_DIR", dirname(__FILE__) . "/");

// 1: Autoloaders

require("vendor/autoload.php");

$autoloader = new \Aura\Autoload\Loader();
$autoloader->addPrefix("AirQuality", "logic");
$autoloader->addPrefix("SBRL", "lib/SBRL");
$autoloader->register();


// 2: Dependency injection

$di_builder = new DI\ContainerBuilder();
$di_builder->addDefinitions("di_config.php");
// TODO: In production, we should use something like this - see http://php-di.org/doc/container-configuration.html
// $builder->enableCompilation(__DIR__ . '/tmp');
// $builder->writeProxiesToFile(true, __DIR__ . '/tmp/proxies');

$di_container = $di_builder->build();


// 3: Settings

$settings = $di_container->get(\SBRL\TomlConfig::class);

// 4: Database

// Done automagically by PHP-DI.
// PHP-DI autowires it, and doesn't create more than 1 instance of it either

// 5: Action

// Figure out the action name
$action = str_replace(
	" ", "",
	ucwords(str_replace(
		"-", " ",
		preg_replace("/[^a-z-]/i", "", $_GET["action"] ?? $settings->get("routing.default-action"))
	))
);

$handler_name = "AirQuality\\Actions\\$action";

// if(!class_exists($handler_name))
//         send_error(404, "Unknown action $handler_name.");

// Fetch it from the dependency injector and execute it, but only if it exists

if(!class_exists($handler_name)) {
	http_response_code(404);
	header("content-type: text/plain");
	exit("Error: No action with the name '$action' could be found.");
}

// FUTURE: A PSR-7 request/response system would be rather nice here.
$handler = $di_container->get($handler_name);
$handler->handle();
