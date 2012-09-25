/**
 * Define wrapper with dock and notifications.
 */
 require(["Map", "Olives/OObject", "Amy/Stack-plugin", "Amy/Control-plugin", "Ideafy/Public", "Olives/LocalStore", "Config", "SignUp", "Login"], 
 	function(Map, Widget, StackPlugin, ControlPlugin, Public, LocalStore, Config, SignUp, Login){

 		var wrapper = new Widget(),
 		    appData = new LocalStore({});

 		wrapper.plugins.addAll({
 			"stack" : new StackPlugin({
 				"#public" : wall
 			}),
 			"control" : new ControlPlugin(wrapper)
 		});

 		//init
 		appData.sync("ideafy_appData");
 		alert(appData.get("firstStart"));
 		
 		if (!appData.get("init")){
 		        appData.set("init", true);
 		        appData.set("firstStart", true);
 		        appData.set("currentLogin", "");
 		        appData.sync("ideafy_appData");
 		}
 		
 		
 		if (appData.get("firstStart")){
                        SignUp();
                }
                else if (appData.get("currentLogin") === ""){
                        Login();
                }
                else {
                        var transport =  Config.get("transport"),
                            json = {"id": appData.get("currentLogin")};
                        transport.request("CheckLogin", json, function(result){
                                (result.authenticated) ? Config.get("observer").notify("login-completed") : Login();     
                        });
                }
                
 		wrapper.alive(Map.get("wrapper"));
 		
 		Config.get("observer").watch("login-completed", function(){
 		        document.getElementById("main").classList.remove("invisible");
                        Public();		        
 		});
 		
 		Config.get("observer").watch("show-signupscreen", function(){
 		        SignUp();
 		});
 		
 		Config.get("observer").watch("show-loginscreen", function(){
                        Login();
                });
 	}
 );