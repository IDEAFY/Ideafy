define("Ideafy/Brainstorm", ["Olives/OObject", "Map"], 
	function(Widget, Map){
		return function BrainstormConstructor(){
		//declaration
			var _widget = new Widget();

		//setup
			_widget.alive(Map.get("brainstorm"));

		//return
			return _widget;
		};
	}
);