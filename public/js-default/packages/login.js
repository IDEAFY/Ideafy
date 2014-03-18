/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject" ,"Amy/Stack-plugin", 
        "service/map", "Event.plugin", "service/config", "Bind.plugin", "Store", "lib/spin.min", "Promise", "CouchDBDocument", "service/confirm"],
        function(Widget, Stack, Map, Event, Config, Model, Store, Spinner, Promise, CouchDBDocument, Confirm){
                return function LoginConstructor($init, $reload, $local){
                //declaration
                        var _login = new Widget(),
                            _loginForm = new Widget(),
                            _signupForm = new Widget(),
                            _loading = new Widget(),
                            _serverdown = new Widget(),
                            _internetdown = new Widget(),
                            _stack = new Stack(),
                            _store = new Store({
                                        "email" : "",
                                        "firstname" : "",
                                        "lastname" : "",
                                        "confirm-password" : "",
                                        "password" : "",
                                        "error" : "",
                                        "reset" : false
                             }),
                             _labels = Config.get("labels"),
                             _transport = Config.get("transport"),
                             _db = Config.get("db"),
                             spinner,
                             loginSpinner = new Spinner({color:"#657B99", lines:10, length: 10, width: 8, radius:15, top: 270}).spin(),
                             reload = false,  // boolean to differentiate between initial start and usbsequent logout/login
                             ConfirmUI,
                             _EULA;
                
                //setup && UI DEFINITIONS               
                         _login.plugins.addAll({
                                "loginstack" : _stack
                        });
                        
                        
                        // loading UI
                        _loading.plugins.add("label", new Model(_labels));
                        _loading.template = '<div id="loading"><p data-label="bind: innerHTML, loadingmessage"></p><div id="loadingspin"></div></div>';
                        _loading.place(document.getElementById("loading"));
                        
                        // maintenance UI
                        _serverdown.plugins.add("label", new Model(_labels));
                        _serverdown.template = '<div id="serverdown"><p data-label="bind: innerHTML, maintenancemessage"></p><div id="loadingspin"></div></div>';
                        
                        // no connection UI
                        _internetdown.plugins.add("label", new Model(_labels));
                        _internetdown.template = '<div id="nointernt"><p data-label="bind: innerHTML, nointernet"></p><div id="loadingspin"></div></div>';
                        
                        // signup form
                        _signupForm.plugins.addAll({
                                "label": new Model(_labels),
                                "loginmodel" : new Model(_store),
                                "signupevent" : new Event(_signupForm)
                        });
                        
                        _signupForm.template = '<form id="signup-form"><p class="login-fields"><input name="email" data-loginmodel="bind:value,email" data-label="bind:placeholder, emailplaceholder" type="text" data-signupevent="listen: input, resetError"><input name="password" data-loginmodel="bind:value,password" type="password" data-label="bind:placeholder, passwordplaceholder" data-signupevent="listen: input, resetError"><input name="confirm-password" data-loginmodel="bind:value,confirm-password" type="password" data-label="bind:placeholder, repeatpasswordplaceholder" data-signupevent="listen: input, resetError"><input name="firstname" data-loginmodel="bind:value,firstname" type="text" data-label="bind:placeholder, firstnameplaceholder" data-signupevent="listen: input, resetError"><input name="lastname" data-loginmodel="bind:value,lastname" type="text" data-label="bind:placeholder, lastnameplaceholder" data-signupevent="listen:input, resetError; listen:keypress, entersignup"></p><p><label data-loginmodel="bind:innerHTML,error" class="login-error"></label></p><p><label id="signup" class="login-button pressed-btn" data-label="bind:innerHTML, signupbutton" data-signupevent="listen: mousedown, press; listen: mouseup, release; listen:mouseup, signup"></label></p><p><label class="login-button pressed-btn" name="#login-screen" data-signupevent="listen: mousedown, press; listen:mouseup, release; listen: mouseup, showLogin" data-label="bind:innerHTML, loginbutton"></label></p></form>';
                        
                        _signupForm.press = function(event, node){
                                node.focus();
                                node.classList.add("pressed");        
                        };
                        
                        _signupForm.release = function(event, node){
                                node.classList.remove("pressed");        
                        };
                        
                        _signupForm.entersignup = function(event, node){
                                if (event.keyCode === 13){
                                        event.target.blur();
                                        _signupForm.signup();        
                                }        
                        };
                        
                        _signupForm.showLogin = function(event, node){
                                _login.reset();
                                _stack.getStack().show("#login-screen");
                        };
                        
                        _signupForm.resetError = function(event, node){
                                var name = node.getAttribute("name"),
                                       btn = _signupForm.dom.querySelector("#signup");
                                _store.set("error", "");
                                _store.set(name, node.value);
                               
                                if (_store.get("email") && _store.get("password") && _store.get("confirm-password") && _store.get("firstname") && _store.get("lastname")){
                                        btn.classList.add("btn-ready");
                                }
                                else{
                                        btn.classList.remove("btn-ready");
                                }     
                        };
                        
                        _signupForm.getEULA = function(){
                                _transport.request("GetEULA", {}, function(result){
                                        var _eula = JSON.parse(result),
                                              lang = _labels.get("language"), 
                                              translation;
                                        if (_eula.translations) translation = _eula.translations[lang];
                                        if (translation){
                                                _EULA = "<h4>" + translation.title + "</h4></div>" + translation.body + "</div>";
                                        }
                                        else _EULA = "<h4>" + _eula.title + "</h4></div>" + _eula.body + "</div>";
                                        
                                        _labels.watchValue("language", function(val){
                                                translation = _eula.translations[val];
                                                if (translation){
                                                _EULA = "<h4>" + translation.title + "</h4></div>" + translation.body + "</div>";
                                                }
                                                else _EULA = "<h4>" + _eula.title + "</h4></div>" + _eula.body + "</div>";        
                                        });
                                                        
                                });
                        };
                        
                        _signupForm.showEULA = function(event, node){
                                if (!ConfirmUI){
                                        ConfirmUI = new Confirm(_signupForm.dom, _EULA, _signupForm.completeSignup, "EULA");
                                }
                               ConfirmUI.show();   
                        };
                        
                        _signupForm.completeSignup = function(accept){
                                var fn = _store.get("firstname"),
                                      ln = _store.get("lastname"),
                                      userid = _store.get("email").toLowerCase(),
                                      promise = new Promise(),
                                      user = new CouchDBDocument();
                                
                                if (accept){
                                        ConfirmUI.hide();
                                        loginSpinner.spin(_signupForm.dom);
                                                        _transport.request("Signup", {name : userid, password : password, fn : fn, ln: ln, lang: Config.get("lang")}, function(result) {
                                                                if (result.signup === "ok") {
                                                                        // create user
                                                                        user.reset(Config.get("userTemplate"));
                                                                        user.set("firstname", fn);
                                                                        user.set("lastname", ln);
                                                                        user.set("username", fn + " " + ln);
                                                        
                                                                        // add lang
                                                                        user.set("lang", Config.get("lang"));
                                                                        
                                                                        // add welcome notification
                                                                        var now = new Date();
                                                                        
                                                                        user.set("regdate", [now.getFullYear(), now.getMonth(), now.getDate()]);
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
                                                                        _transport.request("Welcome", {userid:userid, language:user.get("lang")}, function(result){return result;});

                                                                        // get database info
                                                                        if (result.db){
                                                                                $local.set("db", result.db);
                                                                        }
                                                                        
                                                                        // set online status and socket info
                                                                        user.set("online", true);
                                                                        user.set("sock", Config.get("socket").socket.sessionid);

                                                                        // upload to database
                                                                        user.setTransport(_transport);
                                                                        user.sync(result.db, userid)
                                                                        .then(function(){
                                                                                return user.upload();
                                                                        })
                                                                        .then(function(){
                                                                                $local.set("currentLogin", userid);
                                                                                $local.set("userAvatar", user.get("picture_file"));
                                                                                $local.sync("ideafy-data");
                                                                                Config.set("uid", '"' + userid + '"');
                                                                                user.unsync();
                                                                                (reload)? $reload(true) : $init(true);
                                                                        });
                                                                }
                                                                else {
                                                                        _store.set("error", "error : " + result.message);
                                                                        _store.set("email", "");
                                                                        loginSpinner.stop();
                                                                }
                                                        }, this);
                                }
                                else{
                                        ConfirmUI.hide();
                                        _store.set("error", _labels.get("EULArejected"));
                                }      
                        };
                        
                        _signupForm.signup = function signup(event, node){
                                var email = _store.get("email"),
                                      fn = _store.get("firstname"),
                                      ln = _store.get("lastname"),
                                    password = _store.get("password"),
                                    pwdConfirm = _store.get("confirm-password");
                                node.classList.remove("btn-ready");
                                // handle form errors
                                if (email === "") {
                                        _store.set("error", _labels.get("signupmissingemail"));
                                }
                                else if (password === "") {
                                        _store.set("error", _labels.get("signupmissingpwd"));
                                }
                                else if (pwdConfirm === "") {
                                        _store.set("error", _labels.get("signupmissingpwdok"));
                                }
                                else if (fn === "") {
                                        _store.set("error", _labels.get("signupmissingfn"));
                                }
                                else if (ln === "") {
                                        _store.set("error", _labels.get("signupmissingln"));
                                }
                                else {

                                        // check if email address is valid -- in the future an activation mechanism should be envisioned to screen fake addresses
                                        var userid = email.toLowerCase(), emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

                                        if (!emailPattern.test(userid)) {
                                                _store.set("error", _labels.get("signupinvalidemail"));
                                        }
                                        else {
                                        // check if passwords match
                                                if (password !== pwdConfirm) {
                                                        _store.set("error", _labels.get("signuppwdnomatch"));
                                                }
                                                else {
                                                        _signupForm.showEULA();
                                                // NO MISTAKES -- PROCEED TO SIGNUP
                                                        
                                                }
                                        }
                                }
                        };
                        
                        // login form
                        _loginForm.plugins.addAll({
                                "label": new Model(_labels),
                                "loginmodel" : new Model(_store,{
                                        forgotpwd : function(reset){
                                                (reset) ? this.classList.remove("loginvisible") : this.classList.add("loginvisible");
                                        }
                                }),
                                "loginevent" : new Event(_loginForm)
                        });
                        
                        _loginForm.template = '<form id="login-form"><p class="login-fields"><input name="email" data-loginmodel="bind:value,email" autofocus="autofocus" data-label="bind:placeholder, emailplaceholder" type="text" data-loginevent="listen:input, resetError"><input name="password" data-loginmodel="bind:value,password" type="password" data-label="bind:placeholder, passwordplaceholder" data-loginevent="listen: input, resetError; listen:keypress, enterlogin"></p><p><label class="login-button pressed-btn" data-label="bind: innerHTML, loginbutton" data-loginevent="listen:mousedown, press; listen: mouseup, release; listen:mouseup, login"></label></p><p class="login-error"><label data-loginmodel="bind:innerHTML,error" class="login-error"></label><label class="forgotpwd" data-loginmodel="bind:forgotpwd,reset" data-label="bind:innerHTML, forgotpwd"  data-loginevent="listen:mousedown, press; listen:mouseup, release; listen:mouseup, resetPassword">Forgot your password?</label></p><p><label id="signup-button" class="pressed-btn" name="#signup-screen" data-label="bind: innerHTML, newuserbutton" data-loginevent="listen: mousedown, press; listen:mouseup, release; listen: mouseup, showSignup"></label></p></form>';
                        
                        _loginForm.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _loginForm.release = function(event, node){
                                node.classList.remove("pressed");        
                        };
                        
                        _loginForm.enterlogin = function(event, node){
                                if (event.keyCode === 13){
                                        event.target.blur();
                                        _loginForm.login();        
                                }        
                        };
                        
                        _loginForm.showSignup = function(event, node){
                                _login.reset();
                                _stack.getStack().show("#signup-screen");
                        };
                        
                        _loginForm.resetError = function(event, node){
                                var name = node.getAttribute("name"),
                                      btn = _loginForm.dom.querySelector(".login-button");
                                _store.set("error", "");
                                _store.set("reset", false);
                                _store.set(name, node.value);
                                if (_store.get("email") && _store.get("password")){
                                        btn.classList.add("btn-ready");
                                }
                                else btn.classList.remove("btn-ready");      
                        };
                        
                        _loginForm.login = function login(event, node){
                                var email = _store.get("email").toLowerCase(), password = _store.get("password"), el = node || _loginForm.dom.querySelector(".login-button");

                                if (email && password) {
                                        loginSpinner.spin(_loginForm.dom);
                                        _transport.request("Login", {name : email, password : password, sock : Config.get("socket").socket.sessionid}, function(result) {
                                                if (result.login === "ok") {
                                                        Config.set("uid", '"' + email + '"');
                                                        // check if there is a new db
                                                        if (result.db){
                                                                $local.set("db", result.db);
                                                        }
                                                        $local.set("currentLogin", email);
                                                        _transport.request("GetAvatar", {id: email}, function(result){
                                                                if (!result.error) {
                                                                        $local.set("userAvatar", result);
                                                                        $local.sync("ideafy-data");
                                                                        // add to Config
                                                                        Config.set("avatar", result);
                                                                }
                                                                (reload)? $reload() : $init();
                                                        });
                                                }
                                                else {
                                                        _store.set("error", _labels.get("invalidlogin"));
                                                        _store.set("reset", true);
                                                        loginSpinner.stop();
                                                }
                                        });
                                }
                                else _store.set("error", _labels.get("invalidlogin"));   
                                el.classList.remove("btn-ready");     
                        };
                        
                        _loginForm.resetPassword = function(event, node){
                                var login = _store.get("email").toLowerCase();
                                _transport.request("ResetPWD", {user:login}, function(result){
                                        if (result === "ok"){
                                                _store.set("error", _labels.get("temppwd")+login);
                                        }
                                        else if (result.rst){
                                                _store.set("error",_labels.get("failedpwdreset")+"<a href='mailto:"+result.contact+"?Subject=Password%20support%20"+login+"'>"+_labels.get("support")+"</a>");
                                        }
                                        else {
                                                console.log(result);
                                                _store.set("error", _labels.get("somethingwrong"));
                                        }
                                });      
                        };

                        // ADDING ALL UIS TO STACK
                        _stack.getStack().add("#login-screen", _loginForm);
                        _stack.getStack().add("#signup-screen", _signupForm);
                        _stack.getStack().add("#loading-screen", _loading);
                        _stack.getStack().add("#maintenance-screen", _serverdown);
                        _stack.getStack().add("#nointernet", _internetdown);
                        
                        _login.alive(Map.get("login"));
                        
                        // Initialization
                        _login.init = function init(){
                                // display loading screen and initialize spinner
                               _stack.getStack().show("#loading-screen");
                               spinner = new Spinner({color:"#9AC9CD", lines:10, length: 20, width: 8, radius:15}).spin(document.getElementById("loadingspin"));
                         };
                        
                        _login.setScreen = function setScreen(target){
                                _stack.getStack().show(target);
                                if (target === "#signup-screen"){
                                        // retrieve EULA from DB
                                        _signupForm.getEULA();        
                                }
                        };
                        
                        _login.reset = function reset(signout){
                                _store.reset({
                                        "email" : "",
                                        "firstname" : "",
                                        "lastname" : "",
                                        "confirm-password" : "",
                                        "password" : "",
                                        "error" : "",
                                        "reset" : false
                                });
                                if (signout){ reload = true;}
                        };
                        
                        _login.stopSpinner = function stopSpinner(){
                                loginSpinner && loginSpinner.stop(); 
                                spinner && spinner.stop();       
                        };
                
                //return
                return _login;
                };
        }
);