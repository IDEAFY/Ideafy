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
    emily = require("emily"),
    CouchDBTools = require("couchdb-emily-tools"),
    cookie = require("cookie"), 
    RedisStore = require("connect-redis")(connect), 
    nodemailer = require("nodemailer"), 
    st = require("st"),
    sessionStore = new RedisStore({
        hostname : "127.0.0.1",
        port : "6379"
    }),
    srvutils = require("./srvutils.js"),
    apputils = require("./apputils.js"),
    comutils = require("./comutils.js"),
    loginutils = require("./loginutils.js"),
    taskutils = require("./taskutils.js"),
    cdbadmin = require("./cdbadmin.js");
 
var Store = emily.Store,
      Promise = emily.Promise,
      Transport = emily.Transport,
      socketIOTransport = olives.SocketIOTransport.Server,
      CouchDBDocument = CouchDBTools.CouchDBDocument,
      CouchDBView = CouchDBTools.CouchDBView,
      CouchDBUser = CouchDBTools.CouchDBUser,
      CouchDBBulkDocuments = CouchDBTools.CouchDBBulkDocuments,
      srvUtils = new srvutils.SrvUtils(),
      appUtils = new apputils.AppUtils(),
      comUtils = new comutils.ComUtils(),
      loginUtils = new loginutils.LoginUtils(),
      taskUtils = new taskutils.TaskUtils(),
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


/****************************************
 *  APPLICATION CONFIGURATION
 ****************************************/

var _db, _dbIP, _dbPort, cdbAdminCredentials, supportEmail, currentVersion, contentPath, badges;
     
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
currentVersion = "1.2.3";
// Path where attachments are stored
contentPath = __dirname;
// Rules to grant special badges and achievements
badges;


// Mount the static directory to be cached
var mount = st({path: __dirname + '/public/', index: true, index: 'index.html'});

/*****************************
 *  APPLICATION SERVER
 ******************************/

var handlers = new Store(),
      transport = new Transport(handlers),
      app = http.createServer(connect()
                //.use(connect.logger())
                .use(connect.compress())
                .use(connect.responseTime())
                .use(connect.bodyParser({ uploadDir:contentPath+'/upload', keepExtensions: true }))
                .use('/upload', srvUtils.uploadFunc)
                .use('/downloads', srvUtils.downloadFunc)
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
                .use(function(req, res, next) {
                        res.setHeader("Ideady Server", "node.js/" + process.versions.node);
                        res.setHeader("X-Powered-By", "OlivesJS + Connect + Socket.io");
                        next();
                })
                .use(mount)).listen(1664),
      io = socketIO.listen(app, {
                log : true
      });
                
// Socket.io configuration
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 0);                    // reduce logging
io.set("close timeout", 300);
io.set("heartbeat interval", 25);
        
// we need lots of sockets
http.globalAgent.maxSockets = Infinity;
        
// register transport
//olives.registerSocketIO(io);
socketIOTransport(io, handlers);    

CouchDBTools.configuration.sessionStore = sessionStore;
handlers.set("CouchDB", CouchDBTools.handler);
        
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
handlers.set("CheckVersion", srvUtils.checkVersion);
handlers.set("GetFile", srvUtils.getFile);
handlers.set("Lang", srvUtils.getLabels);
handlers.set("GetLanguages", srvUtils.getLanguages);
handlers.set("cleanUpSession", srvUtils.cleanUpSession);
handlers.set("DeleteAttachment", srvUtils.deleteAttachment);
        
// login utilities
loginUtils.setConstructors(CouchDBDocument, CouchDBUser, Promise);
loginUtils.setFunctions(sendSignupEmail, checkInvited, CDBAdmin, comUtils.sendMail);
loginUtils.setVar(cookie, sessionStore, transport, _db, cdbAdminCredentials, supportEmail);
        
handlers.set("Signup", loginUtils.signup);
handlers.set("CheckLogin", loginUtils.checkLogin);
handlers.set("Login", loginUtils.login);
handlers.set("ChangePWD", loginUtils.changePassword);
handlers.set("ResetPWD", loginUtils.resetPassword);
        
// communication utilities (mail and application notifications)
comUtils.setVar(_db, smtpTransport, supportEmail, mailSender, transport, io);
comUtils.setConstructors(CouchDBDocument, CouchDBView, Store);
comUtils.setFunctions(CDBAdmin, checkInvited, addInvited);
handlers.set("SendMail", comUtils.sendMail);
handlers.set("Support", comUtils.support);
handlers.set("Notify", comUtils.notify);
handlers.set("Invite", comUtils.invite);
handlers.set("Presence", comUtils.sendPresenceUpdates);
        
// application utilities and handlers
appUtils.setConstructors(CouchDBDocument, CouchDBView, Promise);
appUtils.setVar(transport, _db, _dbIP, _dbPort, cdbAdminCredentials, badges, contentPath);
appUtils.setCDBAdmin(CDBAdmin);
handlers.set("DeleteDeck", appUtils.deleteDeck);
handlers.set("DeleteCards", appUtils.removeCardsFromDatabase);
handlers.set("ShareDeck", appUtils.shareDeck);
handlers.set("GetEULA", appUtils.getEULA);
handlers.set("GetFavList", appUtils.getFavList);
handlers.set("GetAvatar", appUtils.getAvatar);
handlers.set("GetUserDetails", appUtils.getUserDetails);
handlers.set("GetGrade", appUtils.getGrade);
handlers.set("GetAchievements", appUtils.getAchievements);
handlers.set("GetUserNames", appUtils.getUserNames);
handlers.set("Welcome", appUtils.welcome);
handlers.set("CheckRecipientList", appUtils.checkRecipientList);
handlers.set("Vote", appUtils.vote);
handlers.set("RemoveFromLibrary", appUtils.removeFromLibrary);
handlers.set("WriteTwocent", appUtils.writeTwocent);
handlers.set("SendTwocent", appUtils.sendTwocent);
handlers.set("UpdateUIP", appUtils.updateUIP);
handlers.set("UpdateSessionScore", appUtils.updateSessionScore);
        
// scheduled tasks
taskUtils.setConstructors(CouchDBDocument, CouchDBView, Promise);
taskUtils.setFunctions(CDBAdmin, comUtils);
              
// initialize tasks and presence
taskUtils.initTasks(io);
comUtils.initPresence();
        
// disconnection events
io.sockets.on("connection", function(socket){
    socket.on("disconnect", function(){
            appUtils.setOffline(socket);       
     });  
});

process.on('uncaughtException', function(error) {
        console.log(error.stack);
});
