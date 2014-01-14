/**
 * IDEAFY server
 * =============
 * 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
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
    wrap = require("./wrap"),
    srvutils = require("./srvutils.js"),
    apputils = require("./apputils.js"),
    comutils = require("./comutils.js"),
    loginutils = require("./loginutils.js"),
    cdbadmin = require("./cdbadmin.js");
    
    var srvUtils = new srvutils.SrvUtils(),
        appUtils = new apputils.AppUtils(),
        comUtils = new comutils.ComUtils(),
        loginUtils = new loginutils.LoginUtils(),
        CDBAdmin = new cdbadmin.CDBAdmin();
  
// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
        // mail sent by Ideafy,
        host: "smtp.gmail.com",
        secureConnection : true,
        port : 465,
        auth : {
                user : "vincent.weyl@gmail.com",
                pass : "$Nor&Vin2012"
        }
});


CouchDBTools.requirejs(["CouchDBUser", "Transport", "CouchDBDocument", "CouchDBView", "CouchDBBulkDocuments", "Store", "Promise"], function(CouchDBUser, Transport, CouchDBDocument, CouchDBView, CouchDBBulkDocuments, Store, Promise) {
        var transport = new Transport(olives.handlers),
            _db, _dbIP, _dbPort, cdbAdminCredentials, supportEmail, currentVersion, contentPath, badges,
            app = http.createServer(connect()
                .use(connect.responseTime())
                .use(redirect())
                .use(connect.bodyParser({ uploadDir:contentPath+'/public/upload', keepExtensions: true }))
                .use('/upload', function(req, res){
                        var type = req.body.type,
                            _path = contentPath+'/attachments/',
                            filename, // final name of the file on server
                            tempname, // temp name after file upload
                            now,
                            dataurl,
                            dir;
                        if (type === 'postit' || type === 'deckpic' || type === 'cardpic'){
                                dir = req.body.dir;
                                now = new Date();
                                filename = _path+dir+'/'+req.body.filename;
                                dataurl = req.body.dataString;
                                
                                fs.exists(_path+dir, function(exists){
                                        if (!exists) {
                                                fs.mkdir(_path+dir, 0777, function(err){
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
                        if (type === 'avatar'){
                                filename = _path+'avatars/'+req.body.filename;
                                dataurl = req.body.img;
                                fs.exists(filename, function(exists){
                                        if (exists) {
                                                fs.unlinkSync(filename);
                                        }
                                        fs.writeFile(filename, dataurl, function(err){
                                                if (err) {
                                                        throw(err);
                                                }
                                                else{
                                                        res.write("ok");
                                                        res.end();
                                                }
                                        });
                                });
                        }
                })      
                .use(function(req, res, next) {
                        res.setHeader("Ideady Server", "node.js/" + process.versions.node);
                        res.setHeader("X-Powered-By", "OlivesJS + Connect + Socket.io");
                        next();
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
        io.set('log level', 0);                    // reduce logging
        io.set("close timeout", 60);
        io.set("heartbeat interval", 25);
        
        // we need lots of sockets
        http.globalAgent.maxSockets = Infinity;
        
        setInterval(function(){
                console.log("number of sockets used : ", Object.keys(io.connected).length, "socket names : ", JSON.stringify(Object.keys(io.connected)));
        }, 60000);
        
        // register transport
        olives.registerSocketIO(io);
        
        // couchdb config update (session authentication)
        //olives.config.update("CouchDB", "sessionStore", sessionStore);
        CouchDBTools.configuration.sessionStore = sessionStore;
        olives.handlers.set("CouchDB", CouchDBTools.handler);
        
        /****************************************
         *  APPLICATION CONFIGURATION
         ****************************************/
        
        // Name and IP address of the application database
        _db = "ideafy";
        _dbIP = "127.0.0.1";
        _dbPort = 5984;
        // Database admin login
        cdbAdminCredentials = "admin:innovation4U";
        // mail sender & address
        mailSender = "IDEAFY <ideafy@taiaut.com>";
        // email address fro application support
        supportEmail = "contact@taiaut.com";
        // Application  client minimum version
        currentVersion = "1.1.7";
        // Path where attachments are stored
        contentPath = __dirname;
        // Rules to grant special badges and achievements
        badges;
        
        /*
         *  Application utility functions
         */
        
        // cdbadmin utilities
       CDBAdmin.setVar(_db, _dbIP, _dbPort, cdbAdminCredentials, transport);
       CDBAdmin.setConstructors(Promise, CouchDBDocument);
        
        var updateUserIP = CDBAdmin.updateUserIP,
              updateDocAsAdmin = CDBAdmin.updateDoc,
              getDocAsAdmin = CDBAdmin.getDoc,
              createDocAsAdmin = CDBAdmin.createDoc,
              getViewAsAdmin = CDBAdmin.getView,
              removeDocAsAdmin = CDBAdmin.removeDoc,
              sendSignupEmail = comUtils.sendSignupEmail,
              checkInvited = appUtils.checkInvited,
              addInvited = appUtils.addInvited; 
                       
        // utility handlers (no couchdb)
        srvUtils.setVar(contentPath, currentVersion);
        olives.handlers.set("CheckVersion", srvUtils.checkVersion);
        olives.handlers.set("GetFile", srvUtils.getFile);
        olives.handlers.set("Lang", srvUtils.getLabels);
        olives.handlers.set("GetLanguages", srvUtils.getLanguages);
        olives.handlers.set("cleanUpSession", srvUtils.cleanUpSession);
        olives.handlers.set("DeleteAttachment", srvUtils.deleteAttachment);
        
        // login utilities
        loginUtils.setConstructors(CouchDBDocument, CouchDBUser);
        loginUtils.setFunctions(sendSignupEmail, checkInvited, CDBAdmin);
        loginUtils.setVar(cookie, sessionStore, transport, _db, cdbAdminCredentials);
        
        olives.handlers.set("Signup", loginUtils.signup);
        olives.handlers.set("CheckLogin", loginUtils.checkLogin);
        olives.handlers.set("Login", loginUtils.login);
        olives.handlers.set("ChangePWD", loginUtils.changePassword);
        
        // communication utilities (mail and application notifications)
        comUtils.setVar(smtpTransport, supportEmail, mailSender);
        comUtils.setConstructors(CouchDBDocument);
        comUtils.setFunctions(CDBAdmin, checkInvited, addInvited);
        olives.handlers.set("SendMail", comUtils.sendMail);
        olives.handlers.set("Support", comUtils.support);
        olives.handlers.set("Notify", comUtils.notify);
        olives.handlers.set("Invite", comUtils.invite);
        
        // application utilities and handlers
        appUtils.setConstructors(CouchDBDocument, CouchDBView, Promise);
        appUtils.setVar(transport, _db, _dbIP, _dbPort, cdbAdminCredentials, badges);
        appUtils.setCDBAdmin(CDBAdmin);
        olives.handlers.set("DeleteDeck", appUtils.deleteDeck);
        olives.handlers.set("DeleteCards", appUtils.removeCardsFromDatabase);
        olives.handlers.set("ShareDeck", appUtils.shareDeck);
        olives.handlers.set("GetFavList", appUtils.getFavList);
        olives.handlers.set("GetAvatar", appUtils.getAvatar);
        olives.handlers.set("GetUserDetails", appUtils.getUserDetails);
        olives.handlers.set("GetGrade", appUtils.getGrade);
        olives.handlers.set("GetAchievements", appUtils.getAchievements);
        olives.handlers.set("GetUserNames", appUtils.getUserNames);
        olives.handlers.set("Welcome", appUtils.welcome);
        olives.handlers.set("CheckRecipientList", appUtils.welcome);
        
        
        // disconnection events
        io.sockets.on("connection", function(socket){
                socket.on("disconnect", function(){
                        var cdbView = new CouchDBView(),
                            cdbDoc = new CouchDBDocument();
                        
                        getViewAsAdmin("users", "sockets", {key: '"'+socket.id+'"'}, cdbView)
                        .then(function(){
                                if (cdbView.getNbItems()){
                                        getDocAsAdmin(cdbView.get(0).id, cdbDoc)
                                        .then(function(){
                                                cdbDoc.set("online", false);
                                                cdbDoc.set("sock", "");
                                                return updateDocAsAdmin(cdbDoc.get("_id"), cdbDoc);
                                        });
                                }
                        });        
                });  
        });
        
        // Voting on ideas
        olives.handlers.set("Vote", function(json, onEnd) {

                var cdb = new CouchDBDocument(),
                    votercdb = new CouchDBDocument(),
                    votes;
                cdb.setTransport(transport);
                // get idea document
                getDocAsAdmin(json.id, cdb)
                .then(function() {
                        votes = cdb.get("votes");
                        if (!votes){votes=[];}
                        votes.unshift(json.vote);
                        cdb.set("votes", votes);
                        return updateDocAsAdmin(json.id, cdb);
                })
                .then(function() {
                        //update user rated ideas & score
                        votercdb.setTransport(transport);
                        return getDocAsAdmin(json.voter, votercdb);
                })
                .then(function(){
                        var ri = votercdb.get("rated_ideas") || [],
                            ip = votercdb.get("ip") || 0;
                        ri.unshift(json.id);
                        votercdb.set("rated_ideas", ri);
                        votercdb.set("ip", ip+2);
                        return updateDocAsAdmin(json.voter, votercdb);
                })
                .then(function(){
                        onEnd("ok");       
                 });
        });
        
        // Removing an idea that has been shared with a user from his private library
        olives.handlers.set("RemoveFromLibrary", function(json, onEnd){
                var cdb = new CouchDBDocument();
                cdb.setTransport(transport);
                getDocAsAdmin(json.id, cdb)
                .then(function() {
                        var shared = cdb.get("sharedwith");
                        shared.splice(shared.indexOf(json.userid), 1);
                        cdb.set("sharedwith", shared);
                        return updateDocAsAdmin(json.id, cdb);
                })
                .then(function() {
                        onEnd("ok");
                });     
        });

        // Commenting on ideas
        olives.handlers.set("WriteTwocent", function(json, onEnd) {
                var cdb = new CouchDBDocument();
                getDocAsAdmin(json.docId, cdb)
                .then(function(){
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
                        return updateDocAsAdmin(json.docId, cdb);
                })
                .then(function(){
                        // call function to update user score here and amount of twocents
                        if (increment !== 0){
                                updateUserIP(json.twocent.author, reason, increment, function(result){
                                        if (result !== "score_updated"){
                                                onEnd("issue updating user IP");
                                        }
                                        else{
                                                onEnd("ok");
                                        }       
                                });
                        }
                        else {
                                onEnd("ok");
                        }     
                });
        });
        
        // sending a twocent ot another user
        olives.handlers.set("SendTwocent", function(json, onEnd){
                var cdb = new CouchDBDocument(), now = new Date();
                
                getDocAsAdmin(json.userid, cdb)
                .then(function(){
                        var twocents = cdb.get("twocents") || [],
                            notifs = cdb.get("notifications") || [],
                            message = {
                                "type" : "2C+",
                                "status" : "unread",
                                "date" : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()],
                                "author" : json.tc.author,
                                "username" : json.tc.username,
                                "firstname" : json.tc.firstname,
                                "toList" : json.username,
                                "ccList" : "",
                                "object" : "",
                                "body" : json.tc.message,
                                "signature" : ""
                             };
                        twocents.unshift(json.tc);
                        notifs.unshift(message);
                        cdb.set("twocents", twocents);
                        cdb.set("notifications", notifs);
                        return updateDocAsAdmin(json.userid, cdb);
                })
                .then(function(){
                        onEnd("ok");        
                });  
        });
        
        // updating user document and score following certain actions
        olives.handlers.set("UpdateUIP", function(json, onEnd){
                var cdb = new CouchDBDocument(),
                    userRewards = new CouchDBDocument(),
                    scored = [];
                
                getDocAsAdmin(json.userid+"_rewards", userRewards)
                .then(function(){
                        if (userRewards.get("scored")) scored = userRewards.get("scored");
                        return getDocAsAdmin(json.userid, cdb);
                })
                .then(function(){
                        var score = cdb.get("ip"),
                            ideas_count = cdb.get("ideas_count") || 0,
                            tq_count = cdb.get("twoquestions_count") || 0,
                            news = cdb.get("news"),
                            now = new Date(),
                            date = [now.getFullYear(), now.getMonth(), now.getDate()];
                                
                        // userRewards doc is used ot make sure ideas and twoquestions are only counted once.
                        // a further step would be to double check existence of docId in the database
                        if (json.type === 6 && scored.indexOf(json.docId)<0){
                                score += 5;
                                ideas_count++;
                                news.unshift({type:"IDEA+", date:date, content:{title:json.docTitle, docId:json.docId}});
                                cdb.set("ip", score);
                                cdb.set("ideas_count", ideas_count);
                                cdb.set("news", news);
                                scored.unshift(json.docId);
                        }
                        
                        if (json.type === 10 && scored.indexOf(json.docId)<0){
                                score += 3;
                                tq_count++;
                                news.unshift({type:"2Q+", date:date, content:{question: json.question, docId: json.docId}});
                                cdb.set("ip", score);
                                cdb.set("twoquestions_count", tq_count);
                                cdb.set("news", news);
                                scored.unshift(json.docId);
                        }
                        userRewards.set("scored", scored);
                        return updateDocAsAdmin(json.userid+"_rewards", userRewards);
                })
                .then(function(){
                        return updateDocAsAdmin(json.userid, cdb);
                })
                .then(function(){
                        onEnd("ok");
                });
        });

        // updating a session's score
        olives.handlers.set("UpdateSessionScore", function(json, onEnd){
                var cdb = new CouchDBDocument(), increment = 0, min_score, bonus = 0, coeff = 0, wbdata, t, input,
                    updateUserWithSessionScore = function(sessionCDB){
                        var promise = new Promise(),
                            ip = sessionCDB.get("score"),
                            idList = [],
                            parts = sessionCDB.get("participants") || [],
                            i,l,
                            reason;
                        
                        // gather list of users who should be credited
                        idList.push(sessionCDB.get("initiator").id);
                        if (parts && parts.length){
                                parts.forEach(function(part){
                                        idList.push(part.id);
                                });
                        }
                        
                        // indicate session mode (default is any of the multi-user types)
                        switch (sessionCDB.get("mode")){
                                case "quick":
                                        updateUserIP(idList[0], "su_session_complete", ip, promise.fulfill);
                                        break;
                                default:
                                        for (i=0, l=idList.length; i<l; i++){
                                                // update session leader
                                                if (i === 0){
                                                        updateUserIP(idList[i], "mu_session_complete", ip, promise.fulfill);        
                                                }
                                                // update participant
                                                else{
                                                        updateUserIP(idList[i], "mu_participant", ip, promise.fulfill);         
                                                }
                                        }
                                        break;        
                        }
                        return promise;
                };
                
                switch(json.step){
                        case "quicksetup":
                                min_score = 10;
                                bonus = 20 - Math.floor(json.time/3000); // time bonus
                                if (bonus < 0) {bonus = 0;}
                                increment = 15 - (json.cards*3);
                                if (increment<0) { increment = 0;}
                                increment += bonus;
                                if (increment < min_score) {increment = min_score;}
                                break;
                        case "quickscenario":
                                wbdata = JSON.parse(json.wbcontent);
                                input = JSON.parse(json.scenario);
                                t = json.time;
                                if (t>=900000) {coeff = 0.75;} // too long
                                if (t<900000) {coeff = 1;} // ok
                                if (t<600000) {coeff = 1.5;} // great !!
                                if (t<300000) {coeff = 0.75;} // too fast
                                if (t<120000) {coeff = 0.25;} // way too fast
                                if (input.title.length+input.story.length+input.solution.length < 300) {coeff *= 0.5;} // need a bit more effort
                                if (wbdata.length>12) {coeff *= 1.25;}
                                else {
                                        if (wbdata.length < 3) {coeff *= 0.25;}
                                        else if (wbdata.length < 6) {coeff *= 0.75;}
                                 }
                                if ((json.wbcontent.search("import")>-1) && (json.wbcontent.search("drawing")>-1)) {bonus = 25;}
                                else if ((json.wbcontent.search("import")>-1) || (json.wbcontent.search("drawing")>-1))  {bonus = 10;}
                                
                                increment = Math.floor((wbdata.length*10 + bonus)*coeff);
                                break;
                        case "quicktech":
                                min_score = 10;
                                bonus = 20 - Math.floor(json.time/3000); // time bonus
                                if (bonus < 0) { bonus = 0;}
                                increment = 15 - (json.cards*3);
                                if (increment<0) { increment = 0;}
                                increment += bonus;
                                if (increment < min_score) {increment = min_score;}
                                break;
                        case "quickidea":
                                wbdata = JSON.parse(json.wbcontent);
                                input = JSON.parse(json.idea);
                                t = json.time;
                                if (t>=900000) {coeff = 1;} // too long
                                if (t<900000) {coeff = 1.5;} // ok
                                if (t<600000) {coeff = 1.5;} // great !!
                                if (t<300000) {coeff = 0.8;} // too fast
                                if (t<120000) {coeff = 0.5;} // way too fast
                                if (input.title.length+input.description.length+input.solution.length < 300) {coeff *= 0.5;} // need a bit more effort
                                if (wbdata.length>6) {coeff *= 1.25;}
                                else {
                                        if (wbdata.length < 3) {coeff *= 0.25;}
                                        else if (wbdata.length < 6) {coeff *= 0.75;}
                                 }
                                if ((json.wbcontent.search("import")>-1) && (json.wbcontent.search("drawing")>-1)) {bonus = 25;}
                                else if ((json.wbcontent.search("import")>-1) || (json.wbcontent.search("drawing")>-1))  {bonus = 10;}
                                increment = Math.floor((wbdata.length*10 + bonus)*coeff);
                                break;
                        case "musetup":
                                min_score = 10;
                                bonus = 30 - Math.floor(json.time/10000); // time bonus
                                if (bonus < 0) {bonus = 0;}
                                increment = 24 - (json.cards*3);
                                if (increment<0) { increment = 0;}
                                increment += bonus;
                                if (increment < min_score) {increment = min_score;}
                                break;
                        case "muscenario":
                                min_score = 20;
                                wbdata = JSON.parse(json.wbcontent);
                                input = JSON.parse(json.scenario);
                                t = json.time;
                                if (t>=120000) {coeff = 0.75;} // too long
                                if (t<1200000) {coeff = 1;} // ok
                                if (t<900000) {coeff = 1.5;} // great !!
                                if (t<600000) {coeff = 0.75;} // too fast
                                if (t<300000) {coeff = 0.25;} // way too fast
                                if (input.title.length+input.story.length+input.solution.length < 300) {coeff *= 0.5;} // need a bit more effort
                                if (wbdata.length>12) {coeff *= 1.25;}
                                else {
                                        if (wbdata.length < 3) {coeff *= 0.25;}
                                        else if (wbdata.length < 6) {coeff *= 0.75;}
                                 }
                                if ((json.wbcontent.search("import")>-1) && (json.wbcontent.search("drawing")>-1)) {bonus = 25;}
                                else if ((json.wbcontent.search("import")>-1) || (json.wbcontent.search("drawing")>-1))  {bonus = 10;}
                                
                                increment = Math.floor((wbdata.length*12 + bonus)*coeff) + min_score;
                                break;
                        case "mutech":
                                min_score = 10;
                                bonus = 30 - Math.floor(json.time/10000); // time bonus
                                if (bonus < 0) {bonus = 0;}
                                increment = 24 - (json.cards*3);
                                if (increment<0) { increment = 0;}
                                increment += bonus;
                                if (increment < min_score) {increment = min_score;}
                                break;
                        case "muidea":
                                min_score = 20;
                                wbdata = JSON.parse(json.wbcontent);
                                input = JSON.parse(json.idea);
                                t = json.time;
                                if (t>=120000) {coeff = 0.75;} // too long
                                if (t<1200000) {coeff = 1;} // ok
                                if (t<900000) {coeff = 1.5;} // great !!
                                if (t<600000) {coeff = 0.75;} // too fast
                                if (t<300000) {coeff = 0.25;} // way too fast
                                if (input.title.length+input.description.length+input.solution.length < 300) {coeff *= 0.5;} // need a bit more effort
                                if (wbdata.length>12) {coeff *= 1.25;}
                                else {
                                        if (wbdata.length < 3) {coeff *= 0.25;}
                                        else if (wbdata.length < 6) {coeff *= 0.75;}
                                 }
                                if ((json.wbcontent.search("import")>-1) && (json.wbcontent.search("drawing")>-1)) {bonus = 25;}
                                else if ((json.wbcontent.search("import")>-1) || (json.wbcontent.search("drawing")>-1))  {bonus = 10;}
                                
                                increment = Math.floor((wbdata.length*12 + bonus)*coeff) + min_score;
                                
                                
                                if (json.visibility === "public") {increment *= 2;}
                                if (json.sessionReplay){increment = Math.floor(increment*1.5);}
                                break;     
                        default:
                                increment = 0;
                                break;
                }
                
                if (increment !== 0 || json.step.search("idea")>-1){
                        getDocAsAdmin(json.sid, cdb)
                        .then(function(){
                                var score = cdb.get("score") || 0;
                                    score += increment;
                                cdb.set("score", score);
                                return updateDocAsAdmin(json.sid, cdb);
                        })
                        .then(function(){
                                // if idea has been created then credit participants with session points
                                if (json.step.search("idea")>-1){
                                        updateUserWithSessionScore(cdb).then(function(){
                                                onEnd({res: "ok", value: cdb.get("score")});
                                        });
                                }
                                else {
                                        onEnd({res: "ok", value: cdb.get("score")});        
                                }
                        });
                }
                else {
                        onEnd({res:"ok", value: 0});
                }
        });
        
});

process.on('uncaughtException', function(error) {
        console.log(error.stack);
});
