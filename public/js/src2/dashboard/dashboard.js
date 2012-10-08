define("Ideafy/Dashboard", ["Olives/OObject", "Map"], 
	function(Widget, Map){
		return function DashboardConstructor(){
		//declaration
			var _widget = new Widget();

		//setup
			_widget.alive(Map.get("dashboard"));

		//return
			return _widget;
		};
	}
);