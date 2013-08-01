/**
 * IDEAFY
 * ======
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
    pwd = require("./pwd.js"),
    srvutils = require("./srvutils.js"),
    apputils = require("./apputils.js"),
    cdbadmin = require("./cdbadmin.js");
    
    var changePassword = new pwd.ChangePassword(),
        srvUtils = new srvutils.SrvUtils(),
        appUtils = new apputils.AppUtils(),
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
            _db = "ideafy",
            cdbAdminCredentials = "admin:innovation4U",
            currentVersion = "1.1.2",
            app = http.createServer(connect()
                .use(connect.responseTime())
                .use(redirect())
                .use(connect.bodyParser({ uploadDir:__dirname+'/public/upload', keepExtensions: true }))
                .use('/upload', function(req, res){
                        var type = req.body.type,
                            _path = __dirname+'/attachments/',
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
        io.set('log level', 3);                    // reduce logging
        io.set("close timeout", 60);
        io.set("heartbeat interval", 25);
        
        // we need lots of sockets
        http.globalAgent.maxSockets = Infinity;
        
        setInterval(function(){
                console.log("number of sockets used : ", Object.keys(io.connected).length);
        }, 120000);
        
        // register transport
        olives.registerSocketIO(io);
        
        // couchdb config update (session authentication)
        //olives.config.update("CouchDB", "sessionStore", sessionStore);
        CouchDBTools.configuration.sessionStore = sessionStore;
        olives.handlers.set("CouchDB", CouchDBTools.handler);
        
        // Application utility functions
        var updateUserIP = CDBAdmin.updateUserIP,
            updateDocAsAdmin = CDBAdmin.updateDoc,
            getDocAsAdmin = CDBAdmin.getDoc,
            createDocAsAdmin = CDBAdmin.createDoc,
            getViewAsAdmin = CDBAdmin.getView,
            removeDocAsAdmin = CDBAdmin.removeDoc,
           checkInvited = function(id, onEnd){
                transport.request("CouchDB", {
                        method : "GET",
                        path:"/ideafy_invites/"+id,
                        auth: cdbAdminCredentials,
                        agent:false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        }
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json._id) {
                                onEnd(json);
                        }
                        else {
                                onEnd(false);
                        }
                });        
           },
           addInvited = function(id, cdbDoc){
                var promise = new Promise();
                transport.request("CouchDB", {
                        method : "PUT",
                        path:"/ideafy_invites/"+id,
                        auth: cdbAdminCredentials,
                        agent:false,
                        headers: {
                                "Content-Type": "application/json",
                                "Connection": "close"
                        },
                        data: cdbDoc.toJSON()
                }, function (res) {
                        var json = JSON.parse(res);
                        if (json.ok) {
                                promise.fulfill();
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
                                console.log(error, response, "it's right here");
                        }
                });        
           };
        
        
        /*
         * APPLICATION HANDLERS
         */
        
        // cdbadmin utilities
       CDBAdmin.setAdminCredentials(cdbAdminCredentials);
       CDBAdmin.setCouchDBDocument(CouchDBDocument);
       CDBAdmin.setTransport(transport);
       CDBAdmin.setPromise(Promise);
       CDBAdmin.setDB(_db);
        
        // utility handlers (no couchdb)
        srvUtils.setCurrentVersion(currentVersion);
        olives.handlers.set("CheckVersion", srvUtils.checkVersion);
        olives.handlers.set("GetFile", srvUtils.getFile);
        olives.handlers.set("Lang", srvUtils.getLabels);
        olives.handlers.set("GetLanguages", srvUtils.getLanguages);
        
        // change password handler
        changePassword.setCouchDBDocument(CouchDBDocument);
        changePassword.setCookie(cookie);
        changePassword.setTransport(transport);
        changePassword.setAdminCredentials(cdbAdminCredentials);
        changePassword.setSessionStore(sessionStore);
        
        olives.handlers.set("ChangePWD", changePassword.handler);
        
        // application utilities and handlers
        appUtils.setConstructors(CouchDBDocument, CouchDBView, Promise);
        appUtils.setCDBAdmin(CDBAdmin);
        olives.handlers.set("DeleteDeck", appUtils.deleteDeck);
        olives.handlers.set("DeleteCards", appUtils.removeCardsFromDatabase);
        olives.handlers.set("ShareDeck", appUtils.shareDeck);
        
        olives.handlers.set("Signup", function (json, onEnd) {
                        var user = new CouchDBUser();
                        
                        user.setTransport(transport);
                        user.set("password", json.password);
                        user.set("name", json.name);
                        user.set("type", "user")
                        
                        user.create().then(function (si) {
                                
                                // add credentials to the cookie
                                var cookieJSON = cookie.parse(json.handshake.headers.cookie), 
                                    sessionID = cookieJSON["ideafy.sid"].split("s:")[1].split(".")[0];
                                sessionStore.get(sessionID, function(err, session) {
                                        if (err) {
                                                throw new Error(err);
                                        }
                                        else {
                                                session.auth = json.name + ":" + json.password;
                                                sessionStore.set(sessionID, session);
                                                onEnd({
                                                        signup : "ok",
                                                        db : _db,
                                                        message: json.name + " successfully signed up"
                                                });
                                                
                                                // send confirmation Email
                                                sendSignupEmail(json.name, json.password, json.lang);
                                                
                                                // create reward doc
                                                 // create reward document
                                                var rewards = new CouchDBDocument({
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
                                                createDocAsAdmin(json.name+"_rewards", rewards);
                                                
                                                // check for referrals and update accordingly
                                                checkInvited(json.name, function(result){
                                                        if (result){
                                                                result.sender.forEach(function(id){
                                                                        var cdbDoc = new CouchDBDocument();
                                                                        getDocAsAdmin(id, cdbDoc)
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
                                                                                return updateDocAsAdmin(id, cdbDoc);
                                                                        });       
                                                                });
                                                                // remove document from ideafy_invites
                                                                transport.request("CouchDB", {
                                                                        method : "DELETE",
                                                                        path:"/ideafy_invites/"+json.name,
                                                                        auth: cdbAdminCredentials,
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
                });
        
        olives.handlers.set('Welcome', function(json, onEnd){
                var Id = "I:WELCOME:US", cdb = new CouchDBDocument(), lang="EN-US";
                // workaround to solve language issue 
                if (json.language) {
                      lang =  json.language.toUpperCase();
                      }
                if (["US", "FR"].indexOf(lang.substr(3))>-1) {
                        Id = "I:WELCOME:"+lang.substr(3);
                }
                
                getDocAsAdmin(Id, cdb)
                .then(function(){
                        var shared = cdb.get("sharewith");
                        shared.push(json.userid);
                        return updateDocAsAdmin(Id, cdb);
                })
                .then(function(){
                        onEnd({"res": "ok"});
                });
        });

        olives.handlers.set("CheckLogin", function(json, onEnd){
                var cookieJSON = cookie.parse(json.handshake.headers.cookie),
                    sessionID = cookieJSON["ideafy.sid"].split("s:")[1].split(".")[0],
                    cdb = new CouchDBDocument();
                
                console.log(json);
                   
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
                        console.log(result);
                });
        });
        
        // retrieve an attachment document (e.g brainstorming session)
        /*olives.handlers.set("GetFile", function(json, onEnd){
                var dir = json.dir || json.sid,
                    _filename =  __dirname+'/attachments/'+ dir+'/'+json.filename;
                    
                fs.readFile(_filename, 'utf8', function(error, data){
                        if (data){
                                onEnd(data);
                        }
                        else {
                                console.log(error);
                                onEnd({"error": error});
                        }                
                });
        });*/
        
        // retrieve a given user's avatar
        olives.handlers.set("GetAvatar", function(json, onEnd){
                var _file, _cdb = new CouchDBView();
                _cdb.setTransport(transport);
                        
                getViewAsAdmin('users', 'short', {key:'"'+json.id+'"'}, _cdb).then(function(){
                        var _image = _cdb.get(0).value.picture_file;
                        
                        // if user avatar is one of the default choices then return path (available in local files)
                        if (_image.search("img/avatars/deedee")>-1){
                                onEnd(_image);
                        }
                        // otherwise return file located in attachments directory (should already be base64)
                        else {
                                _file = __dirname+"/attachments/avatars/"+_image;
                                fs.readFile(_file, 'utf8', function (error, data){
                                        if (data){
                                                onEnd(data);  
                                        }
                                        else {
                                                console.log(error);
                                                onEnd({"error": error});
                                        }        
                                });      
                        }
                });
        });
        
        // retrieve a given user profile information
        olives.handlers.set("GetUserDetails", function(json, onEnd){
                var cdb = new CouchDBDocument();
                getDocAsAdmin(json.userid, cdb).then(function(){
                        // check privacy settings
                        var privacy = 0, contacts = 0, i, l, result={};
                        if (cdb.get("settings") && cdb.get("settings").privacy_lvl) privacy = cdb.get("settings").privacy_lvl;
                        
                        // return user basic info, stats and score
                        result._id = cdb.get("_id");
                        result.privacy = privacy;
                        result.firstname = cdb.get("firstname");
                        result.lastname = cdb.get("lastname");
                        result.username = cdb.get("username");
                        result.intro = cdb.get("intro");
                        result.ip = cdb.get("ip");
                        result.achievements = cdb.get("achievements");
                        result.ideas_count = cdb.get("ideas_count");
                        result.su_sessions_count = cdb.get("su_sessions_count");
                        result.mu_sessions_count = cdb.get("mu_sessions_count");
                        result.twoquestions_count = cdb.get("twoquestions_count");
                        
                        for (i=0, l=cdb.get("connections").length; i<l; i++){
                                if (cdb.get("connections")[i].type === "user") contacts++
                        }
                        result.contacts = contacts;
                        
                        if (privacy >= 1){
                        }
                        if (privacy >=2){
                                
                        }
                        onEnd(result);
                });
        });
        
        // retrieve a user's grade information
        olives.handlers.set("GetGrade", function(json, onEnd){
                var cdb = new CouchDBDocument(), leadercdb = new CouchDBView(), arr, dis, res={grade:null, distinction:null};
                getDocAsAdmin("GRADES", cdb).then(function(){
                        arr = cdb.get(json.lang).grades;
                        dis = cdb.get(json.lang).distinctions;
                        for(i=0, l=arr.length; i<l; i++){
                                if (json.ip >= arr[i].min_score) res.grade=arr[i];        
                        }
                        // check ranking
                        return getViewAsAdmin("users", "leaderboard", {descending:true, limit:100}, leadercdb);
                })
                .then(function(){
                        var leaders = JSON.parse(leadercdb.toJSON()), l = leaders.length, i = 0;
                        if (json.ip === leaders[0].key && json.ip >= arr[3].min_score) {
                                res.distinction = dis[5];
                        }
                        else if (json.ip == leaders[1].key && json.ip >= arr[3].min_score){
                                res.distinction = dis[4];
                        }
                        else if (json.ip == leaders[2].key && json.ip >= arr[3].min_score){
                                res.distinction = dis[3];
                        }
                        else {
                                i = Math.min(l-1,9);
                                if (json.ip >= leaders[i].key && json.ip >= arr[5].min_score){
                                        res.distinction = dis[2];
                                }
                                else{
                                        i = Math.min(l-1, 19);
                                        if (json.ip >= leaders[i].key && json.ip >= arr[4].min_score){
                                                res.distinction = dis[1];
                                        }
                                        else {
                                                i = Math.min(l-1, 99);
                                                if (json.ip >= leaders[i].key && json.ip >= arr[3].min_score) {
                                                        res.distinction = dis[0];
                                                }
                                        }
                                }
                        }
                        onEnd(res);
                }); 
        });
        
        // retrieve a user's achievements
        olives.handlers.set("GetAchievements", function(json, onEnd){
                // start by fecthing the user document
                var userCDB = new CouchDBDocument(), // user doc
                    userIdeasCDB = new CouchDBView(), // all public ideas crafted by user
                    ssCDB = new CouchDBView(), // all single sessions completed by user
                    msCDB = new CouchDBView(), // all multi-user sessions initiated by user
                    questionsCDB = new CouchDBView(), // all twoquestions asked by user
                    userRewards = new CouchDBDocument(), // user rewards doc
                    achievementsCDB = new CouchDBDocument(), // all achievements available
                    user = {},
                    achievements = {},
                    result = [],
                    update = false,
                    now = new Date(),
                    date = [now.getFullYear(), now.getMonth(), now.getDate()];
                    
                getDocAsAdmin(json.userid, userCDB).then(function(){
                        // set user
                        user = JSON.parse(userCDB.toJSON());
                        // get user rewards document
                        return getDocAsAdmin(json.userid+"_rewards", userRewards);
                })
                .then(function(){
                        // get achievements and retrieve the appropriate language
                        return getDocAsAdmin("ACHIEVEMENTS", achievementsCDB);
                })
                .then(function(){
                        achievements = achievementsCDB.get(json.lang);
                        // check completed achievements
                        //1. profile complete
                        if (user.profile_complete) {
                                if (!userRewards.get("profilecomplete")){
                                        user.ip += achievements.profilecomplete.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.profilecomplete});
                                        userRewards.set("profilecomplete", 1);
                                        update = true;
                                }
                                result.push(achievements.profilecomplete);
                        }
                        //2. tutorial complete
                        if (user.tutorial_complete){
                                if (!userRewards.get("tutorialcomplete")){
                                        user.ip += achievements.tutorialcomplete.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.tutorialcomplete});
                                        userRewards.set("tutorialcomplete", 1);
                                        update = true;
                                }
                                result.push(achievements.tutorialcomplete);
                        }
                        //3. use as character
                        if (user.settings.useascharacter){
                                if (!userRewards.get("playthegame")){
                                        user.ip += achievements.playthegame.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.playthegame});
                                        userRewards.set("playthegame", 1);
                                        update = true;
                                }
                                result.push(achievements.playthegame);
                        }//Check user ideas (public ones)
                        return getViewAsAdmin("achievements", "publicideas", {key: '"'+json.userid+'"'}, userIdeasCDB);
                })
                .then(function(){
                        var idea_count = userIdeasCDB.getNbItems();
                        // update user doc if needed
                        if (user.ideas_count !== idea_count){
                                user.ideas_count = idea_count;
                                update = true;        
                        }
                                                
                        //4, 5, 6, 7. If user has published at least 5, 25, 100, 250 ideas
                        [5, 25, 100, 250].forEach(function(val){
                                if (idea_count >= val){
                                        if (!userRewards.get("ideas"+val)){
                                                user.ip += achievements["ideas"+val].reward;
                                                user.news.unshift({type: "RWD", date: date, content: achievements["ideas"+val]});
                                                userRewards.set("ideas"+val, 1);
                                                update = true;
                                        }
                                        result.push(achievements["ideas"+val]);
                                }        
                        });
                        // Check for hall of fame ideas
                        userIdeasCDB.loop(function(v,i){
                                var rating, vlength;
                                if (v.votes) {vlength = v.votes.length;}
                                //8. 100 votes and minimum grade of 3.5
                                if (vlength >= 100){
                                        rating = Math.round(v.votes.reduce(function(x,y){return x+y;})/vlength*100)/100;
                                        if (rating >= 3.5){
                                                if (!userRewards.get("bronzeacorn")){
                                                        user.ip += achievements.bronzeacorn.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.bronzeacorn});
                                                        userRewards.set("bronzeacorn", 1);
                                                                update = true;
                                                }
                                                result.push(achievements.bronzeacorn);        
                                        } 
                                        //9. 500 votes and minimum grade of 4
                                        if (vlength >= 500 && rating >= 4){
                                                if (!userRewards.get("silveracorn")){
                                                        user.ip += achievements.silveracorn.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.silveracorn});
                                                        userRewards.set("silveracorn", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.silveracorn);        
                                        }     
                                        //10. 1000 votes and minimum grade of 4.5
                                        if (vlength >= 1000 && rating >= 4.5){
                                                if (!userRewards.get("goldenacorn")){
                                                        user.ip += achievements.goldenacorn.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.goldenacorn});
                                                        userRewards.set("goldenacorn", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.goldenacorn);        
                                        }     
                                }
                        });
                        // check session achievements
                        return getViewAsAdmin("achievements", "singlesessions", {key: '"'+json.userid+'"'}, ssCDB);
                })
                .then(function(){
                        var ss_count = ssCDB.getNbItems();
                        // update user doc if needed
                        if (user.su_sessions_count !== ss_count){
                                user.su_sessions_count = ss_count;
                                update = true;
                        }
                        //11. If user has completed at least 5 single user sessions
                        if (ss_count >= 5){
                                if (!userRewards.get("easybrainstormer")){
                                        user.ip += achievements.easybrainstormer.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.easybrainstormer});
                                        userRewards.set("easybrainstormer", 1);
                                        update = true;
                                }
                                result.push(achievements.easybrainstormer);
                                //12. If user has completed at least 20 single user sessions
                                if (ss_count >= 20){
                                        if (!userRewards.get("mindstormer")){
                                                user.ip += achievements.mindstormer.reward;
                                                user.news.unshift({type: "RWD", date: date, content: achievements.mindstormer});
                                                userRewards.set("mindstormer", 1);
                                                update = true;
                                        }
                                        result.push(achievements.mindstormer);
                                        //13. If user has completed at least 50 single user sessions
                                        if (ss_count >= 50){
                                                if (!userRewards.get("mastermindstormer")){
                                                        user.ip += achievements.mastermindstormer.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.mastermindstormer});
                                                        userRewards.set("mastermindstormer", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.mastermindstormer);
                                        }
                                }
                        }
                       // do the same with multi-user sessions
                       return getViewAsAdmin("achievements", "multisessions", {key: '"'+json.userid+'"'}, msCDB);
                })
                .then(function(){
                        var ms_count = msCDB.getNbItems();
                        // update user doc if needed
                        if (user.mu_sessions_count !== ms_count){
                                user.mu_sessions_count = ms_count;
                                update = true;
                        }
                        //14. If user has initiated and completed at least 5 multi user sessions
                        if (ms_count >= 5){
                                if (!userRewards.get("guide")){
                                        user.ip += achievements.guide.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.guide});
                                        userRewards.set("guide", 1);
                                        update = true;
                                }
                                result.push(achievements.guide);
                                //15. If user has initiated and completed at least 10 multi user sessions
                                if (ms_count >= 10){
                                        if (!userRewards.get("leader")){
                                                user.ip += achievements.leader.reward;
                                                user.news.unshift({type: "RWD", date: date, content: achievements.leader});
                                                userRewards.set("leader", 1);
                                                update = true;
                                        }
                                        result.push(achievements.leader);
                                        //16. If user has initiated and completed at least 25 multi user sessions
                                        if (ms_count >= 25){
                                                if (!userRewards.get("mindweaver")){
                                                        user.ip += achievements.mindweaver.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.mindweaver});
                                                        userRewards.set("mindweaver", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.mindweaver);
                                        }
                                }
                        }                               
                        // check twoquestions achievements
                        return getViewAsAdmin("achievements", "twoquestions", {key: '"'+json.userid+'"'}, questionsCDB);
                })
                .then(function(){
                        var tq_count = questionsCDB.getNbItems();
                         // update user doc if needed
                        if (user.twoquestions_count !== tq_count){
                                user.twoquestions_count = tq_count;
                                update = true;
                        }
                        //17. If user has asked at least 5 twoquestions
                        if (tq_count >= 5){
                                if (!userRewards.get("curious")){
                                        user.ip += achievements.curious.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.curious});
                                        userRewards.set("curious", 1);
                                        update = true;
                                }
                                result.push(achievements.curious);
                                //18. If user has asked at least 15 twoquestions
                                if (tq_count >= 15){
                                        if (!userRewards.get("puzzled")){
                                                user.ip += achievements.puzzled.reward;
                                                user.news.unshift({type: "RWD", date: date, content: achievements.puzzled});
                                                userRewards.set("puzzled", 1);
                                                update = true;
                                        }
                                        result.push(achievements.puzzled);
                                        //19. If user has asked at least 50 twoquestions
                                        if (tq_count >= 50){
                                                if (!userRewards.get("whyarewehere")){
                                                        user.ip += achievements.whyarewehere.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.whyarewehere});
                                                        userRewards.set("whyarewehere", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.whyarewehere);
                                        }
                                }
                        }
                        // finally check user document for twocent counts
                        //20. If user has posted at least 10 twocents
                        if (user.twocents_count >= 10){
                                if (!userRewards.get("opinionator")){
                                        user.ip += achievements.opinionator.reward;
                                        user.news.unshift({type: "RWD", date: date, content: achievements.opinionator});
                                        userRewards.set("opinionator", 1);
                                        update = true;
                                }
                                result.push(achievements.opinionator);
                                //21. If user has posted at least 100 twocents
                                if (user.twocents_count >= 100){
                                        if (!userRewards.get("feedbackartist")){
                                                user.ip += achievements.feedbackartist.reward;
                                                user.news.unshift({type: "RWD", date: date, content: achievements.feedbackartist});
                                                userRewards.set("feedbackartist", 1);
                                                update = true;
                                        }
                                        result.push(achievements.feedbackartist);
                                       //22. If user has posted at least 1000 twocents
                                        if (user.twocents_count >= 1000){
                                                if (!userRewards.get("chatterbox")){
                                                        user.ip += achievements.chatterbox.reward;
                                                        user.news.unshift({type: "RWD", date: date, content: achievements.chatterbox});
                                                        userRewards.set("chatterbox", 1);
                                                        update = true;
                                                }
                                                result.push(achievements.chatterbox);
                                                //23. If user has posted at least 5000 twocents
                                                if (user.twocents_count >= 5000){
                                                        if (!userRewards.get("allday")){
                                                                user.ip += achievements.allday.reward;
                                                                user.news.unshift({type: "RWD", date: date, content: achievements.allday});
                                                                userRewards.set("allday", 1);
                                                                update = true;
                                                        }
                                                        result.push(achievements.allday);
                                                }
                                        }
                                }
                        }
                        if (update){
                                // update user rewards documents
                                updateDocAsAdmin(userRewards.get("_id"), userRewards)
                                .then(function(){
                                        // update user doc (score and news) if necessary
                                        return getDocAsAdmin(json.userid, userCDB);
                                })
                                .then(function(){
                                        userCDB.set("ip", user.ip);
                                        userCDB.set("ideas_count", user.ideas_count);
                                        userCDB.set("su_sessions_count", user.su_sessions_count);
                                        userCDB.set("mu_sessions_count", user.mu_sessions_count);
                                        userCDB.set("twoquestions_count", user.twoquestions_count);
                                        userCDB.set("news", user.news);
                                        userCDB.set("achievements", result);
                                        return updateDocAsAdmin(json.userid, userCDB);
                                })
                                .then(function(){
                                        onEnd(result);
                                });
                        } 
                        else {onEnd(result);}      
                });      
        });
        
        // Checking email recipient list
        olives.handlers.set("GetUserNames", function(json, onEnd) {

                var result = {}, list = json.list, options = {}, req, callback;

                /**
                 * Building a temporary solution before changes in couchDBStore (one bulk query of the view)
                 */

                // manually build the http request to couchDB
                options.hostname = "127.0.0.1";
                options.port = 5984;
                options.method = "POST";
                options.auth = cdbAdminCredentials;
                options.path = "/"+_db+"/_design/users/_view/short";
                options.headers = {
                        "Content-Type" : "application/json"
                };
                options.data = JSON.stringify({
                        keys : list
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
                                if (JSON.parse(body).rows.length === list.length){
                                        result = JSON.parse(body).rows;
                                        onEnd(result);
                                }
                                else {
                                        onEnd({error: "Error : one or more users not found in Ideafy"});
                                }
                        });
                };
                // emit the http request and the data
                req = http.request(options, callback);
                req.end(options.data, "utf8");
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

                if (type === "invite") {
                        // set mail parameters
                        mailOptions.to = json.recipient;
                        mailOptions.subject = json.sender + " invites you to join the Ideafy community";
                        mailOptions.html = "<p style='background: whitesmoke; font-family=helvetica; font-size=24px; text-align=justify;'><b>Take advantage of this invitation! Get Ideafy now and join the fast growing online community of Ideafans. Compete for best idea, best mind and many other exciting challenges. Give your imagination and your ideas a new life.</b></p><p><a href='https://itunes.apple.com/us/app/ideafy/id605681593?mt=8&uo=4' target='itunes_store'style='display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/htmlResources/assets/images/web/linkmaker/badge_appstore-lrg.png) no-repeat;width:135px;height:40px;@media only screen{background-image:url(http://linkmaker.itunes.apple.com/htmlResources/assets/images/web/linkmaker/badge_appstore-lrg.svg);}'></p>";
                }
                
                if (type === "doc") {
                        // set mail parameters
                        mailOptions.to = json.recipient;
                        mailOptions.cc = json.cc;
                        mailOptions.replyTo = json.replyTo;
                        mailOptions.subject = json.subject;
                        mailOptions.html = "<p><b>"+json.header+"</b></p><p>"+json.body+"</p><p>----------<br>"+ json.signature +"<div>"+json.attachHeader + json.attachBody+"</div>";
                        
                }
                
                if (type === "message"){
                        console.log("exporting message");                
                }
                
                if (type === "contact"){
                        console.log("exporting contact");        
                }
                
                smtpTransport.sendMail(mailOptions, function(error, response) {
                        if (error) {
                                console.log(error, response);
                                onEnd({
                                        sendmail : "error",
                                        reason : error,
                                        response : response
                                });
                        } 
                        else {
                                onEnd({
                                        sendmail : "ok",
                                        recipient : json.recipient
                                });
                        }
                });
        });
        
        // Checking email recipient list
        olives.handlers.set("CheckRecipientList", function(json, onEnd) {

                var result = {}, list = json.list, options = {}, req, callback;

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
                        keys : list
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
                                if (JSON.parse(body).rows.length === list.length){
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
        
        // Ideafy messaging system
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
                        var cdb = new CouchDBDocument();
                        getDocAsAdmin(userid, cdb)
                        .then(function() {
                                var arr = [], empty = false;
                                // retrieve notifications array
                                if (cdb.get("notifications")[0]){arr = cdb.get("notifications");}
                                
                                // add message
                                arr.unshift(msg);
                                
                                // update store and upload
                                cdb.set("notifications", arr);
                                
                                return updateDocAsAdmin(userid, cdb);
                        })
                        .then(function() {
                                sendResults.alter("push", {
                                        res : "ok",
                                        id : userid
                                });
                        });
                },
                /**
                 * A function to add message to sender's document in couchDB
                 * @param {Object} msg the message to deliver
                 */
                addMessageToSent = function(msg){
                        var cdb = new CouchDBDocument();
                        getDocAsAdmin(msg.author, cdb)
                        .then(function(){
                                var arr = cdb.get("sentMessages")||[];
                                arr.unshift(msg);
                                cdb.set('sentMessages', arr);
                                return updateDocAsAdmin(msg.author, cdb);
                        });
                },
                /*
                 * A function to insert contact in a user's connection list when a request was accepted
                 */
                insertContact = function(userid, contact, onEnd){
                        var cdb = new CouchDBDocument(), contacts = [], pos=0, news =[];
                        getDocAsAdmin(userid, cdb)
                        .then(function(){
                                var i;
                                contacts = cdb.get("connections");
                                news = cdb.get("news") || [];
                                for (i=0,l=contacts.length;i<l;i++){
                                        // check if contact is of type user or group first
                                        if (contacts[i].type === "user"){
                                                if (contacts[i].lastname < contact.lastname) {pos++;} 
                                                if (contacts[i].lastname === contact.lastname){
                                                        if (contacts[i].firstname < contact.firstname) {pos++;} 
                                                }
                                        }
                                        else {
                                                if (contacts[i].username < contact.lastname)  {pos++;}
                                        }  
                                }
                                contacts.splice(pos, 0, contact);
                                if (contact.type === "user") {
                                        news.unshift({"type": "CX+", "date": json.date, "content": {userid:json.author, username:contact.username}});
                                }
                                cdb.set("connections", contacts);
                                cdb.set("news", news);
                                return updateDocAsAdmin(userid, cdb);
                        })
                        .then(function(){
                                onEnd("ok");
                        });
                },
                /*
                 * A function to remove a contact in a user's connection list when a cancel request is sent
                 */
                removeContact = function(userid, contact, onEnd){
                        var cdb = new CouchDBDocument(), contacts = [], pos=0, news =[];
                        getDocAsAdmin(userid, cdb)
                        .then(function(){
                                var i,j, grp;
                                contacts = cdb.get("connections");
                                news = cdb.get("news") || [];
                                for (i=contacts.length-1;i>=0;i--){
                                        // check if contact is of type user or group first
                                        if (contacts[i].type === "user"){
                                                if (contacts[i].userid === contact.userid) {contacts.splice(i,1);}
                                        }
                                        else if ((contacts[i].type === "group")){
                                                grp = contacts[i].contacts;
                                                for (j=grp.length-1;j>=0; j--){
                                                        if (grp.userid === contact.userid) {grp.splice(j,1);}
                                                }
                                        } 
                                }
                                if (contact.type === "user") {
                                        news.unshift({"type": "CX-", "date": json.date, "content": {userid:contact.userid, username:contact.username}});
                                }
                                cdb.set("connections", contacts);
                                cdb.set("news", news);
                                return updateDocAsAdmin(userid, cdb);
                        })
                        .then(function(){
                                onEnd("ok");
                        });
                };
                
                 
                // add specificities depending on message type
                if (json.type === "CXR") {
                        message.contactInfo = json.contactInfo;
                }
                
                if (json.type === "DOC") {
                        message.docId = json.docId;
                        message.docType = json.docType;
                        message.docTitle = json.docTitle;
                }
                
                if (json.type === "2Q+") {
                        message.docId = json.docId;
                        message.docType = json.type;
                }
                
                if (json.type === "INV") {
                        message.docId = json.docId;
                        message.docTitle = json.docTitle;
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
                                                        updateUserIP(json.dest[0], "CXR", 25, function(result){console.log(result);});
                                                        updateUserIP(json.author, "CXR", 25, function(result){
                                                                onEnd(sendResults.toJSON());
                                                        });
                                                }
                                         });
                                }
                                else if (json.type === "CXCancel"){
                                        removeContact(json.dest[0], json.contactInfo, function(result){
                                                if (result){
                                                        // add to both users' score
                                                        updateUserIP(json.dest[0], "CXC", -25, function(result){console.log(result);});
                                                        updateUserIP(json.author, "CXC", -25, function(result){
                                                                onEnd(sendResults.toJSON());
                                                        });
                                                }        
                                        });
                                }
                                else {onEnd(sendResults.toJSON());}
                        }
                });
        });
        
        // Invite a user to join Ideafy
        olives.handlers.set("Invite", function(json, onEnd){
                var mailOptions = {
                        from : "IDEAFY <ideafy@taiaut.com>", // sender address
                        to : json.id, // list of receivers
                        cc : json.senderid, // automatic copy to sender
                        replyTo : "", // recipient should reply to sender
                        subject : json.sendername + " invites you to join the Ideafy community",
                        html : json.body
                };
                
                // check if user has already been invited
                checkInvited(json.id, function(result){
                        var cdb = new CouchDBDocument();
                        // if not then create doc in database and send email
                        if (!result){
                                cdb.set("_id", json.id);
                                cdb.set("sender", [json.senderid]);
                                addInvited(json.id, cdb)
                                .then(function(){
                                        smtpTransport.sendMail(mailOptions, function(error, response) {
                                                if (error) {
                                                        console.log(error, response);
                                                        onEnd({
                                                                sendmail : "error",
                                                                reason : error,
                                                                response : response
                                                        });
                                                } 
                                                else {
                                                        onEnd("ok");
                                                }
                                        });        
                                }); 
                        }
                        else{
                                cdb.reset(result);
                                // check if user has already been invited by this sender
                                if (cdb.get("sender").indexOf(json.senderid)>-1){
                                        onEnd("alreadyinvited");
                                }
                                else{
                                        cdb.set("sender", cdb.get("sender").push(json.senderid));
                                        addInvited(json.id, cdb)
                                        .then(function(){
                                                smtpTransport.sendMail(mailOptions, function(error, response) {
                                                        if (error) {
                                                                onEnd({
                                                                        sendmail : "error",
                                                                        reason : error,
                                                                        response : response
                                                                });
                                                        } 
                                                        else {
                                                                onEnd("ok");
                                                        }
                                                });        
                                        });
                                }      
                        }        
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
                                console.log("muidea increment : ", increment);
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
                        }
                        onEnd("ok");
                });        
        });
        
        // Delete attachment from drive
        olives.handlers.set("DeleteAttachment", function(json, onEnd){
                var _path = __dirname+'/attachments/';
                
                switch(json.type){
                        case "card":
                                _path += "cards/";
                                break;
                        default:
                                break
                }
                _path += json.file;
                fs.exists(_path, function(exists){
                        if (exists){
                                // need to delete all files first
                                fs.unlink(_path, function(err){
                                        i(err) ? onEnd(err) : onEnd("ok");
                                }) 
                        }
                        else onEnd("file not found");
                });
                
                        
        });
        
        // Receive support requests -- send mail to contact@taiaut.com
        olives.handlers.set("Support", function(json, onEnd){
                var     date = new Date(json.date),
                        mailOptions = {
                                from : "IDEAFY <ideafy@taiaut.com>", // sender address
                                to : "contact@taiaut.com", // list of receivers
                                replyTo : "", // recipient should reply to sender
                                subject : "Support request from "+json.userid + " "+ date.toDateString(), // Subject line
                                html : "Userid : "+json.userid+"\nDate : " + date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+ " "+date.getHours()+":"+date.getMinutes()+"\n\nRequest :\n"+ json.request // html body
                        };
                        
                smtpTransport.sendMail(mailOptions, function(error, response) {
                        if (error) {
                                onEnd(error);
                        }
                        else {
                                onEnd("ok");
                        }
                });        
        });
        
        

});

process.on('uncaughtException', function(error) {
        console.log(error.stack);
});
