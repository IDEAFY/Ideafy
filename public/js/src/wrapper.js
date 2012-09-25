/**
 * Define wrapper with dock and notifications.
 */
 require(["Map", "Olives/OObject", "Amy/Stack-plugin", "Amy/Control-plugin", "Olives/Model-plugin", "Ideafy/Public", "Olives/LocalStore", "Config", "SignUp", "Login"], 
 	function(Map, Widget, StackPlugin, ControlPlugin, ModelPlugin, Public, LocalStore, Config, SignUp, Login){

 		var wrapper = new Widget(),
 		    appData = new LocalStore({});

 		wrapper.plugins.addAll({
 			"stack" : new StackPlugin({
 				"#public" : wall
 			}),
 			"label" : new ModelPlugin(Config.get("labels")),
 			"control" : new ControlPlugin(wrapper)
 		});

 		//init
 		appData.sync("ideafy_appData");
 		
 		// check if this is the first launch to initialize the LocalStore
 		if (!appData.get("init")){
 		        appData.set("init", true);
 		        appData.set("currentLogin", "");
 		        appData.sync("ideafy_appData");
 		}
 		
 		// check device language and set labels accordingly
 		if (!appData.get("labels")){
 		     appData.set("labels", Config.get("defaultLabels"));
 		     appData.sync("ideafy_appData");        
 		}
 		Config.get("labels").reset(appData.get("labels"));
 		
 		
 		if (appData.get("currentLogin") === ""){
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