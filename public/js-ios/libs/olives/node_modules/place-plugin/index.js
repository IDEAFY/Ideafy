/**
* @license place-plugin https://github.com/flams/place-plugin
*
* The MIT License (MIT)
*
* Copyright (c) 2014 Olivier Scherrer <pode.fr@gmail.com>
*/
"use strict";

var simpleLoop = require("simple-loop");

/**
* @class
* Place plugin places SeamViews in the DOM.
*/
function isSeamView(ui) {
    return typeof ui == "object" &&
        typeof ui.place == "function";
}

/**
 * Intilialize a Place.plugin with a list of SeamViews
 * @param {Object} $uis a list of SeamViews such as:
 *   {
 *      "header": new SeamView(),
 *      "list": new SeamView()
 *   }
 * @Constructor
 */
module.exports = function PlacePluginConstructor($uis) {

    /**
     * The list of uis currently set in this place plugin
     * @private
     */
    var _uis = {};

    /**
     * Attach a SeamView to this DOM element
     * @param {HTML|SVGElement} node the dom node where to attach the SeamView
     * @param {String} the name of the SeamView to attach
     * @throws {NoSuchSeamView} an error if there's no SeamView for the given name
     */
    this.place = function place(node, name) {
        if (_uis[name]) {
            _uis[name].place(node);
        } else {
            throw new Error(name + " is not a SeamView UI in place: " + name);
        }
    };

    /**
     * Add an SeamView that can be attached to a dom element
     * @param {String} the name of the SeamView to add to the list
     * @param {SeamView} ui the SeamView to add the list
     * @returns {Boolean} true if the SeamView was added
     */
    this.set = function set(name, ui) {
        if (typeof name == "string" && isSeamView(ui)) {
            _uis[name] = ui;
            return true;
        } else {
            return false;
        }
    };

    /**
     * Add multiple dom elements at once
     * @param {Object} $uis a list of SeamViews such as:
     *   {
     *      "header": new SeamView(),
     *      "list": new SeamView()
     *   }
     */
    this.setAll = function setAll(uis) {
        simpleLoop(uis, function (ui, name) {
            this.set(name, ui);
        }, this);
    };

    /**
     * Returns a SeamView from the list given its name
     * @param {String} the name of the SeamView to get
     * @returns {SeamView} SeamView for the given name
     */
    this.get = function get(name) {
        return _uis[name];
    };

    if ($uis) {
        this.setAll($uis);
    }

};
