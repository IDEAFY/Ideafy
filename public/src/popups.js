define("Popups", ["Olives/OObject", "Map", "Olives/Event-plugin", "Config", "Stack", "CharPopup", "CardPopup", "ScenarioPopup", "IdeaPopup"],
	function(OObject, Map, EventPlugin, Config, Stack, CharPopup, CardPopup, ScenarioPopup, IdeaPopup){
		
		return function PopupsConstructor() {
			
			var popups = new OObject();
			var popupStack = new Stack(Map.get("popupstack"));
			var dom = Map.get("popups");
			var exit;
			
			popups.plugins.add("event", new EventPlugin(popups));
			
			popups.exitPopup = function(event, node) {
				Config.get("observer").notify("select-screen", exit);
			};
			
			popupStack.addAll({"char": CharPopup(), "card": CardPopup(), "scenario": ScenarioPopup(), "idea": IdeaPopup()});
			
			Config.get("observer").watch("display-popup", function(origin, type, param){
				if (type == "char") popupStack.show("char");
				if ((type =="context") || (type=="problem") || (type == "techno")) popupStack.show("card");
				if (type == "scenario") popupStack.show("scenario");
				if (type == "idea") popupStack.show("idea");
				exit = origin;
			});
			
			popups.alive(dom);
			
			return popups;
		};
	}
);