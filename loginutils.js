function LoginUtils(){

var _CouchDBDocument, _CouchDBUser,
      _sendSignupEmail, _checkInvited, _createDocAsAdmin, _getDocAsAdmin, _updateDocAsAdmin,
      _cookie, _sessionStore, _transport, _db, _cdbAdminCredentials;
        
        this.setConstructors= function (CouchDBDocument, CouchDBUser) {
                _CouchDBDocument = CouchDBDocument;
                _CouchDBUser = CouchDBUser;
        };
        
        this.setFunctions = function(sendSignupEmail, checkInvited, cdbAdmin){
                _sendSignupEmail = sendSignupEmail;
                _checkInvited = checkInvited;
                _createDocAsAdmin = cdbAdmin.createDoc;
                _getDocAsAdmin = cdbAdmin.getDoc;
                _updateDocAsAdmin = cdbAdmin.updateDoc;        
        };
        
        this.setVar = function (cookie, sessionStore, transport, db, credentials) {
                _cookie = cookie;
                _sessionStore = sessionStore;
                _transport = transport;
                _db = db;
               _cdbAdminCredentials = credentials;   
        };
        
        
        /*
         * New user signup handler
         */
        
        this.signup = function (json, onEnd) {
                        var user = new _CouchDBUser();
                        
                        user.setTransport(_transport);
                        user.set("password", json.password);
                        user.set("name", json.name);
                        user.set("type", "user");
                        
                        user.create().then(function (si) {
                                
                                // add credentials to the cookie
                                var cookieJSON = _cookie.parse(json.handshake.headers.cookie), 
                                    sessionID = cookieJSON["ideafy.sid"].split("s:")[1].split(".")[0];
                                _sessionStore.get(sessionID, function(err, session) {
                                        if (err) {
                                                throw new Error(err);
                                        }
                                        else {
                                                session.auth = json.name + ":" + json.password;
                                                _sessionStore.set(sessionID, session);
                                                onEnd({
                                                        signup : "ok",
                                                        db : _db,
                                                        message: json.name + " successfully signed up"
                                                });
                                                
                                                // send confirmation Email
                                                _sendSignupEmail(json.name, json.password, json.lang);
                                                
                                                // create reward doc
                                                 // create reward document
                                                var rewards = new _CouchDBDocument({
                                                        "profilecomplete": 0,
                                                        "playthegame": 0,
                                                        "tutorialcomplete": 0,
                                                        "ideas5": 0,
                                                        "ideas25": 0,
                                                        "ideas100": 0,
                                                        "ideas250": 0,
                                                        "bronzeacorn": 0,
                                                        "silveracorn": 0,
                                                        "goldenacorn": 0,
                                                        "platinumflame": 0,
                                                        "platinumwildfire": 0,
                                                        "easybrainstormer": 0,
                                                        "mindstormer": 0,
                                                        "mastermindstormer": 0,
                                                        "guide": 0,
                                                        "leader": 0,
                                                        "mindweaver": 0,
                                                        "opinionator": 0,
                                                        "feedbackartist": 0,
                                                        "chatterbox": 0,
                                                        "allday": 0,
                                                        "curious": 0,
                                                        "puzzled": 0,
                                                        "whyarewehere": 0,
                                                        "scored":[],
                                                        "type": 11
                                                });
                                                _createDocAsAdmin(json.name+"_rewards", rewards);
                                                
                                                // check for referrals and update accordingly
                                                _checkInvited(json.name, function(result){
                                                        if (result){
                                                                result.sender.forEach(function(id){
                                                                        var cdbDoc = new _CouchDBDocument();
                                                                        _getDocAsAdmin(id, cdbDoc)
                                                                        .then(function(){
                                                                                var ip = cdbDoc.get("ip"),
                                                                                    notif = cdbDoc.get("notifications") || [],
                                                                                    now = new Date();
                                                                                cdbDoc.set("ip", ip+200);
                                                                                notif.unshift({
                                                                                        type : "REF",
                                                                                        status : "unread",
                                                                                        date : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()],
                                                                                        author: json.name,
                                                                                        username : json.fn + " " + json.ln,
                                                                                        firstname : json.fn
                                                                                });
                                                                                cdbDoc.set("notifications", notif);
                                                                                return _updateDocAsAdmin(id, cdbDoc);
                                                                        });       
                                                                });
                                                                // remove document from ideafy_invites
                                                                _transport.request("CouchDB", {
                                                                        method : "DELETE",
                                                                        path:"/ideafy_invites/"+json.name,
                                                                        auth: _cdbAdminCredentials,
                                                                        agent:false,
                                                                        headers: {
                                                                                "Content-Type": "application/json",
                                                                                "Connection": "close"
                                                                        }
                                                                }, function (res) {
                                                                        console.log(res);
                                                                });
                                                        }        
                                                });
                                        }
                                });
                        }, function (json) {
                                if (json.error === "conflict") {
                                        onEnd({
                                                status: "failed",
                                                message: "An account with this user name already exists."
                                        });
                                }
                                else{
                                        onEnd({status: "failed", reason: json, message:"failed to create new user"});
                                }
                         });
                };
        
        /*
         * Check if user can authenticate with current cookie
         */
        this.checkLogin = function(json, onEnd){
                var cookieJSON = _cookie.parse(json.handshake.headers.cookie),
                    sessionID = cookieJSON["ideafy.sid"].split("s:")[1].split(".")[0],
                    cdb = new _CouchDBDocument();
                
                // return false if document does not exist in database
                _getDocAsAdmin(json.id, cdb).then(function(){
                        _sessionStore.get(sessionID, function(err, session){
                                if(err){throw new Error(err);}
                                else{
                                        if (session.auth && session.auth.search(json.id) >-1) {
                                                cdb.set("sock", json.sock);
                                                cdb.set("online", true);
                                                _updateDocAsAdmin(json.id, cdb)
                                                .then(function(){
                                                        onEnd({authenticated: true});        
                                                });
                                        }
                                        else onEnd({authenticated : false});
                                } 
                        });
                }, function(){onEnd({authenticated: false});});
        };
        
        /*
         * User login handler
         */
        
        this.login = function(json, onEnd) {
                var user = new _CouchDBUser();
                
                user.setTransport(_transport);
                user.set("password", json.password);
                user.set("name", json.name);
                
                user.login(json.name, json.password).then(function(result) {
                        
                        var result = JSON.parse(result);
                        
                        if (!result.error) {
                                var cookieJSON = _cookie.parse(json.handshake.headers.cookie), 
                                    sessionID = cookieJSON["ideafy.sid"].split("s:")[1].split(".")[0],
                                    cdb = new _CouchDBDocument();
                                
                                _sessionStore.get(sessionID, function(err, session) {
                                        if (err) {
                                                throw new Error(err);
                                        } else {
                                                session.auth = json.name + ":" + json.password;
                                                _sessionStore.set(sessionID, session);
                                                _getDocAsAdmin(json.name, cdb)
                                                .then(function(){
                                                        cdb.set("online", true);
                                                        cdb.set("sock", json.sock);
                                                        return _updateDocAsAdmin(json.name, cdb);
                                                })
                                                .then(function(){
                                                        onEnd({
                                                                login : "ok",
                                                                db : _db,
                                                                message: json.name + " is logged-in",
                                                                session: session
                                                        });
                                                });
                                        }
                                });

                        } else {
                                onEnd({
                                        login : "failed",
                                        reason : "name or password invalid"
                                });
                        }
                }, function(result) {
                        console.log(result);
                });
        };
        
        /*
        * User password change handler
        */
        
        this.changePassword = function(json, onEnd){
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
       
};

exports.LoginUtils = LoginUtils;
