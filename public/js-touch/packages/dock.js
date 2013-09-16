/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Authors: Vincent Weyl <vincent.weyl@taiaut.com> - Olivier Wietrich <Olivier.Wietrich@taiaut.com
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Place.plugin", "Amy/Stack-plugin", "Amy/Control-plugin", 
	"public/public", "library/library", "brainstorm/brainstorm", "connect/connect", "dashboard/dashboard",
	"service/map", "service/config", "./notify", "service/newidea", "service/help", "service/new2q", "service/new2c", "service/tips"], 
	function(Widget, Place, Stack, Control, Public, Library, Brainstorm, Connect, Dashboard, Map, Config, Notify, NewIdea, Help, New2Q, New2C, Tips){
		return function DockConstructor(){

		//declaration
			var _widget = new Widget(),
			    _newIdea, _new2q, _tips, _notify = new Notify(),
			    _public, _library, _brainstorm, _connect, _dashboard,
			    _control = new Control(this),
			    _observer = Config.get("observer"),
			    _user = Config.get("user"),
			    _stack = new Stack();

		//setup
			//labels have to configurable
			_widget.plugins.addAll({
				"dockstack" : _stack,
				"dockcontrol" : _control,
				"place" : new Place({"notify":_notify})
			});
			
			_widget.template = '<div id="wrapper"><nav id="dock" data-dockcontrol="radio:a,selected,touchstart,setCurrentWidget"><a class="dock-item selected" href="#public" data-dockcontrol="init"></a><a class="dock-item" href="#library"></a><a class="dock-item" href="#brainstorm"></a><a class="dock-item" href="#connect"></a><a class="dock-item" href="#dashboard"></a></nav><div class="stack" data-dockstack="destination"></div><div id="notify" data-place="place:notify"></div></div>';
			
			_widget.place(Map.get("dock"));

		//logic
			_widget.init = function init(){
			        _public = new Public();
			        _library = new Library();
			        _brainstorm = new Brainstorm();
			        _connect = new Connect();
			        _dashboard = new Dashboard();
			        
			        _stack.getStack().add("#public", _public);
				_stack.getStack().add("#library", _library);
				_stack.getStack().add("#brainstorm", _brainstorm);
				_stack.getStack().add("#connect", _connect);
				_stack.getStack().add("#dashboard", _dashboard);
				// init notification engine
				_notify.init();
				
				// initialize popups
				_newIdea = new NewIdea();
                                _new2q = new New2Q();
                                _tips = new Tips();
			};
			
			/*
			 * start function is called by body after dock widget is shown (so that wrapper dom becomes available)
			 * used to highlight startup screen in the left menu and display tips if and as necessary
			 */
			_widget.start = function start(firstStart){
			        var pub = _widget.dom.querySelector('a[href="#public"]'),
			            current = _widget.dom.querySelector('a.selected'),
			            startScreen = _widget.dom.querySelector('a[href="'+_user.get("settings").startupScreen+'"]');
			         //set current stack view
                                if (!_user.get("settings").startupScreen){
                                        if (current !== pub) {
                                                _control.radioClass(pub, current, "selected");
                                                _control.init(pub);
                                        }
                                        _stack.getStack().show("#public");
                                }
                                else {
                                       _control.radioClass(startScreen, current, "selected");
                                       _control.init(startScreen);
                                       _stack.getStack().show(_user.get("settings").startupScreen);
                                }
                                
                                // show tips if applicable
                                if (firstStart || _user.get("settings").showTips !== false){
                                        _tips.init(firstStart);
                                }
                                
                                // set user connection status
                                _user.set("online", true);
                                _user.upload();       
			};
			
			_widget.reset = function reset(){
			     _public.reset();
			     _library.reset();
			     _brainstorm.reset();
			     _connect.reset();
			     _dashboard.reset();
                             _notify.reset();      
			};

			this.setCurrentWidget = function(event){
				var href = event.target.getAttribute("href"), timeout= 3000;
				if(href !== _stack.getStack().getCurrentName()){
				        //hide current submenu if present
                                        _stack.getStack().getCurrentScreen().hideMenu();
                                        
                                        //we show stack widgets this way to reduce listener
					_stack.getStack().show(href);
					
					//display new submenu for a short duration <3s
					_stack.getStack().getCurrentScreen().showMenu();
					setTimeout(function(){_stack.getStack().getCurrentScreen().hideMenu();}, timeout);
				}
				else{
				        //display submenu
				        _stack.getStack().getCurrentScreen().showMenu();
				}
			};
			
	       
               /*
                * Watch for view changing events
                */
                        
                        // replay session
                        _observer.watch("replay-session", function(sid, mode){
                                var prev = document.querySelector(".dock-item.selected"),
                                    bs = document.querySelector(".dock-item[href='#brainstorm']");
                                _stack.getStack().show("#brainstorm");
                                _control.radioClass(bs, prev, "selected");
                                _control.init(bs);
                                // document.querySelector(".dock-item.selected").classList.remove("selected");
                                // document.querySelector(".dock-item[href='#brainstorm']").classList.add("selected");              
                        });
                        
                        // display document
                        _observer.watch("display-doc", function(){
                                var prev = document.querySelector(".dock-item.selected"),
                                    lib = document.querySelector(".dock-item[href='#library']");
                                _stack.getStack().show("#library");
                                _control.radioClass(lib, prev, "selected");
                                _control.init(lib);
                                //document.querySelector(".dock-item.selected").classList.remove("selected");
                                //document.querySelector(".dock-item[href='#library']").classList.add("selected");
                        });
                        
                        // display message center
                        _observer.watch("display-message", function(id){
                                var prev = document.querySelector(".dock-item.selected"),
                                    con = document.querySelector(".dock-item[href='#connect']");
                                _stack.getStack().show("#connect");
                                _control.radioClass(con, prev, "selected");
                                _control.init(con);
                        });
                        
                        // display tutorials (dashboard)
                        _observer.watch("display-tutorials", function(id){
                                var prev = document.querySelector(".dock-item.selected"),
                                    dash = document.querySelector(".dock-item[href='#dashboard']");
                                _stack.getStack().show("#dashboard");
                                _control.radioClass(dash, prev, "selected");
                                _control.init(dash);
                        });
                        
                        // display session waiting room (join)
                        _observer.watch("join-musession", function(sid){
                                var prev = document.querySelector(".dock-item.selected"),
                                    bs = document.querySelector(".dock-item[href='#brainstorm']");
                                
                                // this event can be called from and outside of the brainstorm UI -- we only need to change views if it's called from outside
                                if (_stack.getStack().getCurrentName() !== "#brainstorm") {
                                        _stack.getStack().show("#brainstorm");
                                        _control.radioClass(bs, prev, "selected");
                                        _control.init(bs);
                                }        
                        });
                        
                        // goToScreen event (used when exiting multi-user sessions)
                        _observer.watch("goto-screen", function(name){
                                var prev = document.querySelector(".dock-item.selected"),
                                    dest = document.querySelector(".dock-item[href='"+name+"']");
                                
                                if (_stack.getStack().getCurrentName() !== name) {
                                        _stack.getStack().show(name);
                                        _control.radioClass(dest, prev, "selected");
                                        _control.init(dest);
                                }           
                        });
                        
		//return
			return _widget;

		};
});