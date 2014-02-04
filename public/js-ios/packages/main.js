

/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

require(["OObject", "LocalStore", "service/map", "Amy/Stack-plugin", "Bind.plugin", "Amy/Delegate-plugin", "./dock", "./login", "service/config", "service/utils", "Promise"],
        function(Widget, LocalStore, Map, Stack, Model, Event, Dock, Login, Config, Utils, Promise) {
        
        //declaration
        var _body = new Widget(), _login = null, _stack = new Stack({"#login" : _login}), _dock = new Dock(), _local = new LocalStore(), updateLabels = Utils.updateLabels, checkServerStatus = Utils.checkServerStatus, _labels = Config.get("labels"), _db = Config.get("db"), _transport = Config.get("transport"), _user = Config.get("user"), _currentVersion;
        
        _currentVersion = Config.get("version");
        
        //setup
        _body.plugins.addAll({
                "stack" : _stack
        });
        
        //logic
        _body.init = function init(firstStart) {
        
        // add dock UI to the stack
        _stack.getStack().add("#dock", _dock);
        // check db
        if (_local.get("db") && _local.get("db") !== _db){
        _db = _local.get("db");
        }
        // synchronize user document
        _user.sync(_db, _local.get("currentLogin"))
        .then(function() {
              var lblUpdate = new Promise();
              // set uid for future queries
              Config.set("uid", '"' + _user.get("_id") + '"');
              // check user defined language
              if (_user.get("lang") !== Config.get("lang")) {
              updateLabels(_user.get("lang")).then(function(){
                                                   lblUpdate.fulfill();
                                                   });
              }
              else {lblUpdate.fulfill();}
              return lblUpdate;
              })
        .then(function(){
              var loadAvatar = new Promise();
              // get user avatar and labels if necessary
              if (_user.get("picture_file").search("img/avatars/deedee")>-1){
                        Config.set("avatar", _user.get("picture_file"));
                        loadAvatar.fulfill();
              }
              else if (_local.get("userAvatar")){
                        Config.set("avatar", _local.get("userAvatar"));
                        loadAvatar.fulfill();
              }
              else{
                        _transport.request("GetFile", {dir: "avatars", "filename":_user.get("_id")+"_@v@t@r"}, function(result){
                                 if (!result.error) {
                                        Config.set("avatar", result);
                                 }
                                 else {
                                        console.log(result.error);
                                        Config.set("avatar", "img/avatars/deedee1.png");
                                 }
                                loadAvatar.fulfill();
                        });
              }
              return loadAvatar;
              })
        .then(function(){
              _dock.init();
              _login.stopSpinner();
              _stack.getStack().show("#dock");
              _dock.start(firstStart);
              });
        };
        
        _body.reload = function reload(firstStart) {
        _user.unsync();
        _user.reset();
        
        // synchronize user document
        _user.sync(_db, _local.get("currentLogin"))
        .then(function() {
              var lblUpdate = new Promise();
              // set uid for future queries
              Config.set("uid", '"' + _user.get("_id") + '"');
              // check user defined language
              if (_user.get("lang") !== Config.get("lang")) {
              updateLabels(_user.get("lang")).then(function(){
                                                   lblUpdate.fulfill();
                                                   });
              }
              else {lblUpdate.fulfill();}
              return lblUpdate;
              })
        .then(function(){
              var loadAvatar = new Promise();
              // get user avatar and labels if necessary
              if (_user.get("picture_file").search("img/avatars/deedee")>-1){
              Config.set("avatar", _user.get("picture_file"));
              loadAvatar.fulfill();
              }
              else if (_local.get("userAvatar")){
              Config.set("avatar", _local.get("userAvatar"));
              loadAvatar.fulfill();
              }
              else{
              _transport.request("GetFile", {dir: "avatars", "filename":_user.get("_id")+"_@v@t@r"}, function(result){
                                 if (!result.error) {
                                 Config.set("avatar", result);
                                 }
                                 else {
                                 console.log(result.error);
                                 Config.set("avatar", "img/avatars/deedee1.png");
                                 }
                                 loadAvatar.fulfill();
                                 });
              }
              return loadAvatar;
              })
        .then(function(){
              _dock.reset();
              _login.stopSpinner();
              _stack.getStack().show("#dock");
              _dock.start(firstStart);
              });
        };
        
        _body.alive(Map.get("body"));
        
        // INITIALIZATION
        
        // retrieve local data
        _local.sync("ideafy-data");
        _login = new Login(_body.init, _body.reload, _local);
        _stack.getStack().show("#login");
        _stack.getStack().setCurrentScreen(_login);
        _login.init();
        
        // check connection
        if (navigator.connection && navigator.connection.type === "none"){
                // get labels or assign default ones
                (_local.get("labels")) ? _labels.reset(_local.get("labels")) : _labels.reset(Config.get("defaultLabels"));
                Config.set("lang", _labels.set("language"));
                _login.setScreen("#nointernet");
        }
        else {
                checkServerStatus()
                .then(function(){
              
                        // initialize labels to device language if available or US by default
                        if (_local.get("labels")) {
                                _labels.reset(_local.get("labels"));
                                Config.set("lang", _labels.get("language"));
                        }
                        else{
                                updateLabels(navigator.language);
                        }
              
                        // check client version
                        _transport.request("CheckVersion", {version: _currentVersion}, function(result){
                                 var msg = _labels.get("outdated") || "Please update your application";
                                 if (result === "outdated"){
                                        alert(msg);
                                 }
                        });
              
                        var current = _local.get("currentLogin") || "";
              
                        // if the last user is in the local storage show login if not display signup screen
                        if (!current) {
                                //display signup
                                _login.setScreen("#signup-screen");
                        }
                        else {
                        _transport.request("CheckLogin", {"id" : current, "sock" : Config.get("socket").socket.sessionid}, function(result) {
                                        if (result.authenticated) {_body.init();}
                                        else {
                                                _login.setScreen("#login-screen");
                                        }
                        });
              }
              }, function(error){
                        (_local.get("labels")) ? _labels.reset(_local.get("labels")) : _labels.reset(Config.get("defaultLabels"));
                        _login.setScreen("#maintenance-screen");
              });
        }
        
        /*
         * Watch for signout events
         */
        Config.get("observer").watch("signout", function(){
                // change user status
                _user.set("online", false);
                _user.set("sock", "");
                _user.upload();
                                     
                // clear local store
                 _local.set("currentLogin", "");
                 _local.set("userAvatar", "");
                _local.sync("ideafy-data");
                                     
                _stack.getStack().add("#login", _login);
                _login.reset(true);
                _stack.getStack().show("#login");
                _stack.getStack().setCurrentScreen(_login);
                _login.setScreen("#login-screen");
                document.getElementById("cache").classList.remove("appear");
        });
        
        /*
         * Manage socket connectivity
         */
        document.addEventListener("pause", Utils.disconnectSocket, false);
        document.addEventListener("resume", Utils.checkSocketStatus, false);
        
        // attempt to reconnect socket if required in case of user actions
        Map.get("body").addEventListener("touchstart", Utils.checkSocketStatus, false);
        
        // resync user document upon socket reconnection
        Config.get("observer").watch("reconnect", function(option){
                _local.sync("ideafy-data");
                if (navigator.connection && navigator.connection.type === "none"){
                        _login.setScreen("#nointernet");
                }
                else {
                        if (option === "all"){
                                checkServerStatus()
                                .then(function(){
                                        _user.unsync();
                                        return _user.sync(_db, _local.get("currentLogin"));
                                }, function(){
                                           _login.setScreen("#maintenance-screen");
                                })
                                .then(function(){
                                        _user.set("online", true);
                                        _user.set("sock", Config.get("socket").socket.sessionid);
                                        return _user.upload();
                                });
                        }
                        else{
                                _user.set("online", true);
                                _user.set("sock", Config.get("socket").socket.sessionid);
                                return _user.upload();
                        }
                }
        });
});