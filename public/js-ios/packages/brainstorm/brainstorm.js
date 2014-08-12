/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "service/submenu", "Amy/Stack-plugin", "Bind.plugin", "service/config", "Store", "service/utils", "./ideafy-menu", "./quickb/quickb", "./multi/mub"], 
	function(Widget, Map, Menu, Stack, Model, Config, Store, Utils, IdeafyMenu, QuickB, MultiB){

		return function BrainstormConstructor(){
		//declaration
			var _widget = new Widget(),
			    _submenu,
			    _store = new Store(),
			    _stack = new Stack(),
			    _user = Config.get("user");
			
		//setup
		        _widget.seam.addAll({
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
		        
		        _widget.template = '<div id="brainstorm"><div id="brainstorm-menu"></div><div class="brainstorm-header header blue-dark"><div class="date" data-header="bind: setDate, date"></div><span class="headerTitle" data-header="bind: innerHTML, headertitle"></span><div class="clock" data-header="bind: setTime, date">hh:mm</div></div><div class="stack" data-brainstormstack="destination"></div></div>';
		                
                        _widget.place(Map.get("brainstorm"));
                        
                        _widget.showMenu = function showMenu(){
                             _submenu.toggleActive(true);        
                        };
                        _widget.hideMenu = function hideMenu(){
                             _submenu.toggleActive(false);
                        };
                        _widget.exitSession = function exitSession(){
                                _stack.getStack().show("menu");
                                Config.get("observer").notify("session-exited");
                        };
                        
                        _widget.reset = function reset(){
                                _stack.getStack().get("menu").reset();
                                _stack.getStack().show("menu");        
                        };
                        
                        // start || continue the desired brainstorming type based on session in progress ({id:"", type:""}) parameter
                        _widget.selectScreen = function selectScreen(name, sip){
                                
                                if (name === "continue"){
                                        name = sip.type;
                                }
                                
                                // if ui already exists - reset and show
                                if (name !== "tutorial" && _stack.getStack().get(name)){
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
                                                 case "musession":
                                                        _stack.getStack().add("musession", new MultiB(sip, _widget.exitSession));
                                                        break;
                                                case "tutorial":
                                                        Config.get("observer").notify("display-tutorials");
                                                        break;
                                                default:
                                                        name = "";
                                                        break;                       
                                        }
                                        if (name) {
                                                _stack.getStack().show(name);
                                        }
                                }
                        };
                
                // init
                       _submenu  = new Menu(_widget.dom.querySelector("#brainstorm-menu"));
                       _submenu.toggleActive(false);
                       _store.set("headertitle", Config.get("labels").get("brainstormheadertitle"));
                       setInterval(function(){
                               var now = new Date();
                               _store.set("date", now);
                       },1000);
                       _stack.getStack().add("menu", new IdeafyMenu(_widget.selectScreen));
                       _stack.getStack().show("menu");
                       
		/*
		 * Watch for replay single-user session events
		 */
		Config.get("observer").watch("replay-session", function(sid, mode){
		      
		      var _sip = {}; // need to create session in progress object (with id and type of session)
		      _sip.id = sid;
		      //attempt to detect mode from session name
		      if (sid.toLowerCase().search("quick") > -1) {
		              _sip.type = "quick";
		      }
		      if (sid.toLowerCase().search("s:mu") > -1) {
                                _sip.type = "musession";
                      }
		      _widget.selectScreen(_sip.type, _sip);
		});
		
		/*
                 * Watch for joining mu-session events
                 */
                Config.get("observer").watch("join-musession", function(sid){
                      var sip ={type: "musession", id: sid, mode:"join"};
                      _widget.selectScreen(sip.type, sip);
                });
                
                Config.get("observer").watch("show-mupreview", function(sid){
                        var sip ={type: "musession", id: sid, mode:"preview"};
                      _widget.selectScreen(sip.type, sip);
                });
		
		//return
			return _widget;
		};
	}
);