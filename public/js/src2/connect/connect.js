define("Ideafy/Connect", ["Olives/OObject", "Map"], 
	function(Widget, Map){
		return function ConnectConstructor(){
		//declaration
			var _widget = new Widget();

		//setup
			_widget.alive(Map.get("connect"));

		//return
			return _widget;
		};
	}
);