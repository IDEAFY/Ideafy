/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../libs/olives"),
      amy = require("../../libs/amy2"),
      Widget = olives.OObject,
      Map = require("../../services/map"),
      Stack = amy.StackPlugin,
      Menu = require("../../services/submenu"),
      Contacts = require("./contacts/contacts"),
      Messages = require("./messages/messages"),
      MyTwocents = require("./twocents/mytwocents"),
      Config = require("../../services/config");

module.exports = function ConnectConstructor(){
		//declaration
			var _widget = new Widget(),
			    _stack = new Stack(),
			    _observer = Config.get("observer"),
			    setView = function setView(name){
                                 _stack.getStack().show(name);       
                            },
			    _menu,
			    msgUI,
			    contactsUI,
			    twocentsUI;
			    /*msgUI = new Messages(),
			    contactsUI = new Contacts(),
			    twocentsUI = new MyTwocents();*/

msgUI = new Messages();
console.log("messages ok");
contactsUI = new Contacts();
console.log("contacts ok");
twocentsUI = new MyTwocents();
console.log("twocents ok");
			    
			_widget.seam.add("connectstack", _stack);
			
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
