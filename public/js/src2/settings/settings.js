define("Ideafy/Settings", ["Olives/OObject", "Map"], 
	function(Widget, Map){
		return function SettingsConstructor(){
		//declaration
			var _widget = new Widget();

		//setup
			_widget.alive(Map.get("settings"));

		//return
			return _widget;
		};
	}
);