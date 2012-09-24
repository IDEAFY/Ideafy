define("BMenu", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Utils", "Config"],
	function(OObject, Map, Store, ModelPlugin, EventPlugin, Utils, Config){
		
		return function BMenuConstructor(bObserver){
			
			var bMenu = new OObject();
			var menu = new Store([
				{"title": "Ideafy now", "name": "quick", "highlighted": false},
				{"title": "Multi-user session", "name": "multi", "highlighted": false},
				{"title": "Custom session", "name": "custom", "highlighted": false},
				{"title": "Tutorial", "name": "tutorial", "highlighted": false}
			]);
			var sip;
			var sessionStarted = false;
			
			bMenu.plugins.addAll({
				"menu": new ModelPlugin(menu, {
					toggleClass : Utils.toggleClass
				}),
				"event": new EventPlugin(bMenu)
			});
			
			bMenu.resetStyle = function(){
				menu.loop(function(value, idx){
					menu.update(idx, "highlighted", false);
				});
			};
			
			bMenu.start = function (event, node){
				var id = node.getAttribute("data-menu_id");
				
				//reset style
				bMenu.resetStyle();
				menu.update(id, "highlighted", true);
				(menu.get(id).name == "continue") ? bObserver.notify("continue-session", sip) : bObserver.notify("start-session", menu.get(id).name);
			};
			
			var dom = Map.get("bmenu");
			
			// menu initialization : check if the user's last session is still in progress, if yes add continue option to the menu
			bObserver.watch("init-brainstorming", function(){
				sip = Config.get("user").get("sessionInProgress");
				if (sip && sip.id) {
					menu.alter("unshift", {"title": "Continue last session", "name": "continue", "highlighted": true});
				};
				menu.update(0, "highlighted", true);
			});
			
			// if a session is started (or continued) then modify menu with continue option and make it the default choice
			bObserver.watch("session-started", function(){
				// if there was no session to continue in the menu, there is one now
				bMenu.resetStyle();
				if (menu.get(0).name == "quick") {
					menu.alter("unshift", {"title": "Continue last session", "name": "continue", "highlighted": true});
					}
				else {
					menu.update(0, "highlighted", true);
					}
				//update session in progress
				sip = Config.get("user").get("sessionInProgress");
				sessionStarted = true;
			});
			
			// if a session is finished, reset menu and remove continue option
			bObserver.watch("session-completed", function(){
				bMenu.resetStyle();
				menu.alter("shift");
				menu.update(0, "highlighted", true);
				sessionStarted = false;
				// reset sip
				sip = {};
				// delete session in progress in user document
				Config.get("user").del("sessionInProgress");
			});
			
			// if there is no session in progress, exit directly
			bObserver.watch("exit-event", function(){
				(!sessionStarted) ? bObserver.notify("exit-confirmed") : bObserver.notify("exit-brainstorming");
			});
			
			// if exit has been confirmed reset sessionStarted to false --> coming back to brainstorm will display menu
			bObserver.watch("exit-confirmed", function(){
				sessionStarted = false;
			});
			
			// if session in progress has been deleted from the session interface
			Config.get("observer").watch("delete-sip", function(){
				Config.get("user").del("sessionInProgress");
				bMenu.resetStyle();
				menu.alter("shift");
				menu.update(0, "highlighted", true);
				sessionStarted = false;
			});
			
			// if user selects resume a session from the session interface
			Config.get("observer").watch("replay-session", function(mode, id){
				// if the selected session is the previous one simply continue session in progress
				if (sip && id == sip.title) bObserver.notify("continue-session", sip);
				else {
					bObserver.notify("continue-session", {"id": id, "type": mode});
				}
			});
			
			bMenu.alive(dom);
			
			return bMenu;
			
		}
		
	});
