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
/*
var smtpTransport = nodemailer.createTransport("SMTP", {
        // mail sent by Ideafy,
        host: "10.224.1.168",
        secureConnection : false,
        port : 587,
        auth : {
                user : "ideafy",
                pass : fs.readFileSync(".password", "utf8").trim()
        }
				//port: 25
});
*/

var smtpTransport = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: {
                user: "vincent@ideafy.com",
                pass: "$Nor&Vin2014"
        }
});

/****************************************
 *  APPLICATION CONFIGURATION
 ****************************************/

var sessionStore, _db, _dbIP, _dbPort, cdbAdminCredentials, supportEmail, currentVersion, contentPath, badges;
// redis connection
sessionStore = new RedisStore({
	hostname : "127.0.0.1",
	port : "6379"
});     
// Name and IP address of the application database
_db = "ideafy";
_dbIP = "10.224.7.243";
_dbPort = 5984;
// Database admin login
cdbAdminCredentials = "admin:innovation4U";
// mail sender & address
mailSender = "IDEAFY <app@ideafy.com>";
// email address fro application support
supportEmail = "contact@ideafy.com";
// Application  client minimum version
currentVersion = "1.2.2";
// Path where attachments are stored
contentPath = "/shared";
// Rules to grant special badges and achievements
badges;


/*****************************
 *  APPLICATION SERVER
 ******************************/

CouchDBTools.requirejs(["CouchDBUser", "Transport", "CouchDBDocument", "CouchDBView", "CouchDBBulkDocuments", "Store", "Promise"], function(CouchDBUser, Transport, CouchDBDocument, CouchDBView, CouchDBBulkDocuments, Store, Promise) {
        var transport = new Transport(olives.handlers),
            app = http.createServer(connect()
                .use(connect.logger())
								.use(connect.responseTime())
                .use(redirect())
                .use(connect.bodyParser({ uploadDir:contentPath+'/public/upload', keepExtensions: true }))
                .use('/upload', srvUtils.uploadFunc)      
                .use(function(req, res, next) {
												var ori = req.headers.origin || "http://app.ideafy.com";
												res.setHeader("Access-Control-Allow-Origin", ori);
  											res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
												res.setHeader("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE,OPTIONS');
                        res.setHeader("Ideady Server", "node.js/" + process.versions.node);
                        res.setHeader("X-Powered-By", "OlivesJS + Connect + Socket.io");
												if ('OPTIONS' == req.method) {
    												res.send(200);
  											}
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
                .use(connect.static(__dirname + "/public"))).listen(3113),
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
        loginUtils.setConstructors(CouchDBDocument, CouchDBUser, Promise);
        loginUtils.setFunctions(sendSignupEmail, checkInvited, CDBAdmin, comUtils.sendMail);
        loginUtils.setVar(cookie, sessionStore, transport, _db, cdbAdminCredentials, supportEmail);
        
        olives.handlers.set("Signup", loginUtils.signup);
        olives.handlers.set("CheckLogin", loginUtils.checkLogin);
        olives.handlers.set("Login", loginUtils.login);
        olives.handlers.set("ChangePWD", loginUtils.changePassword);
        olives.handlers.set("ResetPWD", loginUtils.resetPassword);
        
        // communication utilities (mail and application notifications)
        comUtils.setVar(smtpTransport, supportEmail, mailSender);
        comUtils.setConstructors(CouchDBDocument, Store);
        comUtils.setFunctions(CDBAdmin, checkInvited, addInvited);
        olives.handlers.set("SendMail", comUtils.sendMail);
        olives.handlers.set("Support", comUtils.support);
        olives.handlers.set("Notify", comUtils.notify);
        olives.handlers.set("Invite", comUtils.invite);
        
        // application utilities and handlers
        appUtils.setConstructors(CouchDBDocument, CouchDBView, Promise);
        appUtils.setVar(transport, _db, _dbIP, _dbPort, cdbAdminCredentials, badges, contentPath);
        appUtils.setCDBAdmin(CDBAdmin);
        olives.handlers.set("DeleteDeck", appUtils.deleteDeck);
        olives.handlers.set("DeleteCards", appUtils.removeCardsFromDatabase);
        olives.handlers.set("ShareDeck", appUtils.shareDeck);
        olives.handlers.set("GetEULA", appUtils.getEULA);
        olives.handlers.set("GetFavList", appUtils.getFavList);
        olives.handlers.set("GetAvatar", appUtils.getAvatar);
        olives.handlers.set("GetUserDetails", appUtils.getUserDetails);
        olives.handlers.set("GetGrade", appUtils.getGrade);
        olives.handlers.set("GetAchievements", appUtils.getAchievements);
        olives.handlers.set("GetUserNames", appUtils.getUserNames);
        olives.handlers.set("Welcome", appUtils.welcome);
        olives.handlers.set("CheckRecipientList", appUtils.checkRecipientList);
        olives.handlers.set("Vote", appUtils.vote);
        olives.handlers.set("RemoveFromLibrary", appUtils.removeFromLibrary);
        olives.handlers.set("WriteTwocent", appUtils.writeTwocent);
        olives.handlers.set("SendTwocent", appUtils.sendTwocent);
        olives.handlers.set("UpdateUIP", appUtils.updateUIP);
        olives.handlers.set("UpdateSessionScore", appUtils.updateSessionScore);
        
        // disconnection events
        io.sockets.on("connection", function(socket){
                socket.on("disconnect", function(){
                        appUtils.setOffline(socket);       
                });  
        });       
});

process.on('uncaughtException', function(error) {
        console.log(error.stack);
});
