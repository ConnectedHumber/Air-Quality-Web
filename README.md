# ConnectedHumber-Air-Quality-Interface

> The web interface and JSON api for the ConnectedHumber Air Quality Monitoring Project.

This project contains the web interface for the ConnectedHumber air Quality Monitoring system. It is composed of 2 parts:

 - A PHP-based JSON API server (entry point: api.php) that's backed by a MariaDB server
 - A Javascript client application that runs in the browser

The client-side browser application is powered by [Leaflet](https://leafletjs.com/).

Note that this project is _not_ responsible for entering data into the database. This project's purpose is simply to display the data.

## System Requirements
In order to run this program, you'll need the following:

 - Git
 - Bash (if on Windows, try [Git Bash](https://gitforwindows.org/)) - the build script is written in Bash
 - [composer](https://getcomposer.org/) - For the server-side packages
 - [Node.JS](https://nodejs.org/)
 - [npm](https://npmjs.org/) - comes with Node.JS - used for building the client-side code
 - A [MariaDB](https://mariadb.com/) server with a database already setup with the schema data in it. Please get in contact with [ConnectedHumber](https://connectedhumber.org/) for information about the database schema and structure.

## Getting Started
The client-side code requires building. Currently, no pre-built versions are available (though these can be provided upon request), so this must be done from source. A build script is available, however, which automates the process - as explained below.

### System Requirements
 - PHP-enabled web server
     - _Nginx_ + _PHP-FPM_ is recommended
     - Apache works too
 - MariaDB database with the appropriate table structure pre-loaded
 - PHP 7+
 - Node.JS (preferably 10+) + npm 6+ (for installing & building the client-side app code)
 - [Composer](https://getcomposer.org/) (for installing server-side dependencies)
 - PHP modules:
     - `pdo-mysql` (for the database connection)

### Installation
1. Start by cloning this repository:

```bash
git clone https://github.com/ConnectedHumber/Air-Quality-Web.git
```


2. Change the ownership to allow your web server user to access the created directory. Usually, the web server will be running under the `www-data` user:

```bash
sudo chown -R www-data:www-data path/to/Air-Quality-Web
```


3. `cd` into the root of the cloned repository. Then install the dependencies (these are installed locally):

```bash
./build setup setup-dev
```


4. Build the client-side application:

```bash
# For development, run this:
./build client
# For production, run this:
NODE_ENV=production ./build client
# If you're actively working on the codebase and need to auto-recompile on every change, run this:
./build client-watch
```


5. Edit `data/settings.toml` to enter your database credentials.

You can edit other settings here too. See `settings.default.toml` for the settings you can change, but do **not** edit `settings.default.toml`! Edit `data/settings.toml` instead. You'll probably want to give the entire default settings file a careful read.


6. Configure your web server to serve the root of the repository you've cloned if you haven't already. Skip this step if you cloned the repository into a directory that your web server already serves.


7. Disallow public access to the private `data`  directory.

In Nginx:

```nginx
# put this inside the "server {  }" block:
location ^~ /path/to/data/directory {
    deny all;
}
```

In Apache:

```htaccess
# Create a file with this content inside the data/ directory
Require all denied
```


8. Test the application with an API call. If this returns valid JSON, then you've set it up correctly

```
http://example.com/path/to/Air-Quality-Web/api.php?action=list-devices
```


9. (Optional) Setup HTTPS:

```bash
sudo apt install certbot
# On Nginx:
sudo certbot --nginx --domain example.com
# On Apache:
sudo certbot --apache --domain example.com
```


## API
The server-side API is accessed through `api.php`, and supports a number of GET parameters. The most important of these is the `action` parameter, Which determines what the API will do. The following values are supported:

### version
> Returns the version of the application.

_No parameters are currently supported by this action._

Examples:


```
https://example.com/path/to/api.php?action=version
```


### fetch-data
> Fetches air quality data from the system for a specific data type at a specific date and time.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`datetime`			| date/time	| Required. Specifies the date and time for which readings are desired. For current data use the special keyword `now`.
`reading_type`		| string	| Required. Specifies the type of reading desired.
`format`            | string    | Optional. Specifies the format that the response will be returned in. Valid values: `json`, `csv`. Default: `json`.

Examples:

```
https://example.com/path/to/api.php?action=fetch-data&datetime=2019-01-03%2007:52:10&reading_type=PM10
https://example.com/path/to/api.php?action=fetch-data&datetime=now&reading_type=PM10
```

### list-devices
> Fetches a list of devices currently in the system.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`only-with-location`| bool		| Optional. If present only devices with a defined location will be returned. Useful for getting a list of devices to place on a map.
`format`            | string    | Optional. Specifies the format that the response will be returned in. Valid values: `json`, `csv`. Default: `json`.

Examples:

```
https://example.com/path/to/api.php?action=list-devices
https://example.com/path/to/api.php?action=list-devices&only-with-location=yes
```

### device-info
> Gets (lots of) information about a single device.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`device-id`         | int		| Required. The id of the device to get extended information for. See the `list-device` action for how to get a hold of one.

Examples:

### list-reading-types
> Lists the different types of readings that can be specified.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`device-id`         | int		| Optional. If specified, this filters the list of measurement types to list only those reported by the device with the specified id.
`format`            | string    | Optional. Specifies the format that the response will be returned in. Valid values: `json`, `csv`. Default: `json`.

```
https://example.com/path/to/api.php?action=list-reading-types
https://example.com/path/to/api.php?action=list-reading-types&device-id=22
https://example.com/path/to/api.php?action=list-reading-types&device-id=54
```


### device-data-bounds
> Gets the start and end DateTime bounds for the data recorded for a specific device.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`device-id`         | int		| Required. The id of the device to get the data DateTime bounds for.

```
https://example.com/path/to/api.php?action=device-data-bounds&device-id=18
https://example.com/path/to/api.php?action=device-data-bounds&device-id=11
```

### device-data
> Gets data by device given a start and end time.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`device-id`			| int		| The id of the device to get data for.
`reading-type`		| string	| The type of reading to obtain data for.
`start`				| datetime  | The starting datetime.
`end`				| datetime  | The ending datetime.
`average-seconds`	| int		| Optional. If specified, readings will be grouped into lumps of this many seconds and averaged. For example a value of 3600 (1 hour) will return 1 data point per hour, with the value of each point an average of all the readings for that hour.
`format`            | string    | Optional. Specifies the format that the response will be returned in. Valid values: `json`, `csv`. Default: `json`.

```
https://example.com/path/to/api.php?action=device-data&device-id=18&reading-type=PM25&start=2019-01-19T18:14:59.992Z&end=2019-01-20T18:14:59.992Z
https://example.com/path/to/api.php?action=device-data&device-id=18&reading-type=PM25&start=2019-01-19T18:14:59.992Z&end=2019-01-20T18:14:59.992Z&average-seconds=3600
https://example.com/path/to/api.php?action=device-data&device-id=18&reading-type=PM25&start=2019-01-19T18:14:59.992Z&end=now&average-seconds=3600&format=csv
```


### changelog
> Gets the changelog as a fragment of HTML.

_No parameters are currently supported by this action._

```
https://example.com/path/to/api.php?action=changelog
```


## Notes
 - Readings are taken every 6 minutes as standard.


## Contributing
Contributions are welcome - feel free to [open an issue](https://github.com/ConnectedHumber/Air-Quality-Web/issues/new) or (even better) a [pull request](https://github.com/ConnectedHumber/Air-Quality-Web/compare).

The [issue tracker](https://github.com/ConnectedHumber/Air-Quality-Web/issues) is the place where all the tasks relating to the project are kept.

## License
This project is licensed under the _Mozilla Public License 2.0_. The full text of this license can be found in the [LICENSE](https://github.com/ConnectedHumber/Air-Quality-Web/blob/master/LICENSE) file of this repository, along with a helpful summary of what you can and can't do provided by GitHub.
