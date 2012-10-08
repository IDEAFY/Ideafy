define("Ideafy/Library", ["Olives/OObject", "Map", "Ideafy/SubMenu"], 
	function(Widget, Map, Menu){
		return function LibraryConstructor(){
		//declaration
			var _widget = new Widget(),
			    _menu = new Menu(Map.get("library-menu"));

		//setup
			_widget.alive(Map.get("library"));
			
			_widget.showMenu = function showMenu(){
			        _menu.show();
			};
			
			_widget.hideMenu = function hideMenu(){
			        _menu.hide();        
			};
			
	        // init
	               _menu.hide();		

		//return
			return _widget;
		};
	}
);