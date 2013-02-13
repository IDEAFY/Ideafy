/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Amy/Stack-plugin", "service/map", "service/submenu", "./ideas/ideas", "./sessions/sessions", "./decks/decks", "service/config"], 
	function(Widget, Stack, Map, Menu, Ideas, Sessions, Decks, Config){
		return function LibraryConstructor(){
		//declaration
			var _widget = new Widget(),
			    _stack = new Stack(),
			    _observer = Config.get("observer"),
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
	               
	        // library events
	        _observer.watch("display-doc", function(id, type){
	               switch(type){
	                       case 6:
	                               var ideasUI = _stack.getStack().get("#ideas");
	                               ideasUI.searchIdea(id.substr(2));
	                               if (_stack.getStack().getCurrentScreen() !== ideasUI) _stack.getStack().show("#ideas");  
                                        break;
	                       default:
	                               break;
	                }        
	        });

		//return
			return _widget;
		};
	});