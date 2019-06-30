# Changelog
This is the changelog for the air quality web interface and its associated HTTP API.

 - `[API]` refers to changes to the [HTTP API](https://aq.connectedhumber.org/__nightdocs/05-API-Docs.html).
 - `[Code]` refers to internal changes to the code that have no direct impact on the web interface or the HTTP API, but are significant enough to warrant note.
 - `[Docs]` refers to changes to the [documentation](https://aq.connectedhumber.org/__nightdocs/00-Welcome.html).

## v0.12-dev
 - [API] Improve accuracy of `distance_calc` for the `list-devices-near` action by using _Haversine's Formula_.
 - [API] Added new `last_seen` property to the `list-devices` and `device-info` actions.

## v0.11.1 - 22nd June 2019
 - Drastically improve the performance of the backend SQL queries that power the heatmap and device graphs by over 35x in some cases!
     - For users of the HTTP API, said queries are `fetch-data` and `device-data`.

## v0.11 - 21st June 2019
 - [API] Add new [`list-devices-near`](https://aq.connectedhumber.org/__nightdocs/05-API-Docs.html#list-devices-near) action.
 - [API] Clarified that clients MUST ignore properties returned by the API that they do not understand.
 - [API] Clarified that clients SHOULD respect the `cache-control` HTTP header returned by many API actions
 - [Docs] Improved documentation about where to get the initial database schema from.

## v0.10.4 - 20th June 2019
 - [Code] Update dependencies behind web interface
 - [API] Optimise `fetch-data` (the action behind the voronoi diagram heatmap) a bit - it's roughly 100ms faster now
     - More speed will be coming soon with the addition of database indexes
 - [API] Add performance counter system, which returns query timing information via the `x-time-taken` HTTP header in the response to most queries

## v0.10.3 - 13th June 2019
 - [API] Added new [`device-data-recent`](https://aq.connectedhumber.org/__nightdocs/05-API-Docs.html#device-data-recent) action.
 - [Code] Improve documentation of underlying code.

## v0.10.2 - 13th June 2019
 - [API Docs] Add links to action sections
 - [API] Bugfix: Fix default index action so it actually displays the api welcome message

## v0.10.1 - 10th June 2019
 - Remove heatmap blob radius UI setting
 - Add welcome tour, which shows the first time the page is loaded

## v0.10 - 10th June 2019
 - Change heatmap into a voronoi diagram ([#30](https://github.com/ConnectedHumber/Air-Quality-Web/issues/30))

## v0.9.2 - 3rd June 2019
 - [API] Updated the [API documentation](https://aq.connectedhumber.org/__nightdocs/05-API-Docs.html) with a quick reference of the available actions at the top.

## v0.9.1 - 16th May 2019
 - [API] Changed the default action. It now displays a helpful message by default instead of routing directly to `fetch-data`.

## v0.9 - 9th May 2019
 - Add heatmap gauge at the right-hand-side
 - Display the changelog the first time a user loads the page after an update

## v0.8 - 23rd April 2019
 - Update heatmap colours to match the [official DEFRA standards](https://uk-air.defra.gov.uk/air-pollution/daqi?view=more-info&pollutant=pm25#pollutant)
 - Bugfix: Allow different reading types to be selected once more in the bottom-left
 - Bugfix: Immediately update heatmap when changing the blob radius

## v0.7.1 - 16th April 2019
 - [API] `list-reading-types` no longer returns an error if a device hasn't submitted any readings yet
 - [API] Remove device locations from `fetch-data` action to boost performance

## v0.7 - 14th April 2019
 - Added experimental heatmap time slider!

## v0.6 - 13th April 2019
 - [Build] Continuous Deployment is now active! More time for development, less time manually updating the server.
     - The way the server is configured has completely changed, so please [report any issues](https://github.com/ConnectedHumber/Air-Quality-Web/issues/new) you encounter

## v0.5.6 - 6th April 2019
 - Add new [Raspberry Pi Installation Instructions](https://aq.connectedhumber.org/__nightdocs/50-Raspberry-Pi-Installation-Instructions.html) from @BNNorman

## v0.5.5 - 5th April 2019
 - [Build] Use local version of composer
 - [Build] Check for `pdo_mysql` PHP module

## v0.5.4 - 14th March 2019
 - [API] Added device altitude information to `list-devices` and `device-info` actions
 - [API] Added device type id property to `list-devices` action

## v0.5.3 - 7th March 2019
 - Tweak x axis labels
 - Build script: Improve first-time setup experience

## v0.5.2 - 1st March 2019
 - [API] Added `version` action

## v0.5.1 - 26th February 2019
 - Fixed issue with non-linear sensor reading reports ([#15](https://github.com/ConnectedHumber/Air-Quality-Web/issues/15))

## v0.5 - 24th February 2019
 - Add advanced date/time picker interface to the device graph.

## v0.4 - 24th February 2019
 - [API] Added new `format` GET parameter to the following actions:
     - `device-data`
     - `list-devices`
     - `list-reading-types`
     - `fetch-data`

## v0.3.3 - 20th February 2019
 - Updated to use new database structure

## v0.3.2 - 10th February 2019
 - Bugfix: Default to something sensible when opening the device graph in certain cases
 - Add new quick time buttons below device graph to change displayed time window

## v0.3.1 - 7th February 2019
 - Hidden measurement types in the device graph if a device hasn't reported any readings of that type

### API Backend
 - Added `device-id` parameter to the `list-reading-types` action.

## v0.3.0 - 1st February 2019
 - Installed a library to fix bugs in the device marker tabbing system
 - Add _rudimentary_ mobile device support. Note that this is not a priority until the design of the interface for desktop has been worked out.
 - Add "report bug" button

## v0.2.0 - 26th January 2019
The first entry!

 - Add this changelog to let people know what's new :D
