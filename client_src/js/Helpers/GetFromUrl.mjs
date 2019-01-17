"use strict";

// From https://gist.github.com/0b2aee73f8d168e36a353901193e7ff5

export default function GetFromUrl(url) {
	return new Promise(function(resolve, reject) {
		let request = new XMLHttpRequest();
		request.addEventListener("load", function() {
			if (request.status > 199 && request.status < 300)
				resolve(request.response);
			else
				reject(request.response);
		});
		request.open("GET", url, true);
		request.send(null);
	})
}
