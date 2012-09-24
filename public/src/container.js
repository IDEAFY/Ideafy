define("Container", ["Stack", "Map", "SignUp", "Login", "Library", "Startup", "Brainstorm", "Connect", "Dashboard", "Config", "Popups", "Utils"],
	function(Stack, Map, SignUp, Login, Library, Startup, Brainstorm, Connect, Dashboard, Config, Popups, Utils){
		
		return function ContainerConstructor(startScreen) {
			
			var stack = Stack(Map.get("container"));
			
			stack.addAll({"signup": SignUp(), "login": Login(), "startup" : Startup(), "library" : Library(), "brainstorm" : Brainstorm(), "connect": Connect(), "dashboard": Dashboard(), "popups": Popups()});
			
			//initialize container and previous screen with startup
			if (startScreen === "startup"){
			     var id = Config.get("login").id, user = Config.get("user");
			     
			     Config.set("uid", '"'+id+'"');
                             user.setTransport(Config.get("Transport"));
                             user.sync("taiaut", id).then(function(){
                                // retrieve user avatar
                                Utils.getAvatar(id, user.get("picture_file"));
                                Config.get("observer").notify("login-completed");
                             });        
			}
			else{
			        stack.show(startScreen);
			}
			
			Config.get("observer").watch("login-completed", function(){
				stack.show("startup");
				Config.set("previousScreen", "startup");
				
				Config.get("observer").watch("select-screen", function(name, prev){
					stack.show(name);
				});
			
				Config.get("observer").watch("display-popup", function(){
					stack.show("popups");
				});
			});
		}
	}
);