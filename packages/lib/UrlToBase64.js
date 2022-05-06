"use strict";
exports.__esModule = true;
var request_1 = require("request");
function urlToBase64(url) {
    return new Promise(function (resolve, reject) {
        request_1["default"]({ url: url, encoding: null }, function (error, response, body) {
            if (!error && response.statusCode === 200)
                return resolve(Buffer.from(body, 'base64'));
            return reject("Failed to get");
        });
    });
}
exports["default"] = urlToBase64;
