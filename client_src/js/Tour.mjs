"use strict";

import Sheperd from 'shepherd.js';
import '../../node_modules/shepherd.js/dist/css/shepherd-theme-default.css';

class Tour {
	constructor(in_map_manager) {
		this.map_manager = in_map_manager;
	}

	create_tour() {
		this.tour = new Sheperd.Tour({
			useModalOverlay: true,
			defaultStepOptions: {
				// Default settings for steps go here
			}
		});

		this.tour.addStep("welcome", {
			text: "Welcome to the air quality web interface! Press next to get a short tour.",
			buttons: this.get_buttons(false, true)
		});

		this.tour.addStep("map", {
			text: "Each device has a blue marker. The shape a marker is located in changes colour depending on the value of the measure it reported.",
			attachTo: {
				element: "#map",
				on: "bottom"
			},
			buttons: this.get_buttons()
		});
		this.tour.addStep("guage", {
			text: "This guage is a key to the colour of the shapes underneath the device markers.",
			attachTo: {
				element: document.querySelector("#canvas-guage"),
				on: "left"
			},
			buttons: this.get_buttons()
		});

		this.tour.addStep("reading-type", {
			text: "Devices report multiple types of measurement."
			+ " Change to another reading type now.".bold(),
			attachTo: {
				element: document.querySelector("select").parentNode,
				on: "top"
			},
			advanceOn: { selector: "select", event: "change" },
			buttons: this.get_buttons(true)
		});
		this.tour.addStep("reading-type-complete", {
			text: "Hey, the map changed! Some devices only report certain types of measurement, and different measurements have different colour scales.",
			attachTo: { element: "#map", on: "bottom" },
			buttons: this.get_buttons()
		});
		this.tour.addStep("layer-showhide", {
			text: "You can show and hide the device markers and the heatmap here.",
			attachTo: {
				element: ".leaflet-control-layers",
				on: "left"
			},
			buttons: this.get_buttons()
		});

		this.tour.addStep("map-controls", {
			text: "You can control the zoom level and go fullscreen here. You can also zoom with your mouse wheel if you have one, and pan by clicking and dragging.",
			attachTo: {
				element: ".leaflet-top.leaflet-left",
				on: "right"
			},
			buttons: this.get_buttons()
		});

		this.tour.addStep("device-graph", {
			text: "By clicking a blue marker, you can view additional information about that device. Not all device are actively reporting data."
			 + " Try clicking one now.".bold(),
			attachTo: {
				element: "#map",
				on: "top"
			},
			buttons: this.get_buttons(true)

		}).on("show", (() => {
			this.map_manager.device_markers.once("marker-popup-opened", this.tour.next.bind(this.tour));
		}).bind(this));

		this.tour.addStep("device-graph-a", {
			text: "This is a device information popup. By default it displays recent data that the device has reported on the line graph, but you can control this with the blue buttons.",
			attachTo: {
				element: ".popup-device",
				on: "right"
			},
			buttons: this.get_buttons()
		});
		this.tour.addStep("device-graph-b", {
			text: "By clicking here, you can see the specification of the device, including its software, sensor models, exact location, more."
			+ " Click this now.".bold(),
			attachTo: {
				element: ".tabs :first-child",
				on: "left"
			},
			advanceOn: { selector: ".tabs :first-child a", event: "click" },
			buttons: this.get_buttons(true)
		});


		this.tour.addStep("report-bug", {
			text: "If you find a bug, you can report it by clicking this button.",
			attachTo: {
				element: "button[value='Report bug']",
				on: "right"
			},
			buttons: this.get_buttons()
		});
		this.tour.addStep("changelog", {
			text: "The changelog will be automatically shown every time this web interface updates. Click the version information here to review it again at other times.",
			attachTo: {
				element: "button[value~='built']",
				on: "right"
			},
			buttons: this.get_buttons()
		});


		this.tour.addStep("complete", {
			text: "Tour complete!\nIf you need any additional assistance, let us know :-)",
			buttons: [
				{ text: "Previous", action: this.tour.back },
				{ text: "Done", action: this.tour.cancel } //Changed from next to cancel for ease
			]
		});
	}

	run_once() {
		if(window.localStorage.getItem("completed_tour") === null)
			this.run();

		//window.localStorage.setItem("completed_tour", (new Date()).toISOString()); -- removed due to an accidental refresh possiblity
	}

	run() {
		if(typeof this.tour == "undefined")
			this.create_tour();
		this.tour.start();
	}

	get_buttons(no_continue = false, no_prev = false) {
		let next = { text: "Next", action: this.tour.next },
			prev = { text: "Previous", action: this.tour.back },
			exit = { text: "Exit", action: () =>
			{
				window.localStorage.setItem("completed_tour", (new Date()).toISOString());
				this.tour.cancel()
			} };

		let result = [];
		if(!no_prev) result.push(prev);
		if(!no_continue) {
			result.push(next);
			result.push(exit);
		}

		return result;
	}
}

export default Tour;
