define("Ideafy/Public/Edit", ["Olives/OObject", "Map"], 
	function(Widget, Map){
		return function PublicEditConstructor(){
		//declaration
			var _widget = new Widget();
		//setup
			_widget.alive(Map.get("public-edit"));

		//return
			return _widget;
		};
	}
);