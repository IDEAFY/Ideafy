/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("./libs/olives"),
       emily = require("./libs/emily"),
       amy = require("./libs/amy2"),
       Widget = olives.OObject,
       LocalStore = olives.LocalStore,
       Promise = emily.Promise,
       Stack = amy.StackPlugin,
       Model = olives["Bind.plugin"],
       Place = olives["Place.plugin"],
       Event = amy.DelegatePlugin,
       Dock = require("./packages/dock"),
       Login = require("./packages/login"),
       Config = require("./services/config"),
       Map = require("./services/map"),
       Utils = require("./services/utils"),
       Confirm = require("./services/confirm"),
       CouchDBChanges = require("./libs/CouchDBTools").CouchDBChanges;


(function(){
        
        'use strict';
        //declaration
        var   body = new Widget(),
                stack = new Stack({}),
                dock = new Dock(),
                login,
                local = new LocalStore(),
                updateLabels = Utils.updateLabels,
                checkServerStatus = Utils.checkServerStatus, 
                labels = Config.get("labels"), 
                db = Config.get("db"), 
                transport = Config.get("transport"),
                user = Config.get("user"),
                currentVersion = Config.get("version");

        // SETUP

        // init logic
        body.startDock = function startDock(firstStart){
                document.getElementById("main").classList.add("main");
                stack.getStack().show("#dock");
                dock.start(firstStart);         
        };
        
        body.init = function init(firstStart) {
                // add dock UI to the stack
                stack.getStack().add("#dock", dock);
                // check db
                if (local.get("db") && local.get("db") !== db){
                        db = local.get("db");
                }
                
                // init CouchDB change API
                CouchDBChanges.setTransport(transport);
                CouchDBChanges.initStream(db);
                
                // synchronize user document
                user.sync(db, local.get("currentLogin"))
                .then(function() {
                        var lblUpdate = new Promise();
                        // set uid for future queries
                        Config.set("uid", '"' + user.get("_id") + '"');
                        // check user defined language
                        if (user.get("lang") !== Config.get("lang")) {
                                updateLabels(user.get("lang")).then(function(){
                                        lblUpdate.fulfill();
                                });
                        }
                        else {lblUpdate.fulfill();}
                        return lblUpdate;
                })
                .then(function(){
                        var loadAvatar = new Promise();
                        // get user avatar and labels if necessary
                        if (user.get("picture_file").search("img/avatars/deedee")>-1){
                                Config.set("avatar", user.get("picture_file"));
                                loadAvatar.fulfill();
                        }
                        else if (local.get("userAvatar")){
                                Config.set("avatar", local.get("userAvatar"));
                                loadAvatar.fulfill();
                        }
                        else{
                                transport.request("GetFile", {dir: "avatars", "filename":user.get("_id")+"_@v@t@r"}, function(result){
                                        if (!result.error) {
                                                Config.set("avatar", result);
                                        }
                                        else {
                                                Config.set("avatar", "img/avatars/deedee1.png");
                                        }
                                        loadAvatar.fulfill();
                                });
                        }
                        return loadAvatar;
                })
                .then(function(){
                        dock.init();
                        login.stopSpinner();
                        body.startDock(firstStart);
                });      
        };
        
        // init after exit and re-entry
        body.reload = function reload(firstStart) {
                user.unsync();
                user.reset();
                
                // init CouchDB change API
                CouchDBChanges.setTransport(transport);
                CouchDBChanges.initStream(db);
                
                // synchronize user document
                user.sync(db, local.get("currentLogin"))
                .then(function() {
                        var lblUpdate = new Promise();
                        // set uid for future queries
                        Config.set("uid", '"' + user.get("_id") + '"');
                        // check user defined language
                        if (user.get("lang") !== Config.get("lang")) {
                                updateLabels(user.get("lang")).then(function(){
                                        lblUpdate.fulfill();
                                });
                        }
                        else {lblUpdate.fulfill();}
                        return lblUpdate;
                })
                .then(function(){
                        var loadAvatar = new Promise();
                        // get user avatar and labels if necessary
                        if (user.get("picture_file").search("img/avatars/deedee")>-1){
                                Config.set("avatar", user.get("picture_file"));
                                loadAvatar.fulfill();
                        }
                        else if (local.get("userAvatar")){
                                Config.set("avatar", local.get("userAvatar"));
                                loadAvatar.fulfill();
                        }
                        else{
                                transport.request("GetFile", {dir: "avatars", "filename":user.get("_id")+"_@v@t@r"}, function(result){
                                        if (!result.error){
                                                Config.set("avatar", result);
                                        }
                                        else {
                                                Config.set("avatar", "img/avatars/deedee1.png");
                                        }
                                        loadAvatar.fulfill();
                                });         
                        }
                        return loadAvatar;
                })
                .then(function(){
                        dock.reset();
                        login.stopSpinner();
                        body.startDock(firstStart);        
                });      
        };
       
        // uis declaration
        dock = new Dock();
        login = new Login(body.init, body.reload, local);
        
        // add login to the stack
        stack.getStack().add("#login", login);
        
        // Widget definition
        body.seam.addAll({
                "stack" : stack,
                "place": new Place({confirm: Confirm})
        });
        
        body.template = '<div id="main"><div data-stack="destination"></div><div data-place="place:confirm"></div></div>';
        
        body.place(document.body);
        
        // INITIALIZATION
        
        // retrieve local data
        local.sync("ideafy-data");
        
        // stop apploading
        document.getElementById("apploading").classList.add("invisible");
        
        // display login screen
        stack.getStack().show("#login");
        stack.getStack().setCurrentScreen(login);
        
        login.init();
        
        // check connection
        if (navigator.connection && navigator.connection.type === "none"){
                // get labels or assign default ones
                (local.get("labels")) ? labels.reset(local.get("labels")) : labels.reset(Config.get("defaultLabels"));
                Config.set("lang", labels.set("language"));
                login.setScreen("#nointernet");
        }
        else {
                checkServerStatus()
                .then(function(){
                        // initialize labels to device language if available or US by default
                        if (local.get("labels")) {
                                labels.reset(local.get("labels"));
                                Config.set("lang", labels.get("language"));
                        }
                        else{
                                updateLabels(navigator.language);
                        }
                        
                        // check client version
                        transport.request("CheckVersion", {version: currentVersion}, function(result){
                                var msg = labels.get("outdated") || "Please update your application";
                                if (result === "outdated"){
                                        alert(msg);
                                }        
                        });

                        var current = local.get("currentLogin") || "";
                
                        // if the last user is in the local storage show login if not display signup screen
                        if (!current) {
                                //display signup
                                login.setScreen("#signup-screen");
                        }
                        else {
                                transport.request("CheckLogin", {"id" : current, "sock" : Config.get("socket").socket.sessionid}, function(result) {
                                        if (result.authenticated) {body.init();}
                                        else {
                                                login.setScreen("#login-screen");
                                        }
                                });
                        }
                }, function(error){
                        (local.get("labels")) ? labels.reset(local.get("labels")) : labels.reset(Config.get("defaultLabels"));
                        login.setScreen("#maintenance-screen");
                });
        }
         
        /*
        * Watch for signout events
        */       
        Config.get("observer").watch("signout", function(){
        
                // disconnect socket (will change presence status)
                Config.get("socket").disconnect();
                // clear local store
                local.set("currentLogin", "");
                local.set("userAvatar", "");
                local.sync("ideafy-data");
                
                // reset login UI
                stack.getStack().add("#login", login);
                login.reset(true);
                
                // hide dock and cache
                body.dom.classList.remove("main");
                document.getElementById("cache").classList.remove("appear");
                
                // show loogin screen
                stack.getStack().show("#login");
                stack.getStack().setCurrentScreen(login);
                login.setScreen("#login-screen");
        });
        
        // attempt to reconnect socket if required in case of user actions
        Map.get("body").addEventListener("mousedown", Utils.checkSocketStatus, false);
        
        // resync user document upon socket reconnection
        Config.get("observer").watch("reconnect", function(option){
                local.sync("ideafy-data");
                if (option === "all"){
                        checkServerStatus()
                        .then(function(){
                                user.unsync();
                                CouchDBChanges.initStream(db);
                                return user.sync(db, local.get("currentLogin"));
                        }, function(){
                                login.setScreen("#maintenance-screen");        
                        })
                        .then(function(){
                                user.set("online", true);
                                user.set("sock", Config.get("socket").socket.sessionid);
                                return user.upload();
                        });
                }
                else{
                        user.set("online", true);
                        user.set("sock", Config.get("socket").socket.sessionid);
                        return user.upload();
                }              
        });
})();