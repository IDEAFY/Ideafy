define("Ideafy/Library", ["Olives/OObject", "Map", "Ideafy/Library/Menu"], 
	function(Widget, Map, Menu){
		return function LibraryConstructor(){
		//declaration
			var _widget = new Widget(),
			    _menu = new Menu();

		//setup
			_widget.alive(Map.get("library"));

		//return
			return _widget;
		};
	}
);