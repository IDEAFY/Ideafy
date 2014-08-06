/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../libs/olives"),
      amy = require("../libs/amy"),
      Widget = olives.OObject,
      Place = olives["Place.plugin"],
      Stack = amy.StackPlugin,
      Control = amy.ControlPlugin,
      Public = require("./public/public"),
      Library = require("./library/library"),
      Brainstorm = require("../brainstorm/brainstorm"),
      Connect = require("../connect/connect"),
      Dashboard = require("./dashboard/dashboard"),
      Map = require("../services/map"),
      Config = require("../services/config"),
      Notify = require("./notify"),
      NewIdea = require("../services/newidea"),
      Help = require("../services/help"),
      New2Q = require("../services/new2q"),
      New2C = require("../services/new2c"),
      Tips = require("../services/tips"),
      Attachment = require("./attach/attachment");

module.exports = function DockConstructor(){

        var _widget = new Widget(),
              _notify = new Notify(),
              _public,
              _library,
              _brainstorm,
              _connect,
              _dashboard,
              _control = new Control(this),
              _observer = Config.get("observer"),
              _user = Config.get("user"),
              _stack = new Stack();
                
                
        //setup
        _widget.plugins.addAll({
                "dockstack" : _stack,
                "dockcontrol" : _control,
                "place" : new Place({"notify":_notify, "newidea": NewIdea, "new2q": New2Q, "new2c": New2C, "help": Help, "tips": Tips, "attach": Attachment})
        });
			
        _widget.template = '<div id="wrapper"><nav id="dock" data-dockcontrol="radio:a,selected,mousedown,setCurrentWidget"><a class="dock-item selected" href="#public" data-dockcontrol="init"></a><a class="dock-item" href="#library"></a><a class="dock-item" href="#brainstorm"></a><a class="dock-item" href="#connect"></a><a class="dock-item" href="#dashboard"></a></nav><div class="stack" data-dockstack="destination"></div><div data-place="place:notify"></div><div data-place="place:newidea"></div><div data-place="place:new2q"></div><div data-place="place:new2c"></div><div data-place="place:help"></div><div data-place="place:tips"></div><div data-place="place:attach"></div><div id="cache"></div></div>';
			
        // _widget.place(Map.get("dock"));
			
        _widget.setDisplay = function(){
                var W = window.innerWidth,
                      H = window.innerHeight,
                      w = _widget.dom.clientWidth || 1024,
                      h = _widget.dom.clientHeight || 748,
                      style = "";
			         
                if (W>w) style += "left:50%; margin-left:-"+ w/2 +"px;";
                if (H>h) style += "top:50%; margin-top:-"+ h/2 +"px;";
			     
                _widget.dom.setAttribute("style", style);
        };

        //logic
        _widget.init = function init(){
			        
                _widget.setDisplay();
			        
                _public = new Public();
                console.log("public ok");
                _library = new Library();
                console.log("library ok");
                _brainstorm = new Brainstorm();
                console.log("brainstorm ok");
                _connect = new Connect();
                console.log("connect ok");
                _dashboard = new Dashboard();
                console.log("dashboard ok");
			        
                _stack.getStack().add("#public", _public);
                _stack.getStack().add("#library", _library);
                _stack.getStack().add("#brainstorm", _brainstorm);
                _stack.getStack().add("#connect", _connect);
                _stack.getStack().add("#dashboard", _dashboard);
        				
                // init notification engine
                _notify.init();
        };
			
        /*
        * start function is called by body after dock widget is shown (so that wrapper dom becomes avaialble)
        * used to highlight statrtup screen in the left menu and display tips if and as necessary
        */
        _widget.start = function start(firstStart){
                var pub = _widget.dom.querySelector('a[href="#public"]'),
                      dash = _widget.dom.querySelector('a[href="#dashboard"]'),
                      current = _widget.dom.querySelector('a.selected'),
                      startScreen = _widget.dom.querySelector('a[href="'+_user.get("settings").startupScreen+'"]');
                //set current stack view
                if (!_user.get("settings").startupScreen && !_user.get("resetPWD")){
                        if (current !== pub) {
                                _control.radioClass(pub, current, "selected");
                                _control.init(pub);
                        }
                        _stack.getStack().show("#public");
                }
                else if (_user.get("resetPWD")){
                        _control.radioClass(dash, current, "selected");
                        _control.init(dash);
                        _stack.getStack().show("#dashboard");     
                }
                else {
                        _control.radioClass(startScreen, current, "selected");
                        _control.init(startScreen);
                        _stack.getStack().show(_user.get("settings").startupScreen);
                }
                                
                // show tips if applicable
                if (firstStart || _user.get("settings").showTips !== false){
                        Tips.init(firstStart);
                }    
        };
			
        _widget.reset = function reset(){
                _public.reset();
                _library.reset();
                _brainstorm.reset();
                _connect.reset();
                _dashboard.reset();
                _notify.reset();      
        };

        _widget.setCurrentWidget = function(event){
                var href = event.target.getAttribute("href"), timeout= 1500;
                event.preventDefault();
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
                        
        // display session preview (prior to join)
        _observer.watch("show-mupreview", function(sid){
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

        return _widget;
};