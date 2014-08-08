/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../libs/olives"),
      amy = require("../../libs/amy2"),
      Widget = olives.OObject,
      Stack = amy.StackPlugin,
      Map = require("../../services/map"),
      Menu = require("../../services/submenu"),
      Ideas = require("./ideas/ideas"),
      Sessions = require("./sessions/sessions"),
      Decks = require("./decks/decks"),
      Config = require("../../services/config");

module.exports = function LibraryConstructor(){
        //declaration
        var _widget = new Widget(),
              _stack = new Stack(),
              _ideas, _sessions, _decks,
              _observer = Config.get("observer"),
              setView = function setView(name){
			         _stack.getStack().show(name);       
			    },
	     _menu;

        //setup
		        _widget.seam.add("librarystack", _stack);
		        
		        _widget.template = '<div id="library"><div class="cache"></div><div id="library-menu"></div><div class="stack" data-librarystack="destination"></div></div>';
		      
			_widget.place(Map.get("library"));
			
			_widget.showMenu = function showMenu(){
			        _menu.toggleActive(true);
			};
			
			_widget.hideMenu = function hideMenu(){
			        _menu.toggleActive(false);        
			};
			
			// reset function
			_widget.reset = function reset(){
			     _ideas.reset();
			     _decks.reset();
			     _sessions.reset();
			     _menu.reset();
			     _stack.getStack().show("#ideas");        
			};
			
	        // init
	               _menu = new Menu(_widget.dom.querySelector("#library-menu"), setView);
	               _menu.toggleActive(false);
	               _ideas = new Ideas();
	               _sessions = new Sessions();
	               _decks = new Decks();
	               _stack.getStack().add("#ideas", _ideas);
	               _stack.getStack().add("#sessions", _sessions);
	               _stack.getStack().add("#decks", _decks);
	               
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
                                       case 9:
                                                _stack.getStack().show("#decks");
                                                break;
	                               default:
	                                       break;
	                       }        
	               });

		//return
			return _widget;
		};