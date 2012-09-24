
define("Login",["Config", "Map", "Olives/OObject", "Olives/Event-plugin", "Olives/Model-plugin", "Store", "Utils"],
	function(Config, Map, OObject, EventPlugin, ModelPlugin, Store, Utils){
		return function LoginConstructor(){
			
			var login = new OObject(),
			    loginData = new Store({"email": "", "pwd": "", "errormsg":""});
			
			login.plugins.addAll({
			        "login": new ModelPlugin(loginData, {
			                setVisible: function(errormsg){
			                        (errormsg) ? this.classList.remove("invisible"): this.classList.add("invisible");
			                }
			        }),
			        "loginevent":new EventPlugin(login)
			        
			});
			
			login.resetError = function(event, node){
			     loginData.set("errormsg", "");
			};
			
			login.login = function(event, node){
                                var email = loginData.get("email"),
                                    password = loginData.get("pwd"),
                                    transport = Config.get("Transport");
                                    user = Config.get("user");
                                console.log(loginData.toJSON());
                                if (email && password){
                                        console.log("login ", email, password);
                                        transport.request("Login", {name: email, password: password}, function (result) {
                                                console.log(result);
                                                if (result.login === "ok"){
                                                        Config.set("uid", '"'+email+'"');
                                                        Config.set("login", {"id": email});
                                                        user.setTransport(Config.get("Transport"));
                                                        user.sync("taiaut", email).then(function(){
                                                                // retrieve user avatar
                                                                Utils.getAvatar(email, user.get("picture_file"));
                                                                Config.sync("Ideafy");
                                                                Config.get("observer").notify("login-completed");
                                                        });
                                                }
                                                else {
                                                        loginData.set("errormsg", "Invalid username or password");
                                                }     
                                        });
                                }
                        };
			
			login.alive(Map.get("login"));
			
			return login;
			
		};
	});
