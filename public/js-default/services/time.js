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
                                        displayAMPM : function(h){
                                                (h <12) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        _widget.template = '<div class = "timeui"><div class="timeicon"></div><input type="number" maxlength="2" max="23" name="hour" data-model="bind:value, hour" data-event="listen:blur, format">:<input type="number" maxlength="2" max="59" name="min" data-model="bind:value, min" data-event="listen:blur, format"></select><select name="am" class="invisible" data-model="bind:displayAMPM, hour" data-event="listen: change, setAMPM"><option>AM</option><option>PM</option></select></div>';
                        
                        _widget.getTime= function(){
                                var h, m = time.get("min");
                                (time.get("am")) ? h = time.get("hour") : h=parseInt(time.get("hour"))+12;
                                return [h, m, 0];
                        };
                        
                        _widget.format = function(event, node){
                                var  n=node.value,
                                        field = node.getAttribute("name");
                                if (!/[0-9]/.test(n)) time.set(field, "00");
                                if ( n<10) node.value = "0"+n;
                                if (field === "hour" && n > 23) time.set(field, "00");
                                if (field === "min" && n > 59) time.set(field, "00");
                         };
                        
                        _widget.setAMPM = function(event, node){
                                (node.selectedIndex === 1) ? time.set("am", false) : time.set("am", true); 
                        };
                        
                        _widget.getTimestamp = function(){
                                var offset = new Date().getTimezoneOffset(),
                                      h, m = time.get("min");
                                      
                                (time.get("am")) ? h = parseInt(time.get("hour"), 10) : h = parseInt(time.get("hour"), 10) + 12;
                                
                                return (3600*h + 60*m + offset)*1000;      
                        };
                        
                        _widget.setTime= function(h,m,am){
                                var now = new Date(),
                                      _hour = h || now.getHours(),
                                      _min = m || now.getMinutes(),
                                      _am = am;
                                time.set("hour", _hour);  
                                time.set("min", _min);
                                time.set("am", _am);
                        };
                        
                        _widget.reset = function(){
                                _widget.setTime();
                        };
                        
                        _widget.render();
                        _widget.reset();
                        
                }
                        
                return function TimeWidgetFactory(){
                        TimeWidgetConstructor.prototype = new Widget();
                        return new TimeWidgetConstructor();
                };
        });
