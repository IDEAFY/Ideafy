/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject" ,"Amy/Stack-plugin", 
	"service/map", "Event.plugin", "service/config", "Bind.plugin", "Store", "lib/spin.min", "Promise", "CouchDBStore"],
	function(Widget, Stack, Map, Event, Config, Model, Store, Spinner, Promise, CouchDBStore){
		return function LoginConstructor($init, $local){
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
                                        "error" : ""
                             }),
                             _labels = Config.get("labels"),
                             _transport = Config.get("transport"),
                             _db = Config.get("db"),
			     spinner;
		
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
                        
                        _signupForm.template = '<form id="signup-form"><p class="login-fields"><input data-loginmodel="bind:value,email" data-label="bind:placeholder, emailplaceholder" type="text" data-signupevent="listen: keypress, resetError"><input data-loginmodel="bind:value,password" type="password" data-label="bind:placeholder, passwordplaceholder" data-signupevent="listen: keypress, resetError"><input data-loginmodel="bind:value,confirm-password" type="password" data-label="bind:placeholder, repeatpasswordplaceholder" data-signupevent="listen: keypress, resetError"><input data-loginmodel="bind:value,firstname" type="text" data-label="bind:placeholder, firstnameplaceholder" data-signupevent="listen: keypress, resetError"><input data-loginmodel="bind:value,lastname" type="text" data-label="bind:placeholder, lastnameplaceholder" data-signupevent="listen:keypress, resetError; listen:keypress, entersignup"></p><p><label data-loginmodel="bind:innerHTML,error" class="login-error"></label></p><p><label id="signup" class="login-button pressed-btn" data-label="bind:innerHTML, signupbutton" data-signupevent="listen: touchstart, press; listen: touchend, release; listen:touchend, signup"></label></p><p><label class="login-button pressed-btn" name="#login-screen" data-signupevent="listen: touchstart, press; listen:touchend, release; listen: touchend, showLogin" data-label="bind:innerHTML, loginbutton"></label></p></form>';
                        
                        _signupForm.press = function(event, node){
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
                                _stack.getStack().show("#login-screen");
                        };
                        
                        _signupForm.resetError = function(event, node){
                                _store.set("error", "");        
                        };
                        
                        _signupForm.signup = function signup(event, node){
                                var email = _store.get("email"),
                                    password = _store.get("password"),
                                    pwdConfirm = _store.get("confirm-password"),
                                    fn = _store.get("firstname"),
                                    ln = _store.get("lastname"),
                                    promise = new Promise(),
                                    user = new CouchDBStore();
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
                                                // NO MISTAKES -- PROCEED TO SIGNUP
                                                        _transport.request("Signup", {name : userid, password : password}, function(result) {
                                                                if (result.signup === "ok") {
                                                                        // display loading screen
                                                                        _stack.getStack().show("#loading-screen");
                                                        
                                                                        // create user
                                                                        user.reset(Config.get("userTemplate"));
                                                                        user.set("firstname", fn);
                                                                        user.set("lastname", ln);
                                                                        user.set("username", fn + " " + ln);
                                                        
                                                                        // add lang
                                                                        user.set("lang", Config.get("lang"));
                                                        
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
                                                                                user.upload().then(function(){
                                                                                        $local.set("currentLogin", userid);
                                                                                        $local.set("userAvatar", user.get("picture_file"));
                                                                                        $local.sync("ideafy-data");
                                                                                        Config.set("uid", '"' + userid + '"');
                                                                                        user.unsync();
                                                                                        $init(true);
                                                                                });
                                                                        }, 350);
                                                                }
                                                                else {
                                                                        _store.set("error", "error : " + result.message);
                                                                        _store.set("email", "");
                                                                }
                                                        }, this);
                                                }
                                        }
                                }
                        };
                        
                        // login form
                        _loginForm.plugins.addAll({
                                "label": new Model(_labels),
                                "loginmodel" : new Model(_store),
                                "loginevent" : new Event(_loginForm)
                        });
                        
                        _loginForm.template = '<form id="login-form"><p class="login-fields"><input data-loginmodel="bind:value,email" autofocus="autofocus" data-label="bind:placeholder, emailplaceholder" type="text" data-loginevent="listen:keypress, resetError"><input data-loginmodel="bind:value,password" type="password" data-label="bind:placeholder, passwordplaceholder" data-loginevent="listen: keypress, resetError; listen:keypress, enterlogin"></p><p><label class="login-button pressed-btn" data-label="bind: innerHTML, loginbutton" data-loginevent="listen:touchstart, press; listen: touchend, release; listen:touchend, login"></label></p><p><label data-loginmodel="bind:innerHTML,error" class="login-error"></label></p><p><label id="signup-button" class="pressed-btn" name="#signup-screen" data-label="bind: innerHTML, newuserbutton" data-loginevent="listen: touchstart, press; listen:touchend, release; listen: touchend, showSignup"></label></p></form>';
                        
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
                                _stack.getStack().show("#signup-screen");
                        };
                        
                        _loginForm.resetError = function(event, node){
                                _store.set("error", "");        
                        };
                        
                        _loginForm.login = function login(event, node){
                                var email = _store.get("email").toLowerCase(), password = _store.get("password");

                                if (email && password) {
                                        _transport.request("Login", {name : email, password : password}, function(result) {
                                                if (result.login === "ok") {
                                                        Config.set("uid", '"' + email + '"');
                                                        // check if there is a new db
                                                        if (result.db){
                                                                Config.set("db", result.db);
                                                        }
                                                        $local.set("currentLogin", email);
                                                        _transport.request("GetAvatar", {id: email}, function(result){
                                                                if (!result.error) {
                                                                        $local.set("userAvatar", result);
                                                                        $local.sync("ideafy-data");
                                                                        // add to Config
                                                                        Config.set("avatar", result);
                                                                }
                                                                $init();
                                                        });
                                                }
                                                else {
                                                        _store.set("error", _labels.get("invalidlogin"));
                                                }
                                        });
                                }
                                else {_store.set("error", _labels.get("invalidlogin"));}        
			};

                        // ADDING ALL UIS TO STACK
			_stack.getStack().add("#login-screen", _loginForm);
			_stack.getStack().add("#signup-screen", _signupForm);
			_stack.getStack().add("#loading-screen", _loading);
			_stack.getStack().add("#maintenance-screen", _serverdown);
			_stack.getStack().add("#nointernet", _internetdown);
                        
                        _login.alive(Map.get("login"));
                        LOGINSTACK = _stack;
                        
		        // Initialization
			_login.init = function init(){
			        // display loading screen and initialize spinner
			       _stack.getStack().show("#loading-screen");
			       spinner = new Spinner({color:"#9AC9CD", lines:10, length: 20, width: 8, radius:15}).spin(document.getElementById("loadingspin"));
                        };
                        
                        _login.setScreen = function setScreen(target){
                                _stack.getStack().show(target);
                        };
                        
		//return
		return _login;
		};
	}
);