/**
 * IDEAFY
 * Copyright(c) 2012 Taïaut
 *
 */

// Required middleware
var connect = require("connect"), 
    http = require("http"), 
    socketIO = require("socket.io"), 
    emily = require("emily"), 
    olives = require("olives"), 
    CouchDBTools = require("couchdb-emily-tools"), 
    cookie = require("cookie"), 
    RedisStore = require("connect-redis")(connect), 
    nodemailer = require("nodemailer"), 
    fs = require("fs"), 
    qs = require("querystring"), 
    url = require("url"), 
    redirect = require('connect-redirection'), 
    sessionStore = new RedisStore({
        hostname : "127.0.0.1",
        port : "6379"
    });

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
        // mail sent by Ideafy,
        host : "mail.taiaut.net",
        // host: "localhost",
        secureConnection : true,
        port : 465,
        auth : {
                user : "ideafy-taiaut",
                pass : fs.readFileSync(".password", "utf8").trim()
        }
});

CouchDBTools.requirejs(["CouchDBUser", "Transport", "CouchDBStore", "Store"], function(CouchDBUser, Transport, CouchDBStore, Store) {
        var transport = new Transport(olives.handlers),
            app = http.createServer(connect()
                .use(connect.responseTime())
                .use(redirect())
                .use(connect.bodyParser({ uploadDir:__dirname+'/public/upload', keepExtensions: true }))
                .use('/upload', function(req, res){
                
                        var avatarFile = req.files,
                            uid = Object.keys(avatarFile)[0],
                            avatarFileName=uid+"@@"+avatarFile[uid].name,
                            newFile = __dirname+'/public/attachments/'+avatarFileName;
                
                        console.log(uid, avatarFile, avatarFileName);
                    
                        fs.rename(avatarFile[uid].path, newFile, function(err){
                                var updateAvatar = function(){
                                        var cdb = new CouchDBStore();
                                        cdb.setTransport(new Transport(olives.handlers));
                                        cdb.sync("taiaut", uid).then(function(){
                                                cdb.set("picture_file", avatarFileName);
                                                cdb.upload(); 
                                        });  
                                };
                        
                                if(err) { throw err;}
                                // update avatar in couchdb
                                updateAvatar();
                                fs.unlink(avatarFile[uid].path);
                        }); 
                })      
                .use(function(req, res, next) {
                        var parse = url.parse(req.url, false),
                            path = parse.pathname;
                  
                        if (req.method === 'GET' && path.search("/attachments")>-1){
                                // get file extension
                                var     ext,
                                        gifPattern = /[\w\-_\+\(\)]{0,}[\.gif|\.GIF]{4}/,
                                        jpgPattern = /[\w\-_\+\(\)]{0,}[\.jpg|\.JPG]{4}/,
                                        pngPattern = /[\w\-_\+\(\)]{0,}[\.png|\.PNG]{4}/;

                                if (parse.pathname.match(pngPattern)) { ext = "png";}
                                else if (parse.pathname.match(jpgPattern)) { ext = "jpg";}
                                if (parse.pathname.match(gifPattern)) { ext = "gif";}                
                                fs.readFile("public"+path, function (error, data){
                                        if (data){
                                                res.charset = 'utf-8';
                                                //the type should be contained in the repsonse
                                                var encode = "data:image/"+ext+";base64," + new Buffer(data, 'binary').toString('base64');
                                                console.log(encode);
                                                res.write(encode, encoding='utf8');  
                                        }
                                        else {
                                                console.log(error);
                                        }
                                
                                        res.end();
                                        next();
                                });
                        }
                        else{
                                res.setHeader("Ideady Server", "node.js/" + process.versions.node);
                                res.setHeader("X-Powered-By", "OlivesJS + Connect + Socket.io");
                                next();
                        }
                })
                .use(connect.cookieParser())
                .use(connect.session({
                        secret : "dingdangdong",
                        key : "proto-ideafy.sid",
                        store : sessionStore,
                        cookie : {
                                maxAge : null,
                                httpOnly : true,
                                path : "/"
                        }
                }))
                .use(connect.static(__dirname + "/public"))).listen(1664),
        io = socketIO.listen(app, {
                log : true
        });

        http.globalAgent.maxSockets = Infinity;

        olives.registerSocketIO(io);

        olives.config.update("CouchDB", "sessionStore", sessionStore);

        
        olives.handlers.set("Signup", function (json, onEnd) {
                        var user = new CouchDBUser;
                        
                        user.setTransport(transport);
                        user.set("password", json.password);
                        user.set("name", json.name);

                        user.create().then(function (si) {
                                onEnd({
                                        status: "okay",
                                        message: "The account was successfully created."
                                })
                                user.unsync();
                        }, function (json) {
                                if (json.error == "conflict") {
                                        onEnd({
                                                status: "failed",
                                                message: "An account with this user name already exists."
                                        });
                                }
                                user.unsync();
                        });
                });

        olives.handlers.set("CheckLogin", function(json, onEnd){
                var cookieJSON = cookie.parse(json.handshake.headers.cookie), sessionID = cookieJSON["proto-ideafy.sid"].split("s:")[1].split(".")[0];
                
                sessionStore.get(sessionID, function(err, session){
                        if(err){
                                throw new Error(err);
                        }
                        else{
                                (session.auth && session.auth.search(json.id) >-1) ? onEnd({authenticated: true}) : onEnd({authenticated : false})
                        } 
                });   
        });
        
        olives.handlers.set("Login", function(json, onEnd) {
                var user = new CouchDBUser();
                
                user.setTransport(transport);
                user.set("password", json.password);
                user.set("name", json.name);
                
                user.login(json.name, json.password).then(function(result) {
                        
                        var result = JSON.parse(result);
                        
                        if (!result.error) {
                                console.log("HERE", cookie.parse(json.handshake.headers.cookie));
                                var cookieJSON = cookie.parse(json.handshake.headers.cookie), sessionID = cookieJSON["proto-ideafy.sid"].split("s:")[1].split(".")[0];
                                console.log("COOKIEJSON: ", cookieJSON, "SESSIONID: ",sessionID);
                                sessionStore.get(sessionID, function(err, session) {
                                        if (err) {
                                                throw new Error(err);
                                        } else {
                                                session.auth = json.name + ":" + json.password;
                                                sessionStore.set(sessionID, session);
                                                onEnd({
                                                        login : "ok",
                                                        message: json.name + " is logged-in"
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
                        console.log(result)
                });
        });

        // Sending email messages from Ideafy
        olives.handlers.set("SendMail", function(json, onEnd) {

                var type = json.type;
                var sentOK;
                var mailOptions = {
                        from : "IDEAFY <ideafy@taiaut.net>", // sender address
                        to : "", // list of receivers
                        subject : "", // Subject line
                        html : "" // html body
                };

                if (type == "invite") {
                        // set mail parameters
                        mailOptions.to = json.recipient;
                        mailOptions.subject = json.sender + " invites you to join the Ideafy community";
                        mailOptions.html = "<p style='background: whitesmoke; font-family=helvetica; font-size=24px; text-align=justify;'><b>Take advantage of this invitation! Get Ideafy now and join the fast growing online community of Ideafans. Compete for best idea, best mind and many other exciting challenges. Give your imagination and your ideas a new life. <a href='http://ideafy.taiaut.net'>Join now!</a></b></p>"

                        smtpTransport.sendMail(mailOptions, function(error, response) {
                                if (error) {
                                        onEnd({
                                                sendmail : "error",
                                                reason : error,
                                                response : response
                                        });
                                } else {
                                        onEnd({
                                                sendmail : "ok",
                                                recipient : json.recipient
                                        });
                                }
                        });
                }

        });

        /*
         * Handle notification events:
         *     includes:
         *             - checkUserList to verify recipients and return an array of userids
         *             - notify to notify one or several users
         *
         */
        olives.handlers.set("CheckEmailList", function(json, onEnd) {

                var result = {}, cdb = new CouchDBStore(), list = json.list;

                /**
                 * Building a temporary solution before changes in couchDBStore (one bulk query of the view)
                 */

                // if there is only one recipient
                if (list.length === 1) {
                        cdb.setTransport(new Transport(olives.handlers));
                        cdb.sync("taiaut", "users", "_view/tomail", {
                                key : '"' + list[0] + '"'
                        }).then(function(doc) {
                                if (doc.getNbItems()) {
                                        result.check = "Ok";
                                        result.output = [{
                                                "username" : doc.get(0).value.username,
                                                "userid" : doc.get(0).value.userid
                                        }];
                                        onEnd(result);
                                } else {
                                        result.check = "error";
                                        result.missing = [list[0]];
                                        onEnd(result);
                                }
                        });
                } else {
                        var options = {}, bulkDocs = new Store(), req;

                        // manually build the http request to couchDB
                        options.hostname = "127.0.0.1";
                        options.port = 5984;
                        options.method = "POST";
                        options.auth = {
                                user : "admin",
                                pass : fs.readFileSync(".password", "utf8").trim()
                        };
                        options.path = "/taiaut/_design/users/_view/tomail";
                        options.headers = {
                                "Content-Type" : "application/json"
                        };
                        options.data = JSON.stringify({
                                keys : json.list
                        });

                        /**
                         * Http request callback, handles couchDB response
                         * @param {Object} res the response
                         */
                        var callback = function(res) {
                                var body = "";
                                res.on('data', function(chunk) {
                                        body += chunk;
                                });

                                res.on('end', function() {
                                        bulkDocs.reset(JSON.parse(body).rows);
                                        result = scanResults(body, bulkDocs);
                                        console.log(result);
                                        onEnd(result);
                                });
                        };

                        /**
                         * A function scanning the output of couchDB, checking for missing users and formatting results
                         * @param {String} body the data sent back by couchdb
                         * @param {Store} store the store containing the view documents
                         */
                        var scanResults = function(body, store) {
                                var res = {
                                        "check" : "",
                                        "output" : [],
                                        "missing" : []
                                };
                                for ( i = 0, l = list.length; i < l; i++) {
                                        // if document not found, place  entry in the list of users not found
                                        console.log(list[i], body.search(list[i]));
                                        if (body.search(list[i]) < 0) {
                                                res.missing.push(list[i]);
                                        } else {
                                                // need to check for multiple matches (homonyms)
                                                store.loop(function(v) {
                                                        if (v.value.username.toLowerCase() === list[i] || v.value.userid === list[i]) {
                                                                res.output.push({
                                                                        "username" : v.value.username,
                                                                        "userid" : v.value.userid
                                                                });
                                                        }
                                                });
                                        }
                                }
                                (res.missing.length) ? res.check = "error" : res.check = "Ok";
                                return res;
                        };
                        // emit the http request and the data
                        req = http.request(options, callback);
                        req.end(options.data, "utf8");
                }
        });

        olives.handlers.set("Notify", function(json, onEnd) {

                var dest = json.dest, sendResults = new Store([]),
                
                // build message
                message = {
                        "type" : json.type,
                        "status" : "unread",
                        "date" : json.date,
                        "author" : json.author,
                        "picture_file" : json.picture_file,
                        "object" : json.object,
                        "body" : json.body
                },

                /**
                 * A function to push message to couchDB
                 * @param {Object} message the message to deliver
                 * @param {String} userid the userid in couchDB to deliver the message to
                 */
                sendMessage = function(message, userid) {
                        var cdb = new CouchDBStore();
                        cdb.setTransport(new Transport(olives.handlers));
                        cdb.sync("taiaut", userid).then(function() {
                                var arr = [];
                                // retrieve notifications array
                                if (cdb.get("notifications")[0]){arr = cdb.get("notifications");}
                                // add message
                                arr.unshift(message);
                                // update store and upload
                                cdb.set("notifications", arr);
                                cdb.upload().then(function() {
                                        sendResults.alter("push", {
                                                res : "ok",
                                                id : userid
                                        });
                                });
                        });
                };
                 
                 
                // add specificities depending on message type
                if (json.type === "CXR") {
                        message.contactInfo = json.contactInfo;
                }
                if (json.type === "DOC") {
                        message.docId = json.docId;
                        message.docType = json.docType;
                }

                // check if dest is a string (single recipient) or an array
                if ( typeof dest === "string") {
                        sendMessage(message, dest);
                } else if ( dest instanceof Array) {
                        for ( i = 0, l = dest.length; i < l; i++) {
                                sendMessage(message, dest[i]);
                        }
                }
                // return sendResults if all messages have been delivered
                sendResults.watch("added", function() {
                        if ( typeof dest === "string") {
                                if (sendResults.getNbItems()) {
                                        onEnd(sendResults.toJSON());
                                }
                        } else if ( dest instanceof Array) {
                                if (sendResults.getNbItems() === dest.length) {
                                        onEnd(sendResults.toJSON());
                                }
                        }
                });
        });

        // Voting on ideas
        olives.handlers.set("Vote", function(json, onEnd) {

                var cdb = new CouchDBStore(),
                    votes;
                cdb.setTransport(new Transport(olives.handlers));

                cdb.sync("taiaut", json.id).then(function() {
                        votes = cdb.get("votes");
                        if (!votes){votes=[];}
                        votes.unshift(json.vote);
                        cdb.set("votes", votes);
                        cdb.upload().then(function() {
                                onEnd("ok")
                        });
                });

        });

        // Commenting on ideas
        olives.handlers.set("Twocent", function(json, onEnd) {

                var cdb = new CouchDBStore();
                cdb.setTransport(new Transport(olives.handlers));

        });

        // Connection events
        olives.handlers.set("CxEvent", function(json, onEnd) {

                var cdb = new CouchDBStore(),
                    connections = [],
                    groups = [],
                    notifications = [];
                    now = new Date();
                    message = {
                        "type" : "INFO",
                        "status" : "unread",
                        "date" : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]
                };

                cdb.setTransport(new Transport(olives.handlers));

                cdb.sync("taiaut", json.dest).then(function() {
                        if (cdb.get("connections") && cdb.get("connections")[0]) {connections = cdb.get("connections");}
                        if (cdb.get("groups") && cdb.get("groups")[0]) {groups = cdb.get("groups");}
                        if (cdb.get("notifications") && cdb.get("notifications")[0]) {notifications = cdb.get("notifications");}
                        
                        // Cancelling an existing connection
                        if (json.type === "cancel") {

                                // remove json.origin from list of connections
                                for ( i = connections.length-1; i>=0; i--) {
                                        if (connections[i].userid === json.author) {
                                                connections.splice(i, 1);
                                        }
                                }
                                // also remove json.author from groups
                                // check if contact was part of a group -- if yes delete contact in group as well
                                if (groups[0]) {
                                        for (i=groups.length-1; i>=0; i--){
                                                var gc = groups[i].contacts;
                                                for (j=gc.length-1; j>=0; j--){
                                                        if (gc[j].userid === userid) {
                                                                // if userid is found delete this contact entry
                                                                gc.splice(j, 1);
                                                                // if group is empty remove the entire group
                                                                if (!gc.length){
                                                                        groups.splice(i,1);   
                                                                }
                                                        }
                                                }  
                                        }
                                }

                                // notify destination of cancellation
                                message.author = json.author;
                                message.object = json.username + " has cancelled your connection";
                                message.body = "You are no longer connected with " + json.username;
                                cdb.set("notifications", notifications.unshift(message));
                        }

                        // Accepting a new connection
                        if (json.type === "INFO" && json.resp === "yes") {
                                // add new contact info to the list of connections
                                connections.push(json.contactInfo);
                        }
                        
                        cdb.set("connections", connections);
                        cdb.set("groups", groups);
                        cdb.upload().then(function(){
                                onEnd("ok");
                        });
                });

        });

});

process.on('uncaughtException', function(error) {
        console.log(error.stack);
});

