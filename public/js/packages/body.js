/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

require(["Olives/OObject", "Olives/LocalStore", "Store", "service/map", "Amy/Stack-plugin", "Olives/Model-plugin", "Amy/Delegate-plugin", "./dock", "./login", "service/config", "CouchDBStore", "service/utils", "Promise"], 
    function(Widget, LocalStore, Store, Map, Stack, Model, Event, Dock, Login, Config, CouchDBStore, Utils, Promise) {

        //declaration
        var _body = new Widget(), _login = null, _stack = new Stack({
                "#login" : _login
        }), _dock = new Dock(), _local = new LocalStore(), _store = new Store({
                "email" : "",
                "firstname" : "",
                "lastname" : "",
                "confirm-password" : "",
                "password" : "",
                "error" : ""
        }), updateLabels = Utils.updateLabels, checkServerStatus = Utils.checkServerStatus, _labels = Config.get("labels"), _db = Config.get("db"), _transport = Config.get("transport"), _user = Config.get("user"), _domLogin = document.getElementById("login-form"), _domSignup = document.getElementById("signup-form");

        //setup
        _body.plugins.addAll({
                "event" : new Event(_body),
                "loginmodel" : new Model(_store),
                "label" : new Model(_labels),
                "stack" : _stack
        });

        _body.alive(Map.get("body"));
        _login = new Login();
        
        if (navigator.connection && navigator.connection.type === "none"){
                (_local.get("labels")) ? _labels.reset(_local.get("labels")) : _labels.reset(Config.get("defaultLabels"));
                _login.setScreen("#nointernet");
                _stack.getStack().setCurrentScreen(_login);
                document.getElementById("nointernet").classList.remove("invisible");
                        
        }
        else{
        // display loading screen
        _login.setScreen("#loading-screen");
        _stack.getStack().setCurrentScreen(_login);
        document.getElementById("loading").classList.remove("invisible");
                
        // retrieve local data
        _local.sync("ideafy-data");
        
        checkServerStatus().then(function(result){
        
                //reset labels (temporary to allow updates)
                //_local.set("labels", "");
        
                // initialize labels to device language if available or US by default
                (_local.get("labels")) ? _labels.reset(_local.get("labels")) : updateLabels(navigator.language);

                // remove invisible class
                _domSignup.classList.remove("invisible");
                _domLogin.classList.remove("invisible");
                _login.setScreen("#loading-screen");

                var current = _local.get("currentLogin");
                
                // if the last user is in the local storage
                if (!current) {
                        //display login
                        _login.setScreen("#signup-screen");
                } else {
                        _transport.request("CheckLogin", {
                                "id" : current
                        }, function(result) {
                                if (result.authenticated) _body.init()
                                else {
                                        _login.setScreen("#login-screen");
                                }
                        });
                }

                _stack.getStack().add("#dock", _dock);
                
        }, function(error){
                (_local.get("labels")) ? _labels.reset(_local.get("labels")) : _labels.reset(Config.get("defaultLabels"));
                _login.setScreen("#maintenance-screen");
                document.getElementById("serverdown").classList.remove("invisible");
                _stack.getStack().setCurrentScreen(_login);
        });
        }

        //logic

        _body.login = function() {
                var email = _store.get("email").toLowerCase(), password = _store.get("password");

                if (email && password) {
                        _transport.request("Login", {
                                name : email,
                                password : password
                        }, function(result) {
                                if (result.login === "ok") {
                                        Config.set("uid", '"' + email + '"');
                                        // check if there is a new db
                                        if (result.db){
                                                Config.set("db", result.db);
                                        }
                                        _local.set("currentLogin", email);
                                        _transport.request("GetAvatar", {id: email}, function(result){
                                                if (!result.error) {
                                                        _local.set("userAvatar", result);
                                                        _local.sync("ideafy-data");
                                                        // add to Config
                                                        Config.set("avatar", result);
                                                }
                                                _local.sync("ideafy-data");
                                                _body.init();
                                        });
                                } else {
                                        _store.set("error", _labels.get("invalidlogin"));
                                }
                        });
                }
        };

        _body.signup = function() {
                var email = _store.get("email"),
                    password = _store.get("password"),
                    pwdConfirm = _store.get("confirm-password"),
                    fn = _store.get("firstname"),
                    ln = _store.get("lastname"),
                    promise = new Promise(),
                    user = new CouchDBStore();

                if (email === "") {
                        _store.set("error", _labels.get("signupmissingemail"));
                } else if (password === "") {
                        _store.set("error", _labels.get("signupmissingpwd"));
                } else if (pwdConfirm === "") {
                        _store.set("error", _labels.get("signupmissingpwdok"));
                } else if (fn === "") {
                        _store.set("error", _labels.get("signupmissingfn"));
                } else if (ln === "") {
                        _store.set("error", _labels.get("signupmissingln"));
                } else {

                        // check if email address is valid -- in the future an activation mechanism should be envisioned to screen fake addresses
                        var userid = email.toLowerCase(), emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

                        if (!emailPattern.test(userid)) {
                                _store.set("error", _labels.get("signupinvalidemail"));
                        } else {
                                // check if passwords match
                                if (password !== pwdConfirm) {
                                        _store.set("error", _labels.get("signuppwdnomatch"));
                                } else {
                                        _transport.request("Signup", {
                                                name : userid,
                                                password : password,
                                                lang : Config.get("language")
                                        }, function(result) {
                                                if (result.signup === "ok") {
                                                        
                                                        _login.setScreen("#loading-screen");
                                                        
                                                        // create user
                                                        user.reset(Config.get("userTemplate"));
                                                        user.set("fistname", fn);
                                                        user.set("lastname", ln);
                                                        user.set("username", fn + " " + ln);
                                                        
                                                        // add lang
                                                        user.set("lang", Config.get("language"));
                                                        
                                                        // add welcome notification
                                                        var now = new Date();

                                                        user.set("notifications", [{
                                                                "type" : "MSG",
                                                                "toList": fn + " " + ln,
                                                                "date" : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()],
                                                                "object" : _labels.get("signupwelcomeobject"),
                                                                "status" : "unread",
                                                                "author" : "IDEAFY",
                                                                "firstname": "DeeDee",
                                                                "signature": "-- Ideas made easy!",
                                                                "username" : "Ideafy",
                                                                "body" : _labels.get("signupwelcomebody")
                                                        }]);
                                                        
                                                        // add welcome contents
                                                        _transport.request("Welcome", {userid:userid, language:user.get("lang")}, function(result){console.log(result);});

                                                        // get database info
                                                        if (result.db){
                                                                Config.set("db", result.db);
                                                        }

                                                        // upload to database
                                                        user.setTransport(_transport);

                                                        user.sync(result.db, userid);
                                                        setTimeout(function(){
                                                                user.upload();
                                                                _local.set("currentLogin", userid);
                                                                _local.set("userAvatar", user.get("picture_file"));
                                                                _local.sync("ideafy-data");
                                                                Config.set("uid", '"' + userid + '"');
                                                                promise.resolve();
                                                                }, 250);
                                                                
                                                         promise.then(function(){
                                                                 user.unsync();
                                                                 setTimeout(function(){_body.init(true);}, 250);
                                                         });

                                                } else {
                                                        _store.set("error", "error : " + result.message);
                                                        _store.set("email", "");
                                                }
                                        }, this);
                                }

                        }

                }
        };

        _body.resetError = function(event, node) {
                _store.set("error", "");
        };
        
        _body.enterlogin = function(event, node){
                if (event.keyCode === 13){
                        event.target.blur();
                        _body.login();        
                }        
        };
        
        _body.entersignup = function(event, node){
                if (event.keyCode === 13){
                        event.target.blur();
                        _body.signup();        
                }        
        };
        
        _body.press = function(event){
                event.target.classList.add("pressed");
        };
        
        _body.release = function(event){
                event.target.classList.remove("pressed");        
        };
        
        _body.forceLandscape = function(event, node){
                var scaleX = 1004/1024, scaleY = 768/748;
                if (window.orientation === 90 || window.orientation === -90){
                   node.setAttribute("style", "-webkit-transform-origin:0;-webkit-transform:0;");               
               } 
               else {                   
                   if ( window.orientation > 0) { //clockwise
                     node.setAttribute("style", "-webkit-transform-origin: 384px 374px; -webkit-transform:rotate(-90deg) scale("+scaleX+","+scaleY+"); -webkit-transition: all 1s ease-in-out;");
                   }
                   else {
                     node.setAttribute("style", "-webkit-transform-origin:384px 374px;-webkit-transform:rotate(90deg) scale("+scaleX+","+scaleY+"); -webkit-transition: all 0.25s ease-in-out;");
                   }
               }    
        };
        
        _body.init = function(firstStart) {
                _user.sync(_db, _local.get("currentLogin")).then(function() {
                        var lblUpdate = false;
                        // set uid for future queries
                        Config.set("uid", '"' + _user.get("_id") + '"');
                        // check user defined language
                        if (_user.get("lang") !== Config.get("lang")) {
                                lblUpdate = true;
                        }
                         // get user avatar and labels if necessary
                         if (lblUpdate && _user.get("picture_file").search("img/avatars/deedee")>-1){
                                Config.set("avatar", _user.get("picture_file"));
                                updateLabels(_user.get("lang")).then(function(){
                                        lblUpdate = false;
                                        _dock.init();
                                        //if everything is downloaded
                                        _stack.getStack().show("#dock");      
                                }); 
                         }
                         else if (_user.get("picture_file").search("img/avatars/deedee")>-1){
                                Config.set("avatar", _user.get("picture_file"));
                                _dock.init(firstStart);
                                //if everything is downloaded
                                _stack.getStack().show("#dock");
                        }
                        // if avatar is customized no need to wait for labels download (shorter than avatar file)
                        else{
                                if (lblUpdate) updateLabels(_user.get("lang")).then(function(){lblUpdate = false;});
                                _transport.request("GetFile", {sid: "avatars", "filename":_user.get("_id")+"_@v@t@r"}, function(result){
                                        if (!result.error) {
                                                Config.set("avatar", result);
                                                _dock.init(firstStart);
                                                //if everything is downloaded
                                                _stack.getStack().show("#dock");
                                        }
                                });
                        }
                });
                
                Config.watchValue("uid", function(uid){
                        // handle signout
                        if (uid === ""){              
                        }   
                });
        };

}); 