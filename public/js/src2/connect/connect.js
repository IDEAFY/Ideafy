define("Ideafy/Connect", ["Olives/OObject", "Map", "Amy/Stack-plugin","Ideafy/SubMenu", "Ideafy/Connect/Contacts", "Ideafy/Connect/Messages", "Ideafy/Connect/Twocents"], 
	function(Widget, Map, Stack, Menu, Contacts, Messages, Twocents){
		return function ConnectConstructor(){
		//declaration
			var _widget = new Widget(),
			    _stack = new Stack(),
			    setView = function setView(name){
                                 _stack.getStack().show(name);       
                            },
			    _menu = new Menu(Map.get("connect-menu"));
			    
			_widget.plugins.add("connectstack", _stack);

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
                       _stack.getStack().add("#messages", new Messages());
                       _stack.getStack().add("#contacts", new Contacts());
                       _stack.getStack().add("#twocents", new Twocents());
                       
                       // set current view
                       _stack.getStack().show("#messages");
                       
		//return
			return _widget;
		};
	}
);