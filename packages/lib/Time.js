"use strict";
exports.__esModule = true;
exports.getDate = exports.getTime = void 0;
var date_and_time_1 = require("date-and-time");
function getTime() {
    var D_CurrentDate = new Date();
    return date_and_time_1.format(D_CurrentDate, "YYYY-MM-DD HH:mm:ss");
}
exports.getTime = getTime;
function getDate(removeDays) {
    if (removeDays === void 0) { removeDays = false; }
    var D_CurrentDate = new Date();
    var S_FixedDate = date_and_time_1.format(D_CurrentDate, "YYYY-MM-DD");
    if (removeDays)
        S_FixedDate = date_and_time_1.format(D_CurrentDate, "YYYY-MM");
    return S_FixedDate;
}
exports.getDate = getDate;
