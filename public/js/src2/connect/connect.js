define("Ideafy/Connect", ["Olives/OObject", "Map", "Ideafy/SubMenu"], 
	function(Widget, Map, Menu){
		return function ConnectConstructor(){
		//declaration
			var _widget = new Widget(),
			    _menu = new Menu(Map.get("connect-menu"));

		//setup
			_widget.alive(Map.get("connect"));
			
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