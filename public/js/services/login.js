
define("Login",["Config", "Map", "Olives/OObject", "Olives/Event-plugin", "Olives/Model-plugin", "Store", "Ideafy/Utils", "Olives/LocalStore"],
	function(Config, Map, OObject, EventPlugin, ModelPlugin, Store, Utils, LocalStore){
		return function LoginConstructor(){
			
			var login = new OObject(),
			    loginData = new Store({"email": "", "pwd": "", "errormsg":""}),
			    appData = new LocalStore();
			    dom = Map.get("login");
			
			login.plugins.addAll({
			        "login": new ModelPlugin(loginData),
			        "label" : new ModelPlugin(Config.get("labels")),
			        "loginevent":new EventPlugin(login)
			        
			});
			
			login.resetError = function(event, node){
			     loginData.set("errormsg", "");
			};
			
			login.press = function(event, node){
			        node.classList.add("pressed");
			};
			
			login.login = function(event, node){
                                var email = loginData.get("email").toLowerCase(),
                                    password = loginData.get("pwd"),
                                    transport = Config.get("transport");
                                
                                node.classList.remove("pressed");
                                    
                                if (email && password){
                                        transport.request("Login", {name: email, password: password}, function (result) {
                                                if (result.login === "ok"){
                                                        Config.set("uid", '"'+email+'"');
                                                        appData.set("currentLogin", email);
                                                        appData.sync("ideafy_appData");
                                                        //hide login screen
                                                        dom.classList.add("invisible");
                                                        Config.get("observer").notify("login-completed");
                                                }
                                                else {
                                                        loginData.set("errormsg", Config.get("labels").get("invalidlogin"));
                                                }     
                                        });
                                }
                                else {
                                        loginData.set("errormsg", Config.get("labels").get("missingloginparam"));
                                }
                        };
                        
                        login.signup = function(event, node){
                                // hide login window
                                dom.classList.add("invisible");
                                // display signup screen
                                Config.get("observer").notify("show-signupscreen");        
                        };
			
			dom.classList.remove("invisible");
			
			Config.get("observer").watch("show-loginscreen", function(){
                                // reset store
                                loginData.reset({"email": "", "pwd": "", "errormsg":""});
                                // display UI
                                dom.classList.remove("invisible");               
                        });
			
			login.alive(Map.get("login"));
			
			return login;
			
		};
	});
