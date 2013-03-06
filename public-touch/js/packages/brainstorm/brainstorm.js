/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/map", "service/submenu", "Amy/Stack-plugin", "Olives/Model-plugin", "service/config", "Store", "service/utils", "./ideafy-menu", "./quickb/quickb"], 
	function(Widget, Map, Menu, Stack, Model, Config, Store, Utils, IdeafyMenu, QuickB){

		return function BrainstormConstructor(){
		//declaration
			var _widget = new Widget(),
			    _submenu = new Menu(Map.get("brainstorm-menu")),
			    _store = new Store();
			    _stack = new Stack();
			
		//setup
		        _widget.plugins.addAll({
		                "brainstormstack": _stack,
		                "header": new Model(_store, {
		                      setDate: function(date){
		                              if (date){
		                                      // this.innerHTML = Utils.formatDate([date.getFullYear(), date.getMonth(), date.getDate()]);
		                                      this.innerHTML = date.toLocaleDateString();
		                              }       
		                      },
		                      setTime: function(date){
		                                      var hrs = date.getHours(), min=date.getMinutes(), sec = date.getSeconds();
		                                      if (hrs<10) hrs = "0"+hrs;
		                                      if (min<10) min = "0"+min;
		                                      if (sec<10) sec = "0"+sec;
		                                      this.innerHTML = hrs+":"+min+":"+sec;       
		                      } 
		                })
		        });
		                
                        _widget.alive(Map.get("brainstorm"));
                        
                        _widget.showMenu = function showMenu(){
                             _submenu.toggleActive(true);        
                        };
                        _widget.hideMenu = function hideMenu(){
                             _submenu.toggleActive(false);
                        };
                        _widget.exitSession = function exitSession(){
                                _stack.getStack().show("menu");        
                        };
                        
                        // start || continue the desired brainstorming type based on session in progress ({id:"", type:""}) parameter
                        _widget.selectScreen = function selectScreen(name, sip){
                                
                                if (name === "continue"){
                                        name = sip.type;
                                }
                                
                                // if ui already exists - reset and show
                                if (_stack.getStack().get(name)){
                                      _stack.getStack().get(name).reset(sip);
                                      _stack.getStack().show(name);  
                                }
                                // else initialize UI
                                else{
                                        (sip) ? name = sip.type : sip = null;
                                        switch(name){
                                                case "quick":
                                                        _stack.getStack().add("quick", new QuickB(sip, _widget.exitSession));
                                                        break;
                                                case "tutorial":
                                                        Config.get("observer").notify("display-tutorials");
                                                        break;
                                                default:
                                                        name = "";
                                                        break;                       
                                        }
                                        if (name) _stack.getStack().show(name);
                                }
                        };
                
                // init
                       _submenu.toggleActive(false);
                       _store.set("headertitle", Config.get("labels").get("brainstormheadertitle"));
                       setInterval(function(){
                               var now = new Date();
                               _store.set("date", now);
                       },1000);
                       _stack.getStack().add("menu", new IdeafyMenu(_widget.selectScreen));
                       _stack.getStack().show("menu");
                       
		/*
		 * Watch for replay session events
		 */
		Config.get("observer").watch("replay-session", function(sid, mode){
		      
		      var _sip = {}; // need to create session in progress object (with id and type of session)
		      _sip.id = sid;
		      if (mode) {
		              _sip.type = mode;
		      }
		      else{
		              //attempt to detect mode from session name
		              if (sid.toLowerCase().search("quick") > -1) _sip.type = "quick";
		              
		              // need a default mode ??
		      }
		      _widget.selectScreen(_sip.type, _sip);
		});
		
		//return
			return _widget;
		};
	}
);