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
                        
                        console.log("UPLOAD REQUEST", res);
                        
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
                                maxAge : 864000000,
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
           },
            sendSignupEmail = function(login, pwd, lang){
                var mailOptions = {
                        from : "IDEAFY <ideafy@taiaut.com>", // sender address
                        to : login
                };
                
                switch(lang){
                        case ("en-us"):
                                mailOptions.subject = "Ideafy confirmation";
                                mailOptions.text ="Thank you for registering to Ideafy. Your login is "+login+ " and your password is "+pwd+". We hope you will find the application enjoyable and useful.\nThe Ideafy team."
                                break;
                        case ("fr-fr"):
                                mailOptions.subject = "Confirmation d'inscription à Ideafy";
                                mailOptions.text ="Merci de vous être enregistré sur Ideafy. Votre identifiant est "+login+ " et votre mot de passe "+pwd+". Nous espérons que vous prendrez plaisir à utiliser notre application.\nL'équipe Ideafy."
                                break;
                        default:
                                mailOptions.subject = "Thank you for joining Ideafy";
                                break;
                }
                smtpTransport.sendMail(mailOptions, function(error, response) {
                        if (error) {
                                console.log(error, response);
                        }
                });        
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
                                                
                                                // send confirmation Email
                                                sendSignupEmail(json.name, json.password, json.lang);
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

                var type = json.type,
                    mailOptions = {
                        from : "IDEAFY <ideafy@taiaut.com>", // sender address
                        to : "", // list of receivers
                        cc : "", // automatic copy to sender
                        replyTo : "", // recipient should reply to sender
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
                if (type === "doc") {
                        // set mail parameters
                        mailOptions.to = json.recipient;
                        mailOptions.cc = json.cc;
                        mailOptions.replyTo = json.replyTo;
                        mailOptions.subject = json.subject;
                        mailOptions.html = "<p><b>"+json.header+"</b></p><p>"+json.body+"</p><p>----------<br>"+ json.signature +"<div>"+json.attachHeader + json.attachBody+"</div>";
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
                if (type === "message"){
                        
                }
                if (type === "contact"){
                        
                }

        });

        /*
         * Handle notification events:
         *     includes:
         *             - checkUserList to verify recipients and return an array of userids
         *             - notify to notify one or several users
         *
         */
        olives.handlers.set("CheckRecipientList", function(json, onEnd) {

                var result = {}, cdb = new CouchDBStore(), list = json.list, options = {}, bulkDocs = new Store(), req;

                /**
                 * Building a temporary solution before changes in couchDBStore (one bulk query of the view)
                 */

                // manually build the http request to couchDB
                options.hostname = "127.0.0.1";
                options.port = 5984;
                options.method = "POST";
                options.auth = cdbAdminCredentials;
                options.path = "/"+_db+"/_design/users/_view/username";
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
                                if (JSON.parse(body).rows.length === json.list.length){
                                        result = JSON.parse(body).rows;
                                        onEnd(result);
                                }
                                else {
                                        onEnd({error: "Error : one of more recipients not found in Ideafy"});
                                }
                        });
                };
                // emit the http request and the data
                req = http.request(options, callback);
                req.end(options.data, "utf8");
        });

        olives.handlers.set("Notify", function(json, onEnd) {

                var dest = json.dest, sendResults = new Store([]),
                // build message
                message = {
                        "type" : json.type,
                        "status" : "unread",
                        "date" : json.date,
                        "author" : json.author,
                        "username" : json.username,
                        "firstname" : json.firstname,
                        "toList" : json.toList,
                        "ccList" : json.ccList,
                        "object" : json.object,
                        "body" : json.body,
                        "signature" : json.signature
                },

                /**
                 * A function to push message to couchDB
                 * @param {Object} msg the message to deliver
                 * @param {String} userid the userid in couchDB to deliver the message to
                 */
                sendMessage = function(msg, userid) {
                        var cdb = new CouchDBStore();
                        getDocAsAdmin(userid, cdb).then(function() {
                                var arr = [];
                                // retrieve notifications array
                                if (cdb.get("notifications")[0]){arr = cdb.get("notifications");}
                                // add message
                                arr.unshift(msg);
                                // update store and upload
                                cdb.set("notifications", arr);
                                updateDocAsAdmin(userid, cdb).then(function() {
                                        sendResults.alter("push", {
                                                res : "ok",
                                                id : userid
                                        });
                                });
                        });
                },
                /**
                 * A function to add message to sender's document in couchDB
                 * @param {Object} msg the message to deliver
                 */
                addMessageToSent = function(msg){
                        var cdb = new CouchDBStore();
                        getDocAsAdmin(msg.author, cdb).then(function(){
                                var arr = cdb.get("sentMessages")||[];
                                arr.unshift(msg);
                                cdb.set('sentMessages', arr);
                                updateDocAsAdmin(msg.author, cdb).then(function(){
                                        console.log("private copy saved");
                                });    
                        });
                },
                /*
                 * A function to insert contact in a user's connection list when a request was accepted
                 */
                insertContact = function(userid, contact, onEnd){
                        var cdb = new CouchDBStore(), contacts = [], pos=0, news =[];
                        getDocAsAdmin(userid, cdb).then(function(){
                                contacts = cdb.get("connections");
                                news = cdb.get("news") || [];
                                for (i=0,l=contacts.length;i<l;i++){
                                        // check if contact is of type user or group first
                                        if (contacts[i].type === "user"){
                                                if (contacts[i].lastname < contact.lastname) pos++; 
                                                if (contacts[i].lastname === contact.lastname){
                                                        if (contacts[i].firstname < contact.firstname) pos++; 
                                                }
                                        }
                                        else {
                                                if (contacts[i].username < contact.lastname)  pos++;
                                        }  
                                }
                                contacts.splice(pos, 0, contact);
                                news.unshift({"type": "CX+", "content": {userid:json.author, username:contact.username}});
                                cdb.set("connections", contacts);
                                cdb.set("news", news);
                                updateDocAsAdmin(userid, cdb).then(function(){
                                        onEnd("ok");
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

                // send message to all recipients
                for ( i = 0, l = dest.length; i < l; i++) {
                        sendMessage(message, dest[i]);
                }
                
                // add message to sent list
                addMessageToSent(message);
                
                // return sendResults if all messages have been delivered
                sendResults.watch("added", function() {
                        if (sendResults.getNbItems() === dest.length) {
                                //adding some post-treatment
                                if (json.type === "CXRaccept"){
                                         insertContact(json.dest[0], json.contactInfo, function(result){
                                                if (result){
                                                        // add to both users' score
                                                        updateUserIP(json.dest[0], "CXR", 2, function(result){console.log(result)});
                                                        updateUserIP(json.author, "CXR", 2, function(result){
                                                                onEnd(sendResults.toJSON());
                                                        });
                                                }
                                         });
                                }
                                else onEnd(sendResults.toJSON());
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
                                        }); 
                                });
                        });
                });

        });
        
        // Removing an idea that has been shared with a user from his private library
        olives.handlers.set("RemoveFromLibrary", function(json, onEnd){
                var cdb = new CouchDBStore();
                cdb.setTransport(transport);
                getDocAsAdmin(json.id, cdb).then(function() {
                        var shared = cdb.get("sharedwith");
                        shared.splice(shared.indexOf(json.userid), 1);
                        cdb.set("sharedwith", shared);
                        updateDocAsAdmin(json.id, cdb).then(function() {
                                onEnd("ok");
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

});

process.on('uncaughtException', function(error) {
        console.log(error.stack);
});
