/**
 * @license get-global https://github.com/cosmosio/get-global
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

/**
 * Return the global object, whatever the runtime is.
 * As we're in use strict mode, we can't just call a function and return this. Instead, we spawn a new
 * function via eval that won't be affected by 'use strict'.
 * Strict mode is enforced so it allows this code to work when packed in another 'strict mode' module.
 */
module.exports = function getGlobal() {
    return Function('return this')();
};
