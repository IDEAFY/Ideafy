/*
 * User password change handler
 */

function ChangePassword() {
        var _CouchDBDocument, _cookie, _transport;
        
        this.setCouchDBDocument = function (CouchDBDocument) {
                _CouchDBDocument = CouchDBDocument;
        };
        
        this.setCookie = function (cookie) {
                _cookie = cookie;     
        };
        
        this.setTransport = function (transport) {
                _transport = transport;      
        };

        this.setAdminCredentials = function (credentials) {
                _cdbAdminCredentials = credentials;      
        };
        
        this.setSessionStore = function (sessionStore) {
                _sessionStore = sessionStore;        
        };
        
        this.handler = function(json, onEnd){
                var cdb = new _CouchDBDocument(),
                        userPath = "/_users/org.couchdb.user:"+json.userid,
                        cookieJSON = _cookie.parse(json.handshake.headers.cookie),
                        sessionID = cookieJSON["ideafy.sid"].split("s:")[1].split(".")[0] ;
        
                _transport.request("CouchDB", {
                        method : "GET",
                        path: userPath,
                        auth: _cdbAdminCredentials,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        }
                }, function (res) {
                        cdb.reset(JSON.parse(res));
                        cdb.set("password", json.pwd);
                        _transport.request("CouchDB", {
                                method : "PUT",
                                path:userPath,
                                auth: _cdbAdminCredentials,
                                headers: {
                                        "Content-Type": "application/json",
                                        "Connection": "close"
                                },
                                data: cdb.toJSON()
                        }, function (res) {
                                if (JSON.parse(res).ok) {
                                        _sessionStore.get(sessionID, function(err, session) {
                                        if (err) {
                                                throw new Error(err);
                                        } else {
                                                session.auth = json.userid + ":" + json.pwd;
                                                _sessionStore.set(sessionID, session);
                                                onEnd("ok");
                                        }
                                });
                                }
                        });
                });        
        };
}

exports.ChangePassword = ChangePassword;
