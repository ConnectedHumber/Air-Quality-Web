"use strict";

function Postify(obj) {
    return Object.keys(obj).map(function (key) {
        return [key, encodeURIComponent(obj[key])].join("=");
    }).join("&");
}

export default Postify;
