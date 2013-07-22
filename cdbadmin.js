/*
 * Application handlers
 */

var fs = require("fs");

function CDBAdmin(){
        
        var _Promise, _CouchDBDocument, _transport, _db;
        
        this.setAdminCredentials = function(credentials){
                _cdbAdminCredentials = credentials;
        };
        
        this.setPromise = function(Promise){
                _Promise = Promise;        
        };
        
        this.setCouchDBDocument = function (CouchDBDocument) {
                _CouchDBDocument = CouchDBDocument;
                
        };
        
        this.setTransport = function (transport) {
                _transport = transport;      
        };
        
        this.setDB = function(db){
                _db = db;
        };
        
        /*
         * updateUserIP updates a user document in the database, changing the score and firing a callback
         * @param {String} userid : the id of the document
         * @param {String} reason : the reason why the score should be changed
         * @param {Number}increment : the increment by which the score should be changed
         * @param {Function} onEnd : the callback fired when the promise is fulfilled
         */
        
        this.updateUserIP = function(userid, reason, increment, onEnd){
                var usercdb = new _CouchDBDocument(),
                    currentIP;
                this.getDoc(userid, usercdb).then(function(){
                        switch(reason){
                                case "newtc":
                                        var tc_count = usercdb.get("twocents_count") || 0;
                                        tc_count++;
                                        usercdb.set("twocents_count", tc_count);
                                        break;
                                case "deltc":
                                        var tc_count = usercdb.get("twocents_count");
                                        tc_count--;
                                        usercdb.set("twocents_count", tc_count);
                                        break;
                                case "su_session_complete":
                                        var sus = usercdb.get("su_sessions_count") || 0;
                                        sus++;
                                        usercdb.set("su_sessions_count", sus);
                                        break;
                                case "mu_session_complete":
                                        var mus = usercdb.get("mu_sessions_count") || 0;
                                        mus++;
                                        usercdb.set("mu_sessions_count", mus);
                                        break;
                                default:
                                        break;        
                        }
                        currentIP = usercdb.get("ip");
                        
                        usercdb.set("ip", currentIP+increment);
                        this.updateDoc(userid, usercdb).then(function(){
                                onEnd("score_updated");
                        });       
                }, this);
        };
        
        /*
         * updateDoc updates a document in the database
         * @param {String} docId : the id of the document
         * @param {CouchDBDocument} cdbStore : the reason why the score should be changed
         * @returns {Promise} promise : the result of the query (fulfilled or rejected depending on the result)
         */
        this.updateDoc = function(docId, cdbStore){
                var promise = new _Promise();
                _transport.request("CouchDB", {
                        method : "PUT",
                        path:"/"+_db+"/"+docId,
                        auth: _cdbAdminCredentials,
                        agent: false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        },
                        data: cdbStore.toJSON()
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json.ok) {
                                promise.fulfill();
                        } else {
                                promise.reject();
                        }});
                
                return promise;        
        };
        
        /*
         * getDoc retrieves a document in the database
         * @param {String} docId : the id of the document
         * @param {CouchDBDocument} cdbStore : the store to contain the retrieved document
         * @returns {Promise} promise : the result of the query (fulfilled or rejected depending on the result)
         */
        this.getDoc = function(docId, cdbStore){
                var promise = new _Promise();
                _transport.request("CouchDB", {
                        method : "GET",
                        path:"/"+_db+"/"+docId,
                        auth: _cdbAdminCredentials,
                        agent: false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        }
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json._id) {
                                cdbStore.reset(json);
                                promise.fulfill();
                        } else {
                                promise.reject();
                        }});
                
                return promise;
        };
        
        /*
         * createDoc creates a document in the database
         * @param {String} docId : the id of the document
         * @param {CouchDBDocument} cdbStore : the store containing the doc to be created
         * @returns {Promise} promise : the result of the query (fulfilled or rejected depending on the result)
         */
        this.createDoc = function(docId, cdbStore){
                var promise = new _Promise();
                _transport.request("CouchDB", {
                        method : "PUT",
                        path:"/"+_db+"/"+docId,
                        auth: _cdbAdminCredentials,
                        agent: false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        },
                        data: cdbStore.toJSON()
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json.ok) {
                                promise.fulfill();
                        }
                        else {
                                promise.reject();
                        }
                        });
                
                return promise;        
        };
        
        /*
         * getView retrieves a view in the database
         * @param {String} design : the name of the design document
         * @param {String} view : the name of the view in thedesign document
         * @param {Object} query : the database query
         * @param {CouchDBView} cdbStore : the store containing the view
         * @returns {Promise} promise : the result of the query (fulfilled or rejected depending on the result)
         */
        this.getView = function(design, view, query, cdbStore){
                var promise = new _Promise();
                _transport.request("CouchDB", {
                        method : "GET",
                        path:"/"+_db+"/_design/"+design+"/_view/"+view,
                        query: query,
                        auth: _cdbAdminCredentials,
                        agent: false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        }
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json.rows) {
                                cdbStore.reset(json.rows);
                                promise.fulfill();
                        } else {
                                promise.reject();
                        }});
                
                return promise;
        };
        
        /*
         * Remove doc from database
         * @param {String} docId : the id of the document
         * @param {CouchDBDocument} cdbStore : the store containing the doc to be deleted
         * @returns {Promise} promise : the result of the query (fulfilled or rejected depending on the result)
         */
        this.removeDoc = function(docId, cdbStore){
                var promise = new _Promise();
                _transport.request("CouchDB", {
                        method : "DELETE",
                        path:"/"+_db+"/"+docId,
                        auth: _cdbAdminCredentials,
                        query: cdbStore.get("_rev"),
                        agent: false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        }
                }, function (res) {
                        console.log(docId, res);
                        var json = JSON.parse(res);
                        if (json.ok) {
                                console.log(docId + "removed");
                                promise.fulfill(json);
                        }
                        else {
                                promise.reject(json);
                        }
                });
                
                return promise;        
        }
        
}

exports.CDBAdmin = CDBAdmin;
