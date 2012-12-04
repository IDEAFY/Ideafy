/**
 * IDEAFY
 * Copyright(c) 2012 Taïaut
 *
 */

// Required middleware
var http = require("http"), 
    socketIO = require("socket.io"),
    connect = require("connect"), 
    olives = require("olives"),
    CouchDBTools = require("couchdb-emily-tools"),
    cookie = require("cookie"), 
    RedisStore = require("connect-redis")(connect), 
    nodemailer = require("nodemailer"), 
    fs = require("fs"),
    path = require("path"), 
    qs = require("querystring"), 
    url = require("url"), 
    redirect = require('connect-redirection'), 
    sessionStore = new RedisStore({
        hostname : "127.0.0.1",
        port : "6379"
    }),
    wrap = require("./wrap");


// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
        // mail sent by Ideafy,
        host: "localhost",
        secureConnection : true,
        port : 465,
        auth : {
                user : "ideafy-taiaut",
                pass : fs.readFileSync(".password", "utf8").trim()
        }
});


CouchDBTools.requirejs(["CouchDBUser", "Transport", "CouchDBStore", "Store", "Promise"], function(CouchDBUser, Transport, CouchDBStore, Store, Promise) {
        var transport = new Transport(olives.handlers),
            _db = "ideafy",
            cdbAdminCredentials = "admin:innovation4U",
            app = http.createServer(connect()
                .use(connect.responseTime())
                .use(redirect())
                .use(connect.bodyParser({ uploadDir:__dirname+'/public/upload', keepExtensions: true }))
                .use('/upload', function(req, res){
                        var type = req.body.type,
                            _path = __dirname+'/attachments/',
                            filename,
                            now,
                            dataurl,
                            sid;
                        
                        if (type === 'postit'){
                                sid = req.body.sid;
                                now = new Date();
                                filename = _path+sid+'/'+req.body.filename;
                                dataurl = req.body.dataString;
                                
                                fs.exists(_path+sid, function(exists){
                                        if (!exists) {
                                                fs.mkdir(_path+sid, 0777, function(err){
                                                        if (err) {throw(err);}
                                                        fs.writeFile(filename, dataurl, function(err){
                                                                if (err) {throw(err);}
                                                                res.write("ok");
                                                                res.end();
                                                        });
                                                });
                                        }
                                        else {
                                                fs.exists(filename, function(exists){
                                                        if (exists) fs.unlinkSync(filename);
                                                        fs.writeFile(filename, dataurl, function(err){
                                                                if (err) {throw(err);}
                                                                res.write("ok");
                                                                res.end();
                                                        });   
                                                });
                                                
                                        }       
                                });
                        }
                        
                        
                        
                        /* var avatarFile = req.files,
                            uid = Object.keys(avatarFile)[0],
                            avatarFileName=uid+"@@"+avatarFile[uid].name,
                            newFile = __dirname+'/public/attachments/'+avatarFileName;
                    
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
                        });  */
                })      
                .use(function(req, res, next) {
                        var parse = url.parse(req.url, false),
                            _path = parse.pathname,
                            readFile = wrap(fs.readFile);
                  
                        if (req.method === 'GET' && _path.search("/attachments")>-1){    
                                // get file extension
                                var     ext,
                                        gifPattern = /[\w\-_\+\(\)]{0,}[\.gif|\.GIF]{4}/,
                                        jpgPattern = /[\w\-_\+\(\)]{0,}[\.jpg|\.JPG]{4}/,
                                        pngPattern = /[\w\-_\+\(\)]{0,}[\.png|\.PNG]{4}/;

                                if (_path.match(pngPattern)) { ext = "png";}
                                if (_path.match(jpgPattern)) { ext = "jpg";}
                                if (_path.match(gifPattern)) { ext = "gif";}              
                                readFile("public"+_path, function (error, data){
                                        if (data){
                                                res.charset = 'utf-8';
                                                //the type should be contained in the repsonse
                                                var encode = "data:image/"+ext+";base64," + new Buffer(data, 'binary').toString('base64');
                                                res.write(encode, encoding='utf8');  
                                        }
                                        else {
                                                console.log(error);
                                        }
                                        res.end();
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
                        secret : "olives&vin2012AD",
                        key : "ideafy.sid",
                        store : sessionStore,
                        cookie : {
                                maxAge : 86400000,
                                httpOnly : true,
                                path : "/"
                        }
                }))
                .use(connect.static(__dirname + "/public"))).listen(1664),
                io = socketIO.listen(app, {
                        log : true
                });
                
       // Socket.io configuration
       io.enable('browser client minification');  // send minified client
       io.enable('browser client etag');          // apply etag caching logic based on version number
       io.enable('browser client gzip');          // gzip the file
       io.set('log level', 3);                    // reduce logging
       io.set('transports', [                     // enable all transports (optional if you want flashsocket)
                        'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
        io.set("close timeout", 15);
        io.set("heartbeat interval", 10);
        // we need lots of sockets
        http.globalAgent.maxSockets = Infinity;

        // register transport
        olives.registerSocketIO(io);
        
        // couchdb config update (session authentication)
        olives.config.update("CouchDB", "sessionStore", sessionStore);
        
        // Application utility functions
        var updateUserIP = function(userid, reason, increment, onEnd){
                var usercdb = new CouchDBStore(),
                    currentIP;
                getDocAsAdmin(userid, usercdb).then(function(){
                        switch(reason){
                                case "newtc":
                                        var tc_count = usercdb.get("twocent_count") || 0;
                                        tc_count++;
                                        usercdb.set("twocent_count", tc_count);
                                        break;
                                case "deltc":
                                        var tc_count = usercdb.get("twocent_count");
                                        tc_count--;
                                        usercdb.set("twocent_count", tc_count);
                                        break;
                                default:
                                        break;        
                        }
                        currentIP = usercdb.get("ip");
                        usercdb.set("ip", currentIP+increment);
                        updateDocAsAdmin(userid, usercdb).then(function(){
                                onEnd("score_updated");
                        });       
                });        
        },
            updateDocAsAdmin = function(docId, cdbStore){
                var promise = new Promise();
                transport.request("CouchDB", {
                        method : "PUT",
                        path:"/"+_db+"/"+docId,
                        auth: cdbAdminCredentials,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        },
                        data: cdbStore.toJSON()
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json.ok) {
                                promise.resolve();
                        } else {
                                promise.reject();
                        }});
                
                return promise;      
        },
            getDocAsAdmin = function(docId, cdbStore){
                var promise = new Promise();
                transport.request("CouchDB", {
                        method : "GET",
                        path:"/"+_db+"/"+docId,
                        auth: cdbAdminCredentials,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        }
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json._id) {
                                cdbStore.reset(json);
                                promise.resolve();
                        } else {
                                promise.reject();
                        }});
                
                return promise;      
        };
        
        // Application handlers
        olives.handlers.set("Lang", function(json, onEnd){
                var _path = __dirname+'/public/i8n/'+json.lang+'.json';
                fs.exists(_path, function(exists){
                        if (exists){
                                var labels=fs.readFileSync(_path, 'utf8');
                                onEnd(JSON.parse(labels));
                        }
                        else{
                                onEnd("nok");
                        }    
                });
        });
        
        olives.handlers.set("Signup", function (json, onEnd) {
                        var user = new CouchDBUser();
                        
                        user.setTransport(transport);
                        user.set("password", json.password);
                        user.set("name", json.name);
                        
                        user.create().then(function (si) {
                                
                                // add credentials to the cookie
                                var cookieJSON = cookie.parse(json.handshake.headers.cookie), 
                                    sessionID = cookieJSON["ideafy.sid"].split("s:")[1].split(".")[0];
                                    
                                sessionStore.get(sessionID, function(err, session) {
                                        if (err) {
                                                throw new Error(err);
                                        } else {
                                                session.auth = json.name + ":" + json.password;
                                                sessionStore.set(sessionID, session);
                                                onEnd({
                                                        signup : "ok",
                                                        db : _db,
                                                        message: json.name + " successfully signed up"
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
                        });
                });
        
        olives.handlers.set('Welcome', function(userid, language, onEnd){
                var Id = "", cdb = new CouchDBStore(), lang  = language.toUpperCase();
                
                (["US", "FR"].indexOf(lang.substr(2))>-1) ? Id = "I:WELCOME:"+lang : Id = "I:WELCOME:US";
                
                getDocAsAdmin(Id, cdb).then(function(){
                                        var shared = cdb.get("sharewith");
                                        shared.alter("push", userid);
                                        updateDocAsAdmin(Id, cdb).then(function(){
                                                onEnd({"res": "ok"});
                                        })
                                })
                      
        });

        olives.handlers.set("CheckLogin", function(json, onEnd){
                var cookieJSON = cookie.parse(json.handshake.headers.cookie),
                    sessionID = cookieJSON["ideafy.sid"].split("s:")[1].split(".")[0],
                    cdb = new CouchDBStore();    
                // return false if document does not exist in database
                getDocAsAdmin(json.id, cdb).then(function(){
                                sessionStore.get(sessionID, function(err, session){
                                        if(err){throw new Error(err);}
                                        else{
                                                (session.auth && session.auth.search(json.id) >-1) ? onEnd({authenticated: true}) : onEnd({authenticated : false});
                                        } 
                                });
                        }, function(){onEnd({authenticated: false});});
                });
        
        olives.handlers.set("Login", function(json, onEnd) {
                var user = new CouchDBUser();
                
                user.setTransport(transport);
                user.set("password", json.password);
                user.set("name", json.name);
                
                user.login(json.name, json.password).then(function(result) {
                        
                        var result = JSON.parse(result);
                        
                        if (!result.error) {
                                var cookieJSON = cookie.parse(json.handshake.headers.cookie), 
                                    sessionID = cookieJSON["ideafy.sid"].split("s:")[1].split(".")[0];
                                
                                sessionStore.get(sessionID, function(err, session) {
                                        if (err) {
                                                throw new Error(err);
                                        } else {
                                                session.auth = json.name + ":" + json.password;
                                                sessionStore.set(sessionID, session);
                                                onEnd({
                                                        login : "ok",
                                                        db : _db,
                                                        message: json.name + " is logged-in",
                                                        session: session
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
        
        // retrieve an attachment document (e.g brainstorming session)
        olives.handlers.set("GetFile", function(json, onEnd){
                var _filename =  __dirname+'/attachments/'+ json.sid+'/'+json.filename;;
                    
                fs.readFile(_filename, 'utf8', function(error, data){
                        if (data){
                                onEnd(data);
                        }
                        else {
                                console.log(error);
                                onEnd({"error": error});
                        }                
                });
        });
        
        // retrieve a given user's avatar
        olives.handlers.set("GetAvatar", function(json, onEnd){
                var _ext,
                    gifPattern = /[\w\-_\+\(\)]{0,}[\.gif|\.GIF]{4}/,
                    jpgPattern = /[\w\-_\+\(\)]{0,}[\.jpg|\.JPG]{4}/,
                    pngPattern = /[\w\-_\+\(\)]{0,}[\.png|\.PNG]{4}/,
                    _file,
                    readFile = wrap(fs.readFile);
                
                // file info provided by client
                if (json.file){
                        if (json.file.search("img/avatars")>-1) onEnd(json.file)
                        else {
                                _file = __dirname+"/attachments/avatars/"+ json.file;
                                
                                // retrieve file extension
                                if (json.file.match(pngPattern)) { ext = "png";}
                                if (json.file.match(jpgPattern)) { ext = "jpg";}
                                if (json.file.match(gifPattern)) { ext = "gif";}
                                
                                readFile(_file, function (error, data){
                                        if (data){
                                                onEnd("data:image/"+ext+";base64," + new Buffer(data, 'binary').toString('base64'));
                                        }
                                        else {
                                                console.log(error);
                                                onEnd({"error": error});
                                        }        
                                });        
                        }        
                }
                // need to fetch file info from couchDB
                else {
                        var _cdb = new CouchDBStore();
                        _cdb.setTransport(transport);
                        
                        getDocAsAdmin(json.id, _cdb).then(function(){
                                var _image = _cdb.get("picture_file");
                            
                        // if user avatar is one of the default choices then return path (available in local files)
                        if (_image.search("img/avatars")>-1){
                                onEnd(_image);
                        }
                        // otherwise return base64 version of file located in attachments directory
                        else {
                                _file = __dirname+"/attachments/avatars/"+_image;
                                
                                // retrieve file extension

                                if (_image.match(pngPattern)) { ext = "png";}
                                if (_image.match(jpgPattern)) { ext = "jpg";}
                                if (_image.match(gifPattern)) { ext = "gif";}
                            
                                readFile(_file, function (error, data){
                                        if (data){
                                                _image = "data:image/"+ext+";base64," + new Buffer(data, 'binary').toString('base64');
                                                onEnd(_image);  
                                        }
                                        else {
                                                console.log(error);
                                                onEnd({"error": error});
                                        }        
                                });      
                        }
                });
            }
                        
        });

        // Sending email messages from Ideafy
        olives.handlers.set("SendMail", function(json, onEnd) {

                var type = json.type;
                var mailOptions = {
                        from : "IDEAFY <ideafy@taiaut.com>", // sender address
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
                if (type == "doc") {
                        console.log("SEND MAIL RECEIVED:", json);
                        // set mail parameters
                        mailOptions.to = json.recipient;
                        mailOptions.subject = json.subject;
                        mailOptions.html = "<div style='background: whitesmoke; font-family=helvetica; font-size=24px; text-align=justify;'><p><b>"+json.header+ "</b></p><p>"+json.body+"</p><br><p>" + json.signature + "<hr style='margin-top: 20px'>" + json.attachHeader + json.attachBody;
                        console.log("SEND MAIL CALLED:", mailOptions);
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
                        cdb.sync(_db, "users", "_view/tomail", {
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
                                cdb.unsync();
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
                        options.path = "/"+_db+"/_design/users/_view/tomail";
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
                        getDocAsAdmin(userid, cdb).then(function() {
                                var arr = [];
                                // retrieve notifications array
                                if (cdb.get("notifications")[0]){arr = cdb.get("notifications");}
                                // add message
                                arr.unshift(message);
                                // update store and upload
                                cdb.set("notifications", arr);
                                updateDocAsAdmin(userid, cdb).then(function() {
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
                cdb.setTransport(transport);

                getDocAsAdmin(json.id, cdb).then(function() {
                        votes = cdb.get("votes");
                        if (!votes){votes=[];}
                        votes.unshift(json.vote);
                        cdb.set("votes", votes);
                        updateDocAsAdmin(json.id, cdb).then(function() {
                                //update user rated ideas & score
                                var votercdb = new CouchDBStore();
                                votercdb.setTransport(transport);
                                getDocAsAdmin(json.voter, votercdb).then(function(){
                                        var ri = votercdb.get("rated_ideas"),
                                            ip = votercdb.get("ip");
                                        ri.unshift(json.id);
                                        votercdb.set("rated_ideas", ri);
                                        votercdb.set("ip", ip+2);
                                        updateDocAsAdmin(json.voter, votercdb).then(function(){
                                                onEnd("ok");
                                                votercdb.unsync();
                                                cdb.unsync();        
                                        }); 
                                });
                        });
                });

        });

        // Commenting on ideas
        olives.handlers.set("WriteTwocent", function(json, onEnd) {

                var cdb = new CouchDBStore();
                getDocAsAdmin(json.docId, cdb).then(function(){
                        var tc = cdb.get("twocents"), increment = 0, reason = "";
                        if (json.type === "new"){
                                // new twocents are always appended at the top of the list
                                tc.unshift(json.twocent);
                                reason = "newtc";
                                increment = 5;
                        }
                        if (json.type === "edit"){
                                tc.splice(json.position, 1, json.twocent);        
                        }
                        if (json.type === "delete"){
                                tc.splice(json.position, 1);
                                reason = "deltc";
                                increment = -5;        
                        }
                        if (json.type === "deltcreply"){
                                var replies = tc[json.twocent].replies;
                                replies.splice(json.position, 1);
                                tc[json.twocent].replies = replies;
                        }
                        if (json.type === "newreply"){
                                // add new reply at the end of the array
                                tc[json.twocent].replies.push(json.reply);
                        }
                        if (json.type === "editreply"){
                                // replace reply with new content
                                tc[json.twocent].replies.splice(json.position, 1, json.reply);
                        }
                        cdb.set("twocents", tc);
                        updateDocAsAdmin(json.docId, cdb).then(function(){
                                        // call function to update user score here and amount of twocents
                                        if (increment !== 0){
                                                updateUserIP(json.twocent.author, reason, increment, function(result){
                                                        if (result !== "score_updated"){
                                                                onEnd("issue updating user IP");
                                                        }
                                                        else{
                                                                onEnd("ok");
                                                        }
                                                        cdb.unsync();       
                                                });
                                        }
                                        else {
                                                onEnd("ok");
                                                cdb.unsync();
                                        }
                        });     
                });

        });

        // updating a session's score
        olives.handlers.set("UpdateSessionScore", function(json, onEnd){
                var cdb = new CouchDBStore(), increment, min_score, bonus, coeff, wbdata, t, input;
                
                switch(json.step){
                        case "quicksetup":
                                min_score = 10;
                                bonus = 20 - Math.floor(json.time/3000); // time bonus
                                if (bonus < 0) { bonus = 0;}
                                increment = 15 - (json.cards*3);
                                if (increment<0) { increment = 0;}
                                increment += bonus;
                                if (increment < min_score) increment = min_score;
                                break;
                        case "quickscenario":
                                wbdata = JSON.parse(json.wbcontent);
                                input = JSON.parse(json.scenario);
                                t = json.time;
                                if (t>=900000) coeff = 0.75; // too long
                                if (t<900000) coeff = 1; // ok
                                if (t<600000) coeff = 1.5; // great !!
                                if (t<300000) coeff = 0.75; // too fast
                                if (t<120000) coeff = 0.25; // way too fast
                                if (input.title.length+input.story.length+input.solution.length < 200) coeff *= 0.5; // need a bit more effort
                                if (wbdata.length>12) coeff *= 1.25
                                else {
                                        if (wbdata.length < 3) coeff *= 0.25
                                        else if (wbdata.length < 6) coeff *= 0.75
                                 }
                                if (json.wbcontent.search("import") && json.wbcontent.search("drawing")) bonus = 25
                                else if (json.wbcontent.search("import") || json.wbcontent.search("drawing"))  bonus = 10
                                
                                increment = Math.floor((wbdata.length*10 + bonus)*coeff);
                                break;
                        case "quicktech":
                                min_score = 10;
                                bonus = 20 - Math.floor(json.time/3000); // time bonus
                                if (bonus < 0) { bonus = 0;}
                                increment = 15 - (json.cards*3);
                                if (increment<0) { increment = 0;}
                                increment += bonus;
                                if (increment < min_score) increment = min_score;
                                break;
                        case "quickidea":
                                wbdata = JSON.parse(json.wbcontent);
                                input = JSON.parse(json.idea);
                                t = json.time;
                                if (t>=900000) coeff = 1; // too long
                                if (t<900000) coeff = 1.5; // ok
                                if (t<600000) coeff = 1.5; // great !!
                                if (t<300000) coeff = 0.8; // too fast
                                if (t<120000) coeff = 0.5; // way too fast
                                if (input.title.length+input.description.length+input.solution.length < 200) coeff *= 0.5; // need a bit more effort
                                if (wbdata.length>6) coeff *= 1.25
                                else {
                                        if (wbdata.length < 3) coeff *= 0.25
                                        else if (wbdata.length < 6) coeff *= 0.75
                                 }
                                if (json.wbcontent.search("import") && json.wbcontent.search("drawing")) bonus = 25
                                else if (json.wbcontent.search("import") || json.wbcontent.search("drawing"))  bonus = 10
                                
                                increment = Math.floor((wbdata.length*10 + bonus)*coeff);
                                break;       
                        default:
                                increment = 0;
                                break;
                }
                
                if (increment !== 0){
                        getDocAsAdmin(json.sid, cdb).then(function(){
                                cdb.set("score", parseInt(cdb.get("score")+increment, 10));
                                updateDocAsAdmin(json.sid, cdb).then(function(){
                                   onEnd({res: "ok", value: cdb.get("score")});
                                   cdb.unsync();  
                                });
                        });
                }
                else {
                        onEnd({res:"ok", value: 0})
                }
                        
        });
        
        // Clean up attachments from drive when user deletes a session
        olives.handlers.set("cleanUpSession", function(id, onEnd){
                var _path = __dirname+'/attachments/'+id;
                
                fs.exists(_path, function(exists){
                        if (exists){
                                // need to delete all files first
                                fs.readdirSync(_path).forEach(function(file){
                                        fs.unlink(path.join(_path, file));
                                });
                                fs.rmdirSync(_path);
                                onEnd("ok"); 
                        }
                        else {
                                onEnd({"err": "Directory not found"});
                        } 
                })        
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

                cdb.setTransport(transport);

                cdb.sync(_db, json.dest).then(function() {
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
                                cdb.unsync();
                        });
                });

        });
});

process.on('uncaughtException', function(error) {
        console.log(error.stack);
});
