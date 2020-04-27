# ConnectedHumber-Air-Quality-Interface

> The web interface and JSON API for the ConnectedHumber Air Quality Monitoring Project.

This project contains the web interface for the ConnectedHumber sensor system. Despite being called _Air Quality Web_, it is designed to display any kind of sensor data - not just air quality sensor readings.

It is composed of 2 parts:

 - A PHP-based JSON API server (entry point: api.php) that's backed by a MariaDB server
 - A Javascript client application that runs in the browser

The client-side browser application is powered by [Leaflet](https://leafletjs.com/).

Note that this project is _not_ responsible for entering data into the database. This project's purpose is simply to display the data.


## Documentation
Documentation has moved! You can view it here:

 - https://sensors.connectedhumber.org/__nightdocs/00-Welcome.html


## Branches
 - `master`
     - The default branch
     - Should always be stable
 - `dev`
     - The development branch
     - May not always be stable.


## Notes
 - Readings are taken every 6 minutes as standard.


## Contributing
Contributions are welcome - feel free to [open an issue](https://github.com/ConnectedHumber/Air-Quality-Web/issues/new) or (even better) a [pull request](https://github.com/ConnectedHumber/Air-Quality-Web/compare).

The [issue tracker](https://github.com/ConnectedHumber/Air-Quality-Web/issues) is the place where all the tasks relating to the project are kept.

**Please remember: All pull requests should be made against the `dev` branch, not master! The `master` branch is the stable version that automatically gets pushed to production.**


## Disclaimer
This website displays sensor reading from devices created by individuals with an interest in monitoring their environment and is not endorsed or funded in any way by UK government supported bodies such as DEFRA. It is , however, hoped that this work may be useful in educational applications.

The sensors, on the map, are installed in different ways, in different enclosures, at different heights and with different exposures to sunlight and wind . This means that, although individual sensors may use the same detectors, those detectors could produce varying results due to the above and also due to component tolerance spread. 

No attempt has been made, by us, to calibrate the sensor readings in any way though the visual representation will include some aggregation of readings.

If you wish to create a device to display data on this map please register with mattermost.connectedhumber.org and we will provide you with direction and designs to build your own sensor device.


## Credits
 - Map: [Leaflet.js](https://leafletjs.com/) showing [OpenStreetMaps](https://www.openstreetmap.org/) using various plugins
 - Colour manipulation by [chroma.js](https://github.com/gka/chroma.js)
 - Device graphs by [chart.js](https://www.chartjs.org)
 - [Loading Animation](https://github.com/SamHerbert/SVG-Loaders)
 - Some icons from [Open Iconic](https://useiconic.com/open)

## License
This project is licensed under the _Mozilla Public License 2.0_. The full text of this license can be found in the [LICENSE](https://github.com/ConnectedHumber/Air-Quality-Web/blob/master/LICENSE) file of this repository, along with a helpful summary of what you can and can't do provided by GitHub.
