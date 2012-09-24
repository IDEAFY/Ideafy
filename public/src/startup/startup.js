define("Startup", ["Olives/OObject", "Map", "Olives/Event-plugin", "Olives/Model-plugin", "Config", "Store"],
	function(OObject, Map, EventPlugin, ModelPlugin, Config, Store){
		
		return function StartupConstructor() {
			
			var startup = new OObject(Store);
			var files = Config.get("startupbg").files;
			var style = "background-image: url('" + Config.get("startupbg").path + files[Math.floor(Math.random()*files.length)] + "');";

			
			startup.model.set("style", style);
					
			startup.plugins.addAll({
				"startup": new EventPlugin(startup),
				"background": new ModelPlugin(startup.model, {
					style : function style(value){
						this.setAttribute("style", value);
					}
				})
				});
			
			startup.display = function(event, node) {
				Config.get("observer").notify("select-screen", node.getAttribute("name"));
				Config.set("previousScreen", "startup");
			};
			
			startup.alive(Map.get("startup"));
			
			return startup;
		};
	}
);