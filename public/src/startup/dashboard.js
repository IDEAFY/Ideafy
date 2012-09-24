define("Dashboard", ["Olives/OObject", "Map", "Olives/Event-plugin", "Olives/Model-plugin", "Config", "Store", "Stack", "Observable", "Profile", "Settings", "About"],
	function(OObject, Map, EventPlugin, ModelPlugin, Config, Store, Stack, Observable, Profile, Settings, About){
		
		return function DashboardConstructor() {
			
			var dashboard = new OObject(),
			    contentMenu = new Store([
                                {name: "profile", label: "My profile"},
                                {name: "settings", label: "Preferences"},
                                {name: "about", label: "About Ideafy"}
                             ]),
                             dashboardStack = new Stack(Map.get("dashboardcontent")),
                             dObserver = new Observable();
                        
                        dashboard.plugins.addAll({
                        "menu" : new ModelPlugin(contentMenu),  
                        "event": new EventPlugin(dashboard)
                        });
                        
                        dashboard.display = function(event, node){
                                dashboardStack.show(node.getAttribute("name"));
                        };
			
			dashboard.plugins.add("event", new EventPlugin(dashboard));
			
			dashboard.exit = function(event, node) {
				Config.get("observer").notify("select-screen", Config.get("previousScreen"));
				Config.set("previousScreen", "dashboard");
			};
			
			
			//initialization
                        Config.get("observer").watch("login-completed", function(){
                                
                                // build the UIs in the stack
                                dashboardStack.addAll({"profile": Profile(dObserver), "settings": Settings(dObserver), "about": About(dObserver)});
                                
                                // initialize the UIs
                                dObserver.notify("login-completed");
                                
                                // show user profile as the default
                                dashboardStack.show("profile");
                                
                        });
                        
                        Config.get("observer").watch("display-profile", function(){
                                dashboardStack.show("profile");
                        });
			
			dashboard.alive(Map.get("dashboard"));
			
			return dashboard;
		};
	}
);