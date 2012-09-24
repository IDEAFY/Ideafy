define("Twocents", ["Olives/OObject", "Map"],
	function(OObject, Map){
		
		return function TwocentsConstructor(cObserver){
			
			var Twocents = new OObject();
			
			Twocents.alive(Map.get("twocents"));
			
			return Twocents;
			
		};
	})