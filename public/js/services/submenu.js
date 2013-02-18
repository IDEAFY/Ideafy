/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Olives/Model-plugin", "Amy/Control-plugin", "service/config"],
        function(Widget, Model, Control, Config){
                
                function SubMenuConstructor($dom, $setWidget){

                        var _active = false, publicTemplate, libraryTemplate, brainstormTemplate, connectTemplate, dashboardTemplate,
                            toggleActive = function (state){
                                (state) ? $dom.setAttribute("style", "display : block;") : $dom.setAttribute("style", "display : none;");
                                _active = state;        
                            };
                            
                        // templates
                        publicTemplate = '';
                        
                        libraryTemplate = '<div><div class="left-caret"></div><ul class="menu-list" data-menucontrol="radio:li,selected,touchend,setCurrentWidget"><li class="menu-item selected" name="#ideas" data-menucontrol="init"><a class="library-item" href="#ideas" data-label="bind:innerHTML, library-ideas"></a></li><li class="menu-item" name="#sessions"><a class="library-item" href="#sessions" data-label="bind:innerHTML, library-sessions"></a></li><li class="menu-item" name="#decks"><a class="library-item" href="#decks" data-label="bind:innerHTML, library-decks"></a></li></ul></div>';
                        brainstormTemplate ='';
                        
                        connectTemplate = '';
                        
                        dashboardTemplate = '';
                        
                        if ($dom.id.search("public")) this.template = publicTemplate;
                        if ($dom.id.search("library")) this.template = libraryTemplate;
                        if ($dom.id.search("brainstorm")) this.template = brainstormTemplate;
                        if ($dom.id.search("connect")) this.template = connectTemplate;
                        if ($dom.id.search("dashboard")) this.template = dashboardTemplate;
                        
                        // setup
                        this.plugins.addAll({
                                "label" : new Model(Config.get("labels")),
                                "menucontrol" : new Control(this)
                        });
                        
                        this.getState = function getState(){
                                return _active;
                        };
                        
                        this.toggleActive = function (state){
                                toggleActive(state);
                        };
                        
                        this.setCurrentWidget = function setCurrentWidget(event){
                                var ui = event.target.getAttribute("name");
                                if ($setWidget) {$setWidget(ui);}
                                setTimeout(function(){toggleActive(false);}, 200);
                        };
                        
                        this.place($dom);     
                }
                
                return function SubMenuFactory($dom, $setWidget){
                        SubMenuConstructor.prototype = new Widget();
                        return new SubMenuConstructor($dom,$setWidget);
                };
});