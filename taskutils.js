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
                                cdbSocks.loop(function(v,i){
                                        var cdb = new _CouchDBDocument();
                                        if (list.indexOf(v.key) <0){
                                                _getDocAsAdmin(v.id, cdb)
                                                .then(function(){
                                                        if (cdb.get("online")){
                                                                cdb.set("online", false);
                                                                _updateDocAsAdmin(v.id, cdb);
                                                        }        
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
                setInterval(checkSockets, 5000);
        };
        
        /*
         * Session management
         * Manage notifications for scheduled sessions
         * Delete sessions if they are over 1hour past the scheduled time
         */
        this.checkSessions = function checkSessions(){
                var sessions = new _CouchDBView(),
                      deleteExpiredSessions = function(){
                                var now = new Date().getTime();
                                sessions.loop(function(v,i){
                                        var cdb = new _CouchDBDocument();
                                        if (v.value.status === 'waiting' && ((now - v.key) > 3600000)){
                                                _getDocAsAdmin(v.id, cdb)
                                                .then(function(){
                                                        return _removeDocAsAdmin(v.id, cdb);
                                                });
                                        }
                                });    
                      },
                      manageSessions = function(){
                                sessions.reset([]);
                                 
                                // fetch scheduled sessions from database (status waiting and scheduled not null)
                                _getViewAsAdmin("scheduler", "sessions", null, sessions)
                                .then(function(){
                        
                                        // delete expired sessions from database, ie scheduled sessions that have not been started on time by initiator
                                        deleteExpiredSessions();
                                        
                                        // notify initiator and participants of sessions about to start (<5min)
                                        
                                        // notify initiator and participants of sessions starting in one hour
                                        
                                        // notify initiator and participants of sessions starting the next day
                                        
                                });
                       };
                      
                setInterval(manageSessions, 30000);
        };
};

exports.TaskUtils = TaskUtils;
