/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "Bind.plugin"],
        function(Widget, Config, Model){
                
           return function WBDefaultConstructor($type, $mode){
             
                var _widget = new Widget(),
                    _helplbl = "",
                    _labels = Config.get("labels"),
                    _sessionType = "quick"; // current session type ("quick" or "mu")
                    
                _widget.plugins.add("labels", new Model(_labels));
                
                //get session type
                ($mode) ? _sessionType = $mode : _sessionType = "quick";
                
                //if whiteboard is of type scenario display appropriate help message
                ($type === "scenario") ? _helplbl = _sessionType +"scenariohelp" : _helplbl = _sessionType + "ideahelp";
                
                _widget.template = '<div id="whiteboard-default" class="defaultcontent"><div class="doctor-deedee"></div><div class="help" data-labels="bind:innerHTML,'+_helplbl+'"></div></div>';
                
                return _widget;      
           };
        });
