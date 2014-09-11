/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

var Store = require("emily").Store,
    Promise = require("emily").Promise,
    Observable = require("emily").Observable;

/**
 * Double duck typing
 * @private
 */
function _isTransport(transport) {
    if (typeof transport == "object" &&
        typeof transport.request == "function" &&
        typeof transport.listen == "function") {
        return true;
    } else {
        return false;
    }
}

var _changeObserver = new Observable();

function CouchDBChangesConstructor(){
 
     var _observer = _changeObserver,
    /**
     * The default handler name
     * @private
     */
    _changeHandlerName = "CouchDBChange",

    /**
     * The transport to use to issue the request
     * @private
     */
    _transport = null;
    
    /**
     * Get the current transport
     * @returns {Transport} the current transport
     */
    this.getTransport = function getTransport() {
        return _transport;
    };
    
    /**
     * Set the current transport
     * @param {Transport} transport the transport to use
     * @returns {Boolean} true if its an accepted transport
     */
    this.setTransport = function setTransport(transport) {
        if (_isTransport(transport)) {
            _transport = transport;
            return true;
        } else {
            return false;
        }
    };
    
    /**
     * Get the current CouchDBChange handler name
     * @returns {String} the current changeHandler name
     */
     this.getChangeHandlerName = function getChangeHandlerName() {
        return _changeHandlerName;
     };
     
     /**
      * Get the observer
      */
     this.getObserver = function getObserver(){
             return _observer;
     };
    
    /**
     * Subscribe to change events
     */
    this.watch = function watch(callback){
            _observer.watch('changes', function(data){
                callback(data);
            });
    };
    
    this.initStream = function initStream(db) {

        this.getStream = this.getTransport().listen(
            this.getChangeHandlerName(),
            {
                path: "/" + db,
                query: {
                    feed: "continuous",
                    heartbeat: 20000,
                    since: "now"
                }
            },
            function (changes) {
                var json;
                if (changes == "\n") {
                    return false;
                }
                json = JSON.parse(changes);
                _observer.notify('changes', json);
            }, this);
    };
    
    this.endStream = function(){
        if (this.getStream) this.getStream();
        delete this.getStream;    
    };
};

module.exports = new CouchDBChangesConstructor();
