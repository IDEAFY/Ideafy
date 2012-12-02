require(["Olives/OObject", "Olives/LocalStore", "Store", "Map", "Amy/Stack-plugin", "Olives/Model-plugin", "Amy/Delegate-plugin", "Ideafy/Dock", "Ideafy/Login", "Config", "CouchDBStore", "Ideafy/Utils", "Ideafy/NewIdea", "Ideafy/Help"], function(Widget, LocalStore, Store, Map, Stack, Model, Event, Dock, Login, Config, CouchDBStore, Utils, NewIdea, Help) {

        //declaration
        var _body = new Widget(), _login = null, _stack = new Stack({
                "#login" : _login
        }), _dock = new Dock(), _newIdea = new NewIdea(), _local = new LocalStore(), _store = new Store({
                "email" : "",
                "firstname" : "",
                "lastname" : "",
                "confirm-password" : "",
                "password" : "",
                "error" : ""
        }), updateLabels = function(lang) {
                var json = {
                        "lang" : lang
                };
                _transport.request("Lang", json, function(result) {
                        if (result === "nok") {
                                _local.set("labels", Config.get("defaultLabels"));
                                Config.set("language", "US");
                        } else {
                                _local.set("labels", result);
                                Config.set("language", result.language);
                        }
                        // save labels to local storage
                        _local.sync("ideafy-data");
                        // apply language
                        Config.get("labels").reset(_local.get("labels"));
                });
        }, _labels = Config.get("labels"), _db = Config.get("db"), _transport = Config.get("transport"), _user = Config.get("user");

        //setup
        _body.plugins.addAll({
                "event" : new Event(_body),
                "loginmodel" : new Model(_store),
                "label" : new Model(_labels),
                "stack" : _stack
        });

        _body.alive(Map.get("body"));
        _login = new Login();
        _login.setScreen("#loading-screen");
        _stack.getStack().setCurrentScreen(_login);

        _local.sync("ideafy-data");

        // Labels: during development phase we expect to be adding many new labels, that's why localstorage is reset.
        _local.set("labels", null);

        // check device language and set labels accordingly
        if (!_local.get("labels")) {
                updateLabels(navigator.language);
        } else {
                // language already set
                Config.get("labels").reset(_local.get("labels"));
        }

        var current = _local.get("currentLogin");
        if (!current) {
                //display login
                _login.setScreen("#signup-screen");
        } else {
                //_login.setScreen("#signup-screen");
                _login.setScreen("#loading-screen");
                _transport.request("CheckLogin", {
                        "id" : current
                }, function(result) {
                        (result.authenticated) ? _body.init() : _login.setScreen("#login-screen");
                });
        }

        _stack.getStack().add("#dock", _dock);

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
                                                password : password
                                        }, function(result) {
                                                console.log("transport signup handler:", result);
                                                if (result.signup === "ok") {
                                                        
                                                        _store.set("error", _labels.get("Initialization"));
                                                        
                                                        // create user
                                                        user.reset(Config.get("userTemplate"));
                                                        user.set("fistname", fn);
                                                        user.set("lastname", ln);
                                                        user.set("username", fn + " " + ln);

                                                        // add welcome notification
                                                        var now = new Date();

                                                        user.set("notifications", [{
                                                                "type" : "MSG",
                                                                "date" : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()],
                                                                "object" : _labels.get("signupwelcomeobject"),
                                                                "status" : "unread",
                                                                "author" : "IDEAFY",
                                                                "body" : _labels.get("signupwelcomebody")
                                                        }]);

                                                        // get database info
                                                        if (result.db){
                                                                Config.set("db", result.db);
                                                        }

                                                        // upload to database
                                                        user.setTransport(_transport);

                                                        user.sync(result.db, userid);
                                                        setTimeout(function(){
                                                                user.upload().then(function() {
                                                                        // alter local
                                                                        _local.set("currentLogin", userid);
                                                                        _local.set("userAvatar", user.get("picture_file"));
                                                                        _local.sync("ideafy-data");
                                                                        Config.set("uid", '"' + userid + '"');
                                                                        user.unsync();
                                                                        _body.init();
                                                                });
                                                                }, 250);

                                                } else {
                                                        _store.set("error", "error : " + result.message);
                                                        _store.set("email", "");
                                                }
                                        }, this);
                                }

                        }

                }
        };

        _body.resetError = function() {
                _store.set("error", "");
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
        
        _body.init = function() {
                
                _user.sync(_db, _local.get("currentLogin")).then(function() {
                        Config.set("uid", '"' + _user.get("_id") + '"');
                        Config.set("avatar", _local.get("userAvatar"));
                        _dock.init();
                        //if everything is downloaded
                        _stack.getStack().show("#dock");
                        
                        _user.watchValue("picture_file", function(){
                                //handle avatar change
                                _transport.request("GetAvatar", {id: email}, function(result){
                                        if (!result.error) {
                                                _local.set("userAvatar", result);
                                                _local.sync("ideafy-data");
                                                Config.set("avatar", result);
                                        }
                                });
                        });
                
                        Config.watchValue("uid", function(uid){
                                // handle signout
                                if (uid === ""){              
                                }   
                        });
                        
                });
        };

}); 