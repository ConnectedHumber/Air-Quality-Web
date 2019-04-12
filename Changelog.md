# Changelog

## v0.6 - 13th April
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
