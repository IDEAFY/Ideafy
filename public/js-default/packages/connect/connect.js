/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
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
			    _menu,
			    msgUI = new Messages(),
			    contactsUI = new Contacts(),
			    twocentsUI = new MyTwocents();
			    
			_widget.plugins.add("connectstack", _stack);
			
			_widget.template = '<div id="connect"><div id="connect-menu"></div><div class="stack" data-connectstack="destination"></div></div>';

		//setup
			_widget.place(Map.get("connect"));
			
			_widget.showMenu = function showMenu(){
			     _menu.toggleActive(true);        
			};
			_widget.hideMenu = function hideMenu(){
			     _menu.toggleActive(false);
			};
			
			_widget.reset = function reset(){
			      _menu.reset();
			      contactsUI.reset();
			      msgUI.reset();
			      twocentsUI.reset();
			      _stack.getStack().show("#messages");      
			};
			
                // init
                       _menu = new Menu(_widget.dom.querySelector("#connect-menu"), setView);
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
                                _menu.setWidget("#messages");        
                        });
                        
                        _observer.watch("display-twoq", function(){
                                _menu.setWidget("#twocents");         
                        });
                        
                        _observer.watch("display-twoc", function(){
                                _menu.setWidget("#twocents");         
                        });
                        
                        _observer.watch("message-contact", function(){
                                _menu.setWidget("#messages");       
                        });

                       
		//return
			return _widget;
		};
	});