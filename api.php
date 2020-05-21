<?php
$start_time = microtime(true);

define("ROOT_DIR", dirname(__FILE__) . "/");


// 1: Autoloaders
require("vendor/autoload.php");

$autoloader = new \Aura\Autoload\Loader();
$autoloader->addPrefix("AirQuality", "logic");
$autoloader->addPrefix("SBRL", "lib/SBRL");
$autoloader->register();

// 1.5: Performance counter
$perfcounter = new \SBRL\PerformanceCounter();
$perfcounter->start("total");

// 2: Settings
$perfcounter->start("settings");
$settings = new \SBRL\TomlConfig(
	"data/settings.toml",
	"settings.default.toml"
);
$perfcounter->end("settings");


// 3: Dependency injection

$perfcounter->start("di");

$di_builder = new DI\ContainerBuilder();
$di_builder->addDefinitions("di_config.php");
if($settings->get("env.mode") == "production") {
	// http://php-di.org/doc/container-configuration.html
	if(!file_exists(ROOT_DIR."data/cache/php_di"))
		mkdir(ROOT_DIR."data/cache/php_di", 0700, true);
	$di_builder->enableCompilation(ROOT_DIR."data/cache/php_di");
	
	if(!file_exists(ROOT_DIR."data/cache/php_di_proxies"))
		mkdir(ROOT_DIR."data/cache/php_di_proxies", 0700, true);
	$di_builder->writeProxiesToFile(true, ROOT_DIR."data/cache/php_di_proxies");
}

$di_container = $di_builder->build();

$perfcounter->end("di");

// 4: Database

// Done automagically by PHP-DI.
// PHP-DI autowires it, and doesn't create more than 1 instance of it either


// 5: Action

header("access-control-allow-origin: http://[::1]:40482");

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

if($settings->get("http.cors") !== false) {
	header("access-control-allow-origin: " . $settings->get("http.cors"));
}

$handler = $di_container->get($handler_name);

$perfcounter->start("handle");
// FUTURE: A PSR-7 request/response system would be rather nice here.
$handler->handle();
