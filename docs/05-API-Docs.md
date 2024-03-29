# API
The server-side API is accessed through `api.php`, and supports a number of GET parameters. On the main production instance, this can be found [here](https://sensors.connectedhumber.org/api.php).

The most important of these is the `action` parameter, Which determines what the API will do. The following values are supported:

Action									| Meaning
----------------------------------------|----------------------------
[`version`](#version)					| Gets the version of _Air Quality Web_ that's currently running.
[`fetch-data`](#fetch-data)				| Fetches air quality data from the system for a specific data type at a specific date and time.
[`list-devices`](#list-devices)			| Fetches a list of devices currently in the system.
[`list-devices-near`](#list-devices-near)   | Lists the devices close to a given location (new since v0.11!)
[`device-info`](#device-info)			| Gets (lots of) information about a single device.
[`list-reading-types`](#list-reading-types)	| Lists the different types of readings that can be specified.
[`device-data-bounds`](#device-data-bounds)	| Gets the start and end DateTime bounds for the data recorded for a specific device.
[`device-data`](#device-data)			| Gets data by device given a start and end time.
[`changelog`](#changelog)				| Gets the changelog as a fragment of HTML.

These are explained in detail below. First though, a few notes:

 - All dates are in UTC.
 - All datetime-type fields support the keyword `now`.
 - Additional object properties MAY be returned by the API at a later date. Clients MUST ignore additional unknown properties they do not understand.
 - Clients SHOULD respect the `cache-control` headers returned by the API.


## version
> Returns the version of the application.

_No parameters are currently supported by this action._

Examples:


```
https://example.com/path/to/api.php?action=version
```


## fetch-data
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

## list-devices
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

## list-devices-near
> Lists devices close to a given location.


**Remember:** Don't forget that unlike most other API actions, this requires a `POST` request and not a `GET`! This is to preserve privacy, as the web server stores GET parameters along with request urls in the server logs.

### GET Parameters

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`count` 			| int		| Required. Specifies the number of devices to return.

### POST Parameters
POST parameters should be specified as part of the request body. The request should have a `content-type` of `application/x-www-form-urlencoded`.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`latitude`			| float		| Required. The latitude of the location to search for nearby devices.
`longitude`			| float		| Required. The longitude of the location to search for nearby devices.

### Example HTTP Request

```
POST /api.php?action=list-devices-near&count=5 HTTP/1.1
host: airquality.example.com
content-length: 38
content-type: application/x-www-form-urlencoded

latitude=12.345678&longitude=98.765432
```

### Response Object Properties
Since it may not be obvious, the properties returned in a response object are detailed below:

Property			| Meaning
--------------------|----------------------------------
`id`				| The device's unique id.
`name`				| The device's name. Should be unique, but don't count on it.
`latitude`			| The latitude of the device in question.
`longitude`			| The longitude of the aforementioned device.
`distance_calc`		| The distance between the specified point and the device, represented as the length of a relative (lat, long) vector between the 2. _Should_ be accurate enough to get the devices in the right order with respect to the actual distance, but if not please [open an issue](https://github.com/ConnectedHumber/Air-Quality-Web/issues/new)
`distance_actual`	| The actual distance between the specified point and the device, in metres.

## device-info
> Gets (lots of) information about a single device.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`device-id`         | int		| Required. The id of the device to get extended information for. See the `list-device` action for how to get a hold of one.

Examples:

## list-reading-types
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


## device-data-bounds
> Gets the start and end DateTime bounds for the data recorded for a specific device.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`device-id`         | int		| Required. The id of the device to get the data DateTime bounds for.

```
https://example.com/path/to/api.php?action=device-data-bounds&device-id=18
https://example.com/path/to/api.php?action=device-data-bounds&device-id=11
```

## device-data
> Gets data by device given a start and end time.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`device-id`			| int		| The id of the device to get data for.
`reading-type`		| string	| The type of reading to obtain data for.
`start`				| datetime  | The starting datetime, or the special keyword "now".
`end`				| datetime  | The ending datetime, or the special keyword "now".
`average-seconds`	| int		| Optional. If specified, readings will be grouped into lumps of this many seconds and averaged. For example a value of 3600 (1 hour) will return 1 data point per hour, with the value of each point an average of all the readings for that hour.
`format`            | string    | Optional. Specifies the format that the response will be returned in. Valid values: `json`, `csv`. Default: `json`.

```
https://example.com/path/to/api.php?action=device-data&device-id=18&reading-type=PM25&start=2019-01-19T18:14:59.992Z&end=2019-01-20T18:14:59.992Z
https://example.com/path/to/api.php?action=device-data&device-id=18&reading-type=PM25&start=2019-01-19T18:14:59.992Z&end=2019-01-20T18:14:59.992Z&average-seconds=3600
https://example.com/path/to/api.php?action=device-data&device-id=18&reading-type=PM25&start=2019-01-19T18:14:59.992Z&end=now&average-seconds=3600&format=csv
https://example.com/path/to/api.php?action=device-data&device-id=18&reading-type=PM25&start=2019-06-13T00:00:00&end=now&format=csv
```

## device-data-recent
> Gets a given number of the most recent readings for a specific device.

Parameter			| Type		| Meaning
--------------------|-----------|---------------------
`device-id`			| int		| The id of the device to get data for.
`reading-type`		| string	| The type of reading to obtain data for.
`count`				| int		| The number of recent readings to return.
`format`            | string    | Optional. Specifies the format that the response will be returned in. Valid values: `json`, `csv`. Default: `json`.

```
https://example.com/path/to/api.php?action=device-data-recent&device-id=21&reading-type=PM25&count=5
https://example.com/path/to/api.php?action=device-data-recent&device-id=36&reading-type=humidity&count=30
```

## changelog
> Gets the changelog as a fragment of HTML.

_No parameters are currently supported by this action._

```
https://example.com/path/to/api.php?action=changelog
```
