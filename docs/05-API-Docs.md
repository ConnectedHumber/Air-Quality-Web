# API
The server-side API is accessed through `api.php`, and supports a number of GET parameters. The most important of these is the `action` parameter, Which determines what the API will do. The following values are supported:

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
`start`				| datetime  | The starting datetime.
`end`				| datetime  | The ending datetime.
`average-seconds`	| int		| Optional. If specified, readings will be grouped into lumps of this many seconds and averaged. For example a value of 3600 (1 hour) will return 1 data point per hour, with the value of each point an average of all the readings for that hour.
`format`            | string    | Optional. Specifies the format that the response will be returned in. Valid values: `json`, `csv`. Default: `json`.

```
https://example.com/path/to/api.php?action=device-data&device-id=18&reading-type=PM25&start=2019-01-19T18:14:59.992Z&end=2019-01-20T18:14:59.992Z
https://example.com/path/to/api.php?action=device-data&device-id=18&reading-type=PM25&start=2019-01-19T18:14:59.992Z&end=2019-01-20T18:14:59.992Z&average-seconds=3600
https://example.com/path/to/api.php?action=device-data&device-id=18&reading-type=PM25&start=2019-01-19T18:14:59.992Z&end=now&average-seconds=3600&format=csv
```


## changelog
> Gets the changelog as a fragment of HTML.

_No parameters are currently supported by this action._

```
https://example.com/path/to/api.php?action=changelog
```
