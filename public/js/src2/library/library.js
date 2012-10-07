define("Ideafy/Library", ["Olives/OObject", "Map"], 
	function(Widget, Map){
		return function LibraryConstructor(){
		//declaration
			var _widget = new Widget();

		//setup
			_widget.alive(Map.get("library"));

		//return
			return _widget;
		};
	}
);