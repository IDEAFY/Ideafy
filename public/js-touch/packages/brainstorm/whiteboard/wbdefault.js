/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin"],
        function(Widget, Config, Model){
                
           return function WBDefaultConstructor($type){
             
                var _widget = new Widget(),
                    _helplbl = "",
                    _labels = Config.get("labels");
                    
                _widget.plugins.add("labels", new Model(_labels));
                
                //if whiteboard is of type scenario display appropriate help message
                ($type === "scenario") ? _helplbl = "quickscenariohelp" : _helplbl = "quickideahelp";
                
                _widget.template = '<div id="whiteboard-default" class="defaultcontent"><div class="doctor-deedee"></div><div class="help" data-labels="bind:innerHTML,'+_helplbl+'"></div></div>';
                
                return _widget;      
           };
        });
