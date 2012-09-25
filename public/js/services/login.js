
define("Login",["Config", "Map", "Olives/OObject", "Olives/Event-plugin", "Olives/Model-plugin", "Store", "Ideafy/Utils", "Olives/LocalStore"],
	function(Config, Map, OObject, EventPlugin, ModelPlugin, Store, Utils, LocalStore){
		return function LoginConstructor(){
			
			var login = new OObject(),
			    loginData = new Store({"email": "", "pwd": "", "errormsg":""}),
			    appData = new LocalStore();
			    dom = Map.get("login");
			
			login.plugins.addAll({
			        "login": new ModelPlugin(loginData),
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
                                    user = Config.get("user");
                                
                                node.classList.remove("pressed");
                                    
                                if (email && password){
                                        transport.request("Login", {name: email, password: password}, function (result) {
                                                if (result.login === "ok"){
                                                        Config.set("uid", '"'+email+'"');
                                                        user.setTransport(transport);
                                                        user.sync("ideafy", email).then(function(){
                                                                // retrieve user avatar
                                                                Utils.getAvatar(email, user.get("picture_file"));
                                                                appData.set("currentLogin", email);
                                                                appData.sync("ideafy_appData");
                                                                alert(appData.get("currentLogin"));
                                                                //hide login screen
                                                                dom.classList.add("invisible");
                                                                Config.get("observer").notify("login-completed");
                                                        });
                                                }
                                                else {
                                                        loginData.set("errormsg", "Invalid username or password");
                                                }     
                                        });
                                }
                                else {
                                        loginData.set("errormsg", "Please enter both username and password or register")
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
