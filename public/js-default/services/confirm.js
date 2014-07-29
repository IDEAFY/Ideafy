/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../libs/olives"),
      emily = require("../libs/emily"),
      Widget = olives.OObject,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Store = emily.Store,
      Map = require("./map"),
      Config = require("./config");

var _labels = Config.get("labels"),
      _widget = new Widget(),
      _content = new Store({"question":""}),
      _callback, _class;

                        
_widget.plugins.addAll({
        "label" : new Model(_labels),
        "confirm" : new Model(_content),
        "confirmevent" : new Event(_widget)
});
                        
_widget.template = '<div  id="confirm-popup" class = "confirm invisible"><div class="help-doctor"></div><p class="confirm-question" data-confirm="bind:innerHTML,question"></p><div class="option left" data-confirmevent="listen:mousedown, press; listen:mouseup, ok" data-label="bind: innerHTML, continuelbl">Continue</div><div class="option right" data-confirmevent="listen:mousedown, press; listen:mouseup, cancel" data-label="bind:innerHTML, cancellbl">Cancel</div></div>';
                        
_widget.press = function(event, node){
        node.classList.add("pressed");
        event.stopPropagation();
};
                        
_widget.ok = function(event, node){
        node.classList.remove("pressed");
        document.getElementById("cache").classList.remove("appear");
        _callback && _callback(true);    
};
                        
_widget.cancel = function(event, node){
        node && node.classList.remove("pressed");
        document.getElementById("cache").classList.remove("appear");
        _callback && _callback(false);
};
                        
_widget.hide = function hide(){
        document.getElementById("cache").classList.remove("appear");
        _widget.dom.classList.add("invisible");        
};
                        
_widget.show = function show($class){
        // make sure the UI is displayed with the proper class
        if ($class && !_widget.dom.classList.contains($class)){
                _class && _widget.dom.classList.remove(_class);
                _class = $class;
                _widget.dom.classList.add($class);
        }
        document.getElementById("cache").classList.add("appear");
        _widget.dom.classList.remove("invisible");
        //setTimeout(function(){_widget.close;}, 15000);      
};
                        
_widget.reset = function reset($question, $callback, $class){
                                
        // reset previous class if any
        _class && _widget.dom.classList.remove(_class);
                                
        // set parameters
        _content.set("question", $question);
        _callback = $callback;
        _class = $class;
        // applying new class if any
        _class && _widget.dom.classList.add(_class);      
};
                        
module.exports = _widget;
