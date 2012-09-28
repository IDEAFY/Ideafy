define("SignUp", ["Map", "Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Olives/LocalStore"],
        function(Map, OObject, Config, ModelPlugin, EventPlugin, Store, LocalStore){
                
                return function SignUpConstructor(){
                        
                        var signUp = new OObject(),
                            signUpData = new Store({"email": "", "pwd": "", "pwdbis":"", "firstname":"", "lastname": "", "errormsg":""}),
                            appData = new LocalStore(),
                            dom = Map.get("signup");
                            
                            
                        signUp.plugins.addAll({
                                "signup": new ModelPlugin(signUpData),
                                "label" : new ModelPlugin(Config.get("labels")),
                                "signupevent": new EventPlugin(signUp)     
                        });
                        
                        signUp.resetError = function(event, node){
                             signUpData.set("errormsg", "");
                        };
                        
                        signUp.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        signUp.login = function(event, node){
                                dom.classList.add("invisible");
                                Config.get("observer").notify("show-loginscreen");        
                        };
                        
                        signUp.signup = function(event, node){
                                var email = signUpData.get("email"),
                                    password = signUpData.get("pwd"),
                                    pwdConfirm = signUpData.get("pwdbis"),
                                    fn = signUpData.get("firstname"),
                                    ln = signUpData.get("lastname"),
                                    transport = Config.get("transport"),
                                    labels = Config.get("labels"),
                                    user = new CouchDBStore();
                                    
                                node.classList.remove("pressed");
                                
                                if (email === ""){
                                        signUpData.set("errormsg", labels.get("signupmissingemail"));        
                                }
                                else if (password === ""){
                                        signUpData.set("errormsg", labels.get("signupmissingpwd"));
                                }
                                else if (pwdConfirm === ""){
                                        signUpData.set("errormsg", labels.get("signupmissingpwdok"));
                                }
                                else if (fn === ""){
                                        signUpData.set("errormsg", labels.get("signupmissingfn"));
                                }
                                else if (ln === ""){
                                        signUpData.set("errormsg", labels.get("signupmissingln"));
                                }
                                
                                else {
                                        
                                        // check if email address is valid -- in the future an activation mechanism should be envisioned to screen fake addresses
                                        var userid = email.toLowerCase(),
                                            emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
                                        
                                        if (!emailPattern.test(userid)){
                                                signUpData.set("errormsg", labels.get("signupinvalidemail"));        
                                        }
                                        
                                        else {
                                                // check if passwords match
                                                if (password !== pwdConfirm){
                                                        signUpData.set("errormsg", labels.get("signuppwdnomatch"));        
                                                }
                                                
                                                else{
                                                        transport.request("Signup", {
                                                                name: userid,
                                                                password: password
                                                        }, function (result) {
                                                                if (result.signup === "ok"){
                                                                        // create user
                                                                        user.reset(Config.get("userTemplate"));
                                                                        user.set("fistname", fn);
                                                                        user.set("lastname", ln);
                                                                        user.set("username", fn+" "+ln);
                                                                        
                                                                        // add welcome notification
                                                                        var now = new Date();
                                                                        
                                                                        user.set("notifications", [{
                                                                                "type": "MSG",
                                                                                "date": [
                                                                                        now.getFullYear(),
                                                                                        now.getMonth(),
                                                                                        now.getDate(),
                                                                                        now.getHours(),
                                                                                        now.getMinutes(),
                                                                                        now.getSeconds()
                                                                                        ],
                                                                                "object": labels.get("signupwelcomeobject"),
                                                                                "status": "unread",
                                                                                "author": "IDEAFY",
                                                                                "body": labels.get("signupwelcomebody")
                                                                        }]);
                                                                        
                                                                        // upload in database
                                                                        user.setTransport(Config.get("transport"));
                                                                        user.sync("ideafy", userid);
                                                                        user.upload().then(function(){
                                                                                // alter appData
                                                                                appData.set("currentLogin", userid);
                                                                                appData.sync("ideafy_appData");
                                                                                
                                                                                Config.set("uid", '"'+userid+'"');
                                                                                
                                                                                // hide signup screen
                                                                                dom.classList.add("invisible");
                                                                                // notify login completed
                                                                                Config.get("observer").notify("login-completed");
                                                                                user.unsync();
                                                                        });
                                                                        
                                                                        
                                                                }
                                                                else{
                                                                        signUpData.set("errormsg", "error : " + result.message);
                                                                        signUpData.set("email", "");
                                                                }
                                                        }, this);
                                                }
                                                
                                        }
      
                                }
                        };
                        
                        // init
                        appData.sync("ideafy_appData");
                        dom.classList.remove("invisible");
                        
                        Config.get("observer").watch("show-signupscreen", function(){
                                // reset store
                                signUpData.reset({"email": "", "pwd": "", "pwdbis":"", "firstname":"", "lastname": "", "errormsg":""});
                                // display UI
                                dom.classList.remove("invisible");               
                        });
                        
                        signUp.alive(dom);
                        
                        return signUp;   
                        
                };
                
        });
