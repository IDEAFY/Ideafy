/**
* @license get-nodes https://github.com/cosmios/get-nodes
*
* The MIT License (MIT)
*
* Copyright (c) 2014 Olivier Scherrer <pode.fr@gmail.com>
*/
"use strict";

var toArray = require("to-array");

module.exports = function getNodes(dom) {
    var domElements = dom.querySelectorAll("*"),
        arrayDomElements = toArray(domElements);

    arrayDomElements.unshift(dom);

    return arrayDomElements;
};
