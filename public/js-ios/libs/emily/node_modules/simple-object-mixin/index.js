/**
* @license simple-mixin https://github.com/flams/simple-object-mixin
*
* The MIT License (MIT)
*
* Copyright (c) 2014 Olivier Scherrer <pode.fr@gmail.com>
*/
"use strict";

var loop = require("simple-loop");

/**
 * Mixes an object into another
 * @param {Object} source object to get values from
 * @param {Object} destination object to mix values into
 * @param {Boolean} optional, set to true to prevent overriding
 * @returns {Object} the destination object
 */
module.exports = function mixin(source, destination, dontOverride) {
    loop(source, function (value, idx) {
        if (!destination[idx] || !dontOverride) {
            destination[idx] = source[idx];
        }
    });
    return destination;
};
