/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Amy/Stack-plugin","service/submenu", "./contacts/contacts", "./messages/messages", "./twocents/mytwocents", "service/config"], 
	function(Widget, Map, Stack, Menu, Contacts, Messages, MyTwocents, Config){
		return function ConnectConstructor(){
		//declaration
			var _widget = new Widget(),
			    _stack = new Stack(),
			    _observer = Config.get("observer"),
			    setView = function setView(name){
                                 _stack.getStack().show(name);       
                            },
			    _menu = new Menu(Map.get("connect-menu"), setView),
			    msgUI = new Messages(),
			    contactsUI = new Contacts(),
			    twocentsUI = new MyTwocents();
			    
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
                       
                       msgUI.init();
                       contactsUI.init();
                       _stack.getStack().add("#messages", msgUI);
                       _stack.getStack().add("#contacts", contactsUI);
                       _stack.getStack().add("#twocents", twocentsUI);
                       
                       // set current view
                       _stack.getStack().show("#messages");
                 
                // watch for events
                        _observer.watch("display-message", function(id){
                                _stack.getStack().show("#messages");        
                        });
                        
                        _observer.watch("display-twoq", function(){
                                _stack.getStack().show("#twocents");         
                        });
                        
                        _observer.watch("display-twoc", function(){
                                _stack.getStack().show("#twocents");         
                        });
                        
                        _observer.watch("message-contact", function(){
                                _stack.getStack().show("#messages");        
                        });

                       
		//return
			return _widget;
		};
	});