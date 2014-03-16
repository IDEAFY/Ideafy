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
                                "model" : new Model(time),
                                "event" : new Event(this)
                        });
                        
                        _widget.template = '<div class = "timeui"><select name="hour" data-model="bind:setHour, hour"></select><select name="minutes"></select><select name="day"></select></div>';
                        
                        _widget.getTime= function(){
                                return new Date([date.get("year"), date.get("month"), date.get("day")]);
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
