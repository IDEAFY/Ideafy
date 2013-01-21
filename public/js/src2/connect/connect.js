/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Connect", ["Olives/OObject", "Map", "Amy/Stack-plugin","Ideafy/SubMenu", "Ideafy/Connect/Contacts", "Ideafy/Connect/Messages", "Ideafy/Connect/MyTwocents", "Config"], 
	function(Widget, Map, Stack, Menu, Contacts, Messages, MyTwocents, Config){
		return function ConnectConstructor(){
		//declaration
			var _widget = new Widget(),
			    _stack = new Stack(),
			    _observer = Config.get("observer"),
			    setView = function setView(name){
                                 _stack.getStack().show(name);       
                            },
			    _menu = new Menu(Map.get("connect-menu"), setView);
			    
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
                       _stack.getStack().add("#twocents", new MyTwocents());
                       
                       // set current view
                       _stack.getStack().show("#messages");
                 
                // watch for events
                        _observer.watch("display-message", function(id){
                                _stack.getStack().show("#messages");        
                        });
                        
                        _observer.watch("display-twoq", function(){
                                _stack.getStack().show("#twocents");         
                        });
                       
		//return
			return _widget;
		};
	}
);