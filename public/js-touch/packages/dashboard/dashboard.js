/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "service/submenu", "Amy/Stack-plugin", "./profile/profile", "./settings/settings", "./about/about", "service/config"], 
	function(Widget, Map, Menu, Stack, Profile, Settings, About, Config){
		return function DashboardConstructor(){
		//declaration
			var _widget = new Widget(),
                            _stack = new Stack(),
                            _observer = Config.get("observer"),
                            setView = function setView(name){
                                  _stack.getStack().show(name);       
                            }, 
			    _menu = new Menu(Map.get("dashboard-menu"), setView);

		//setup
		        _widget.plugins.add("dashboardstack", _stack);
			_widget.alive(Map.get("dashboard"));
			
			_widget.showMenu = function showMenu(){
                             _menu.toggleActive(true);        
                        };
                        _widget.hideMenu = function hideMenu(){
                             _menu.toggleActive(false);
                        };
                
                // init
                       _menu.toggleActive(false);
                       _stack.getStack().add("#profile", new Profile());
                       _stack.getStack().add("#settings", new Settings());
                       _stack.getStack().add("#about", new About());
                       
               // set current view
                       _stack.getStack().show("#profile");
                       
               // watch for events
                        Config.get("observer").watch("display-tutorials", function(){
                                if (_stack.getStack().getCurrentName() !== "#about") _stack.getStack().show("#about");
                                _stack.getStack().get("#about").show("#tutorials");       
                        });
                 
                //return
			return _widget;
		};
	});