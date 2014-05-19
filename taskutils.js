/**
 * IDEAFY -- tasks utilities
 * ===============================
 * 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2014 IDEAFY
 * 
 */

function TaskUtils(){
       var _CouchDBDocument, _CouchDBView, Promise,
            _updateUserIP, _updateDocAsAdmin, _getDocAsAdmin, _createDocAsAdmin, _getViewAsAdmin, _removeDocAsAdmin, _getBulkView,
            _sendMail, _notify,
            _io;
        
        this.setConstructors = function(CouchDBDocument, CouchDBView, Promise){
                _CouchDBDocument = CouchDBDocument;
                _CouchDBView = CouchDBView;
                _Promise = Promise;
        };
        
        this.setFunctions = function(cdbAdmin, comUtils){
                _updateUserIP = cdbAdmin.updateUserIP;
                _updateDocAsAdmin = cdbAdmin.updateDoc;
                _getDocAsAdmin = cdbAdmin.getDoc;
                _createDocAsAdmin = cdbAdmin.createDoc;
                _getViewAsAdmin = cdbAdmin.getView;
                _getBulkView = cdbAdmin.getBulkView;
                _removeDocAsAdmin = cdbAdmin.removeDoc;
                _sendMail = comUtils.sendMail;
                _notify = comUtils.notify;     
        };
        
        this.initTasks = function(io){
                _io = io;
                
                this.checkConnections();
                
                this.checkSessions();
        };
        
        /*
         * Check active sockets against users marked as online in the database
         * Solve discrepancies if any
         */
        this.checkConnections = function checkConnections(){
                var checkSockets = function(){
                        var cdbSocks = new _CouchDBView(),
                              nb = Object.keys(_io.connected).length,
                              list = Object.keys(_io.connected);
                        _getViewAsAdmin("users", "sockets", null, cdbSocks)
                        .then(function(){
                                if (cdbSocks.getNbItems()) cdbSocks.loop(function(v,i){
                                        var cdb = new _CouchDBDocument();
                                        if (list.indexOf(v.key) <0){
                                                _getDocAsAdmin(v.id, cdb)
                                                .then(function(){
                                                        if (cdb.get("online")){
                                                                cdb.set("online", false);
                                                        }
                                                        cdb.set("sock", null);
                                                        _updateDocAsAdmin(v.id, cdb);        
                                                });
                                        }
                                        else{
                                                _getDocAsAdmin(v.id, cdb)
                                                .then(function(){
                                                        if (!cdb.get("online")){
                                                                cdb.set("online", true);
                                                                _updateDocAsAdmin(v.id, cdb);
                                                        }  
                                                });        
                                        }       
                                });
                        });       
                };
                setInterval(checkSockets, 15000);
        };
        
        /*
         * Session management
         * Manage notifications for scheduled sessions
         * Delete sessions if they are over 1hour past the scheduled time
         */
        this.checkSessions = function checkSessions(){
                var deleteExpiredSessions = function(){
                                var now = new Date().getTime(),
                                      start = 1325404800000, // 01/01/2012,
                                      end = now - (3600000), // one hour ago
                                      query = {startkey:start, endkey:end, descending: false},
                                      sessions = new _CouchDBView();
                                
                                _getViewAsAdmin("scheduler", "cleanupSessions", query, sessions)     
                                .then(function(){
                                        // for each session -- set status to deleted
                                        // upload then remove chat document
                                        // remove session document
                                        if (sessions.getNbItems()){
                                                sessions.loop(function(v,i){
                                                        var session = new _CouchDBDocument(),
                                                                chatId,
                                                                chatDoc = new _CouchDBDocument();
                                                              
                                                        _getDocAsAdmin(v.id, session)
                                                        .then(function(){
                                                                session.set("status", "deleted");
                                                                chatId = session.get("chat")[0];
                                                                
                                                                _updateDocAsAdmin(v.id, session)
                                                                .then(function(){
                                                                        return _removeDocAsAdmin(session.get("_id"), session);
                                                                });
                                                                
                                                                _getDocAsAdmin(chatId, chatDoc)
                                                                .then(function(){
                                                                        return _removeDocAsAdmin(chatId, chatDoc);        
                                                                });
                                                        });
                                                });
                                        }
                                });    
                      },
                      notifySessions = function(){
                                var cdbView = new _CouchDBView(),
                                      now = new Date().getTime(),
                                      query  = {startkey:[], endkey:[], descending: false};
                                      
                                 // build query
                                 query.startkey = '['+ now +',8]';
                                 query.endkey = '['+ (now+24*3600*1000) +',8]';
                                 _getViewAsAdmin("scheduler", "notif", query, cdbView)
                                 .then(function(res){
                                        console.log(cdbView.toJSON());
                                        cdbView.loop(function(v, i){
                                                var session, now, date ;
                                                
                                                if (!v.value.day){
                                                        session = new _CouchDBDocument();
                                                        _getDocAsAdmin(v.id, session)
                                                        .then(function(){
                                                                var leader = session.get("initiator").id,
                                                                      parts = session.get("participants"),
                                                                      dest = [leader],
                                                                      now = new Date(),
                                                                      date = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()],
                                                                      json = {
                                                                                "type" : "MUD-",
                                                                                "status" : "unread",
                                                                                "date" : date,
                                                                                "author" : "IDEAFY",
                                                                                "username" : "Ideafy",
                                                                                "firstname" : "",
                                                                                "toList" : "",
                                                                                "ccList" : "",
                                                                                "object" : "",
                                                                                "body" : "",
                                                                                "signature" : "",
                                                                                "docId" : v.id,
                                                                                "docTitle" : session.get("title"),
                                                                                "scheduled" : session.get("scheduled")
                                                                        };
                                                                
                                                                for (i=0; i<parts.length; i++){
                                                                        dest.push(parst[i].id);
                                                                }
                                                                
                                                                json.dest = dest;
                                                                
                                                                _notify(json, function(result){
                                                                        if (result){
                                                                                console.log(result);
                                                                                var notif = session.get("notif") || {};
                                                                                notif.day = true;
                                                                                session.set("notif", notif);
                                                                                return _updateDocAsAdmin(session.get('_id'), session);
                                                                        }        
                                                                });
                                                        });
                                                }   
                                        });
                                });  
                      },
                      manageSessions = function(){
                                
                                // fetch scheduled sessions from database (status waiting and scheduled not null)
                                _getViewAsAdmin("scheduler", "sessions", null, sessions)
                                .then(function(){
                        
                                        // notify initiator and participants of sessions about to start (<5min)
                                        
                                        // notify initiator and participants of sessions starting in one hour
                                        
                                        // notify initiator and participants of sessions starting the next day
                                        
                                });
                       };
                      
                setInterval(deleteExpiredSessions, 900000);
                setInterval(notifySessions, 60000);
        };
};

exports.TaskUtils = TaskUtils;
