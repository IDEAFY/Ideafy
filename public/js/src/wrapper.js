/**
 * Define wrapper with dock and notifications.
 */
 require(["Map", "Olives/OObject", "Amy/Stack-plugin", "Amy/Control-plugin", "Olives/Model-plugin", "Ideafy/Public", "Olives/LocalStore", "Config", "SignUp", "Login"], 
 	function(Map, Widget, StackPlugin, ControlPlugin, ModelPlugin, Public, LocalStore, Config, SignUp, Login){

 		var wrapper = new Widget(),
 		    transport =  Config.get("transport"),
 		    appData = new LocalStore({"init": false, "currentLogin": ""}),
 		    updateLabels = function(lang){
 		             var json = {"lang": lang};
 		             transport.request("Lang", json, function(result){
                             if (result === "nok"){
                                     appData.set("labels", Config.get("defaultLabels"));
                                     Config.get("language", "US"); 
                             }
                             else{
                                     appData.set("labels", result);
                                     Config.set("language", result.language);
                             }
                             // save labels to local storage
                             appData.sync("ideafy_appData");
                             // apply language
                             Config.get("labels").reset(appData.get("labels"));       
                        });                 
 		    };

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
 		        appData.sync("ideafy_appData");
 		}
 		
 		// during development phase we expect to be adding many new labels, that's why localstorage is reset.
 		appData.set("labels", null);
 		
 		// check device language and set labels accordingly
 		if (!appData.get("labels")){
 		        updateLabels(navigator.language);     
 		}
 		else {
 		     // language already set
 		     Config.get("labels").reset(appData.get("labels"));
 		}
 		
 		
 		if (appData.get("currentLogin") === ""){
                        Login();
                }
                else {
                        var json = {"id": appData.get("currentLogin")};
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