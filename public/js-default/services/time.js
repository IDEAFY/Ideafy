/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "service/config", "Store", "service/utils"],
        function(Widget, Model, Event, Config, Store, Utils){
                
                function TimeWidgetConstructor(){
                
                        var _widget = this,
                              _labels = Config.get("labels"),
                              time = new Store({"hour":"", "min":"", "am":true});
                        
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "model" : new Model(time,{
                                        setHour : function(h){
                                                this.value = h;
                                                if (h<10) this.innerHTML = "0"+h;     
                                        },
                                        setMin : function(m){
                                                this.value = m;
                                                if (m<10) this.innerHTML = "0"+m;    
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        _widget.template = '<div class = "timeui"><input type="text" maxlength=2 name="hour" data-model="bind:setHour, hour" data-event="listen:keypress, check; listen:input, setTime"><input type="text" maxlength=2 name="min" data-model="bind:setMin, minutes" data-event="listen:keypress, check; listen:input, setTime"></select><select name="am" class="invisible" data-event="listen: change, setTime"><option>AM</option><option>PM</option></select></div>';
                        
                        _widget.getTime= function(){
                                var h, m = time.get("min");
                                (time.get("am")) ? h = time.get("hour") : h=time.get("hour")+12;
                                return [h, m, 0];
                        };
                        
                        _widget.check = function(event, node){
                                var field = node.getAttribute("name"); 
                                
                                if (field === "hour"){
                                        console.log(event.keyCode);        
                                }     
                        };
                        
                        _widget.setTime = function(event, node){
                                var field = node.getAttribute("name");
                                switch(field){
                                        case "hour":
                                                break;
                                        case "min":
                                                break;
                                        case "am" :
                                                break;    
                                };
                        };
                        
                        _widget.getTimestamp = function(){
                                
                        };
                        
                        _widget.setTime= function(h,m,am){
                                var now = new Date(),
                                      _hour = h || now.getHours(),
                                      _min = m || now.getMinutes(),
                                      _am = am;
                                date.set("hour", _year);  
                                date.set("min", _month);
                                date.set("am", _am);
                        };
                        
                        _widget.render();
                        
                }
                        
                return function TimeWidgetFactory(){
                        TimeWidgetConstructor.prototype = new Widget();
                        return new TimeWidgetConstructor();
                };
        });
