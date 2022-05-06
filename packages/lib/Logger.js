"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
var colors_1 = require("colors");
var Time_1 = require("./Time");
var Logger = {
    trace: function () {
        var _a;
        var err = new Error();
        var lines = (_a = err.stack) === null || _a === void 0 ? void 0 : _a.split("\n");
        //@ts-ignore
        return lines[2].substring(lines[2].indexOf("("), lines[2].lastIndexOf(")") + 1);
    },
    debug: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | " + colors_1.cyan("debug: ")], body));
    },
    api: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | " + colors_1.green("API: ")], body));
    },
    graphql: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | " + colors_1.magenta("GraphQL: ")], body));
    },
    plugin: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | " + colors_1.green("Plugin: ")], body));
    },
    cache: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | " + colors_1.magenta("cach") + colors_1.yellow("e: ")], body));
    },
    rainbow: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | " + colors_1.rainbow("rainbow: ")], body));
    },
    verbose: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | " + colors_1.magenta("verbose: ")], body));
    },
    error: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | ", colors_1.red("error: ")], body));
    },
    warning: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | ", colors_1.yellow("warning: ")], body));
    },
    info: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | ", colors_1.blue("info: ")], body));
    },
    db: function () {
        var body = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            body[_i] = arguments[_i];
        }
        var time = Time_1.getTime();
        console.log.apply(console, __spreadArray([time + " | ", colors_1.cyan("data") + colors_1.green("base: ")], body));
    }
};
exports.default = Logger;
