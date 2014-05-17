/*
 * Application handlers
 */

var fs = require("fs"),
    http = require("http");

function CDBAdmin(){
        
        var _Promise, _CouchDBDocument, _transport, _db, _dbIP, _dbPort,
            updateUserIP, updateDoc, getDoc, createDoc, getView, removeDoc;
        
        this.setVar = function(db, dbIP, dbPort, credentials, transport){
                _db = db;
                _dbIP = dbIP;
                _dbPort = dbPort;
                _cdbAdminCredentials = credentials;
                _transport = transport;
        };
        
        this.setConstructors = function(Promise, CouchDBDocument){
                _Promise = Promise; 
                _CouchDBDocument = CouchDBDocument;      
        };
        
        /*
         * updateUserIP updates a user document in the database, changing the score and firing a callback
         * @param {String} userid : the id of the document
         * @param {String} reason : the reason why the score should be changed
         * @param {Number}increment : the increment by which the score should be changed
         * @param {Function} onEnd : the callback fired when the promise is fulfilled
         */
        
        updateUserIP = function(userid, reason, increment, onEnd){
                var usercdb = new _CouchDBDocument(),
                    currentIP;
                getDoc(userid, usercdb).then(function(){
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
                        updateDoc(userid, usercdb).then(function(){
                                onEnd("score_updated");
                        });       
                });
        };
        
        /*
         * updateDoc updates a document in the database
         * @param {String} docId : the id of the document
         * @param {CouchDBDocument} cdbStore : the reason why the score should be changed
         * @returns {Promise} promise : the result of the query (fulfilled or rejected depending on the result)
         */
        updateDoc = function(docId, cdbStore){
                var promise = new _Promise();
                _transport.request("CouchDB", {
                        method : "PUT",
                        path:"/"+_db+"/"+docId,
                        auth: _cdbAdminCredentials,
                        // agent: false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        },
                        data: cdbStore.toJSON()
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json.ok) {
                                cdbStore.set("_rev", json.rev);
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
        getDoc = function(docId, cdbStore){
                var promise = new _Promise();
                _transport.request("CouchDB", {
                        method : "GET",
                        path:"/"+_db+"/"+docId,
                        auth: _cdbAdminCredentials,
                        // agent: false,
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
        createDoc = function(docId, cdbStore){
                var promise = new _Promise();
                _transport.request("CouchDB", {
                        method : "PUT",
                        path:"/"+_db+"/"+docId,
                        auth: _cdbAdminCredentials,
                        // agent: false,
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
        getView = function(design, view, query, cdbStore){
                var promise = new _Promise(),
                      options = {
                                method : "GET",
                                path:"/"+_db+"/_design/"+design+"/_view/"+view,
                                auth: _cdbAdminCredentials,
                                // agent: false,
                                headers: {
                                        "Content-Type": "application/json",
                                        "Connection": "close"
                                }
                        };
                if (query) options.query = query;
                _transport.request("CouchDB", options, function (res) {
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
         * getBulkView retrieves a set of docs from a view in the database
         * @param {String} design : the name of the design document
         * @param {String} view : the name of the view in thedesign document
         * @param {Object} query : the database query
         * @param {CouchDBView} cdbStore : the store containing the view
         * @returns {Promise} promise : the result of the query (fulfilled or rejected depending on the result)
         */
        getBulkView = function(design, view, idList, cdbStore){
                var promise = new _Promise(),
                    result = {}, options = {}, req, callback;

                // manually build the http request to couchDB
                options.hostname = _dbIP;
                options.port = _dbPort;
                options.method = "POST";
                options.auth = _cdbAdminCredentials;
                // options.agent = false;
                options.path = "/"+_db+"/_design/"+design+"/_view/"+view;
                options.headers = {
                        "Content-Type" : "application/json"
                };
                options.data = JSON.stringify({
                        keys : idList
                });

                /**
                * Http request callback, handles couchDB response
                * @param {Object} res the response
                */
                callback = function(res) {
                        var body = "";
                        res.on('data', function(chunk) {
                                body += chunk;
                        });

                        res.on('end', function() {
                                var json = JSON.parse(body);
                                if (json.rows.length === idList.length){
                                        cdbStore.reset(json.rows);
                                        promise.fulfill();
                                }
                                else {
                                        promise.reject();
                                }
                        });
                };
                // emit the http request and the data
                req = http.request(options, callback);
                req.end(options.data, "utf8");
                
                return promise;
        };
        
        /*
         * Remove doc from database
         * @param {String} docId : the id of the document
         * @param {CouchDBDocument} cdbStore : the store containing the doc to be deleted
         * @returns {Promise} promise : the result of the query (fulfilled or rejected depending on the result)
         */
        removeDoc = function(docId, cdbStore){
                var promise = new _Promise();
                _transport.request("CouchDB", {
                        method : "DELETE",
                        path:"/"+_db+"/"+docId,
                        auth: _cdbAdminCredentials,
                        query: {rev: cdbStore.get("_rev")},
                        // agent: false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        }
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json.ok) {
                                promise.fulfill(json);
                        }
                        else {
                                promise.reject(json);
                        }
                });
                
                return promise;        
        };
        
        
        this.updateUserIP = updateUserIP;
        this.getDoc = getDoc;
        this.getView = getView;
        this.getBulkView = getBulkView;
        this.updateDoc = updateDoc;
        this.removeDoc = removeDoc;
        this.createDoc = createDoc;
        
}

exports.CDBAdmin = CDBAdmin;
