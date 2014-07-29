/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "Bind.plugin", "Amy/Control-plugin", "service/config"],
        function(Widget, Model, Control, Config){
                
                function SubMenuConstructor($dom, $setWidget){

                        var _active = false, publicTemplate, libraryTemplate, brainstormTemplate, connectTemplate, dashboardTemplate,
                            _ctrl = new Control(this),
                            toggleActiveState = function (state){
                                (state) ? $dom.setAttribute("style", "display : block;") : $dom.setAttribute("style", "display : none;");
                                _active = state;        
                            };
                            
                        // templates
                        publicTemplate = '<div></div>';
                        
                        libraryTemplate = '<div class="sub-menu"><div class="left-caret"></div><ul class="menu-list" data-menucontrol="radio:li,selected,touchend,setCurrentWidget"><li class="menu-item selected" name="#ideas" data-menucontrol="init"><a class="library-item" href="#ideas" data-label="bind:innerHTML, library-ideas"></a></li><li class="menu-item" name="#sessions"><a class="library-item" href="#sessions" data-label="bind:innerHTML, library-sessions"></a></li><li class="menu-item" name="#decks"><a class="library-item" href="#decks" data-label="bind:innerHTML, library-decks"></a></li></ul></div>';
                        brainstormTemplate ='<div></div>';
                        
                        connectTemplate = '<div class="sub-menu"><div class="left-caret"></div><ul class="menu-list" data-menucontrol="radio:li,selected,touchstart,setCurrentWidget"><li class="menu-item selected" data-menucontrol="init" name="#messages"><a class="connect-item" href="#connect-messages" data-label="bind:innerHTML, connect-messages"></a></li><li class="menu-item" name="#contacts"><a class="connect-item" href="#connect-contacts" data-label="bind:innerHTML, connect-contacts"></a></li><li class="menu-item" name="#twocents"><a class="connect-item" href="#connect-twocents" data-label="bind:innerHTML, connect-twocents"></a></li></ul></div>';
                        
                        dashboardTemplate = '<div class="sub-menu"><div class="left-caret"></div><ul class="menu-list" data-menucontrol="radio:li,selected,touchstart,setCurrentWidget"><li class="menu-item selected" name="#profile" data-menucontrol="init"><a class="dashboard-item" href="#dashboard-profile" data-label="bind:innerHTML, dashboard-profile"></a></li><li class="menu-item" name="#settings"><a class="dashboard-item" href="#dashboard-settings" data-label="bind:innerHTML, dashboard-settings">Settings</a></li><li class="menu-item" name="#about"><a class="dashboard-item" href="#dashboard-about" data-label="bind:innerHTML, dashboard-about">About Ideafy</a></li></ul></div>';
                        
                        if ($dom.id.search("public")>-1) {this.template = publicTemplate;}
                        if ($dom.id.search("library")>-1) {this.template = libraryTemplate;}
                        if ($dom.id.search("brainstorm")>-1) {this.template = brainstormTemplate;}
                        if ($dom.id.search("connect")>-1) {this.template = connectTemplate;}
                        if ($dom.id.search("dashboard")>-1) {this.template = dashboardTemplate;}
                        
                        // setup
                        this.plugins.addAll({
                                "label" : new Model(Config.get("labels")),
                                "menucontrol" : _ctrl
                        });
                        
                        this.getState = function getState(){
                                return _active;
                        };
                        
                        this.toggleActive = function (state){
                                toggleActiveState(state);
                        };
                        
                        this.setCurrentWidget = function setCurrentWidget(event){
                                var ui = event.target.getAttribute("name");
                                if ($setWidget) {$setWidget(ui);}
                                setTimeout(function(){toggleActiveState(false);}, 200);
                        };
                        
                        this.setWidget = function setWidget(name){
                                var node = this.dom.querySelector('li[name="'+name+'"]');
                                $setWidget(name);
                                node.parentNode.querySelector(".selected").classList.remove("selected");
                                node.classList.add("selected");
                                _ctrl.init(this.dom.querySelector('li[name="'+name+'"]'));
                        };
                        
                        this.reset = function reset(){
                                var parent = this.dom.querySelector(".menu-list");
                                if (parent) {
                                        parent.querySelector(".selected").classList.remove("selected");
                                        parent.firstChild.classList.add("selected");
                                        _ctrl.init(parent.firstChild);
                                }
                        };
                        
                        this.render();
                        this.place($dom);  
                }
                
                return function SubMenuFactory($dom, $setWidget){
                        SubMenuConstructor.prototype = new Widget();
                        return new SubMenuConstructor($dom,$setWidget);
                };
});