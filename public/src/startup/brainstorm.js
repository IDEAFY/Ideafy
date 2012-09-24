define("Brainstorm", ["Olives/OObject", "Map", "Olives/Event-plugin", "Olives/Model-plugin", "Config", "Stack", "Observable", "Param", "BMenu", "QuickB", "Store"],
	function(OObject, Map, EventPlugin, ModelPlugin, Config, Stack, Observable, Param, BMenu, QuickB, Store){
		
		return function BrainstormConstructor() {
			
			var brainstorm = new OObject();
			var clock = new Store();
			var bStack = new Stack(Map.get("brainstormcontentstack"));
			var bObserver = new Observable();
			
			brainstorm.plugins.addAll({
				"model": new ModelPlugin(clock),
				"event": new EventPlugin(brainstorm)}
				);
			
			bStack.addAll({"BMenu": BMenu(bObserver), "quick": QuickB(bObserver)});
			
			brainstorm.exit = function(event, node) {
				bObserver.notify("exit-event");
			};
			
			bObserver.watch("exit-confirmed", function(){
				Config.get("observer").notify("select-screen", Config.get("previousScreen"));
				Config.set("previousScreen", "brainstorm");
				bStack.show("BMenu");
			});
			
			
			// display selected brainstorming type
			bObserver.watch("start-session", function(type){
				Param.set("continueSession", false);
				bStack.show(type);
			});
			
			bObserver.watch("continue-session", function(sessionObject){
				bStack.show(sessionObject.type);
			});
			
			Config.get("observer").watch("login-completed", function(){
				// initialize brainstorming constructors and show menu
				bObserver.notify("init-brainstorming");
				bStack.show("BMenu");
			});
			
			clock.updateTime = function(){
				var time = new Date();
				clock.set("date", time.toDateString());
				clock.set("time", time.toLocaleTimeString().substr(0,8));
			}
			
			// initialize clock
			clock.updateTime();
			setInterval(clock.updateTime, 1000);
			
			brainstorm.alive(Map.get("brainstorm"));
			
			return brainstorm;
		};
	}
);