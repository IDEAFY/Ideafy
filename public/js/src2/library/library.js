define("Ideafy/Library", ["Olives/OObject", "Amy/Stack-plugin", "Map", "Ideafy/SubMenu", "Ideafy/Library/Ideas", "Ideafy/Library/Sessions", "Ideafy/Library/Decks"], 
	function(Widget, Stack, Map, Menu, Ideas, Sessions, Decks){
		return function LibraryConstructor(){
		//declaration
			var _widget = new Widget(),
			    _stack = new Stack(),
			    setView = function setView(name){
			         _stack.getStack().show(name);       
			    },
			    _menu = new Menu(Map.get("library-menu"), setView);
		//setup
		        _widget.plugins.add("librarystack", _stack);
		      
			_widget.alive(Map.get("library"));
			
			_widget.showMenu = function showMenu(){
			        _menu.toggleActive(true);
			};
			
			_widget.hideMenu = function hideMenu(){
			        _menu.toggleActive(false);        
			};
			
	        // init
	               _menu.toggleActive(false);
	               _stack.getStack().add("#ideas", new Ideas());
	               _stack.getStack().add("#sessions", new Sessions());
	               _stack.getStack().add("#decks", new Decks());
	               
	               // set current view
	               _stack.getStack().show("#ideas");		

		
		//return
			return _widget;
		};
	}
);