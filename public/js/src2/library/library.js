define("Ideafy/Library", ["Olives/OObject", "Amy/Stack-plugin", "Map", "Ideafy/SubMenu"], 
	function(Widget, Stack, Map, Menu){
		return function LibraryConstructor(){
		//declaration
			var _widget = new Widget(),
			    _menu = new Menu(Map.get("library-menu")),
			    _libraryStack = new Stack();

		//setup
			_widget.alive(Map.get("library"));
			
			_widget.showMenu = function showMenu(){
			        _menu.toggleActive(true);
			};
			
			_widget.hideMenu = function hideMenu(){
			        _menu.toggleActive(false);        
			};
			
	        // init
	               _menu.toggleActive(false);		

		//return
			return _widget;
		};
	}
);