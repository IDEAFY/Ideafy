/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../libs/olives"),
      emily = require("../libs/emily"),
      amy = require("../libs/amy2"),
      Widget = olives.OObject,
      Stack = amy.StackPlugin,
      Map = require("../services/map"),
      Menu = require("../services/submenu"),
      Profile = require("./profile/profile"),
      Settings = require("./settings/settings"),
      About = require("./about/about"),
      Config = require("../services/config");

var _widget = new Widget(),
      _stack = new Stack(),
      _profile, _settings, _about,
      _user = Config.get("user"),
      _observer = Config.get("observer"),
      setView = function setView(name){
                _stack.getStack().show(name);       
      },
      _menu;

//setup
_widget.plugins.add("dashboardstack", _stack);
_widget.template='<div id="dashboard"><div id="dashboard-menu"></div><div class="stack" data-dashboardstack="destination"></div></div>';
_widget.place(Map.get("dashboard"));
			
_widget.showMenu = function showMenu(){
        _menu.toggleActive(true);        
};

_widget.hideMenu = function hideMenu(){
        _menu.toggleActive(false);
};
                        
_widget.reset = function reset(){
        _menu.reset();
        _profile.reset();
        _settings.reset();        
};
                
// init
_menu = new Menu(_widget.dom.querySelector("#dashboard-menu"), setView);
_menu.toggleActive(false);
_profile = new Profile();
_settings = new Settings();
_about = new About();
_stack.getStack().add("#profile", _profile);
_stack.getStack().add("#settings", _settings);
_stack.getStack().add("#about", _about);
                       
// set current view
if (_user.get("resetPWD")){
        _stack.getStack().show("#settings");
        //_widget.dom.querySelector(".input[type='password]").scrollIntoView();      
}
else{
        _stack.getStack().show("#profile");
}
                       
// watch for events
Config.get("observer").watch("display-tutorials", function(){
        _menu.setWidget("#about");
        _stack.getStack().get("#about").show("#tutorials");       
});
                        
Config.get("observer").watch("show-about", function(){
        _menu.setWidget("#about");
        _stack.getStack().get("#about").show("#userguide");       
});

module.exports = _widget;