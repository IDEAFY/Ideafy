define("ScenarioPopup", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "Store"],
	function(OObject, Map, Config, ModelPlugin, Store){
		
		return function ScenarioPopupConstructor(){
			
			var scenario = new Store({});
			var ScenarioPopup = new OObject();
			
			ScenarioPopup.plugins.add("model", new ModelPlugin(scenario, {
				formatDate : function(date){
					this.innerHTML = new Date(date[0], date[1], date[2]).toDateString();	
				}
			}));
			
			Config.get("observer").watch("display-popup", function(origin, type, param){
				scenario.reset(param);
			});
			
			ScenarioPopup.alive(Map.get("scenariopopup"));
			
			return ScenarioPopup;
			
		};
		
	});
