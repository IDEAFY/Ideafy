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
                        
                        _widget.template = '<div class = "timeui"><input type="text" maxlength=2 name="hour" data-model="bind:setHour, hour" data-event="listen:keypress, check; listen:blur, format">:<input type="text" maxlength=2 name="min" data-model="bind:setMin, minutes" data-event="listen:input, check; listen:blur, format"></select><select name="am" class="invisible" data-event="listen: change, setTime"><option>AM</option><option>PM</option></select></div>';
                        
                        _widget.getTime= function(){
                                var h, m = time.get("min");
                                (time.get("am")) ? h = time.get("hour") : h=time.get("hour")+12;
                                return [h, m, 0];
                        };
                        
                        _widget.check = function(event, node){
                                var field = node.getAttribute("name"), n=node.value, regex=/[0-9]/;
                                // test for numbers
                                if (!regex.test(n)) node.innerHTML = time.get("field") || "00";
                                // test for hours
                                if (field === "hour"){ 
                                        console.log(n);
                                        if (n>23) node.innerHTML = time.get("field") || "00";
                                }
                                // test for minutes
                                if (field === "min"){
                                        console.log(n);
                                        if (n>59) node.innerHTML = time.get("field") || "00";
                                }
                                time.set(field, n);        
                        };
                        
                        _widget.format = function(event, node){
                                var  n=node.value;
                                if ( n<10) node.innerHTML = "0"+n;
                         };
                        
                        _widget.setTime = function(event, node){
                                if (node.selectedIndex === 1) time.set("hour", (time.get("hour")+12)); 
                        };
                        
                        _widget.getTimestamp = function(){
                                var offset = new Date().getTimezoneOffset();
                                return (3600*time.get("hour") + 60*time.get("min") + offset)*1000;      
                        };
                        
                        _widget.setTime= function(h,m,am){
                                var now = new Date(),
                                      _hour = h || now.getHours(),
                                      _min = m || now.getMinutes(),
                                      _am = am;
                                time.set("hour", _year);  
                                time.set("min", _month);
                                timee.set("am", _am);
                        };
                        
                        _widget.render();
                        
                }
                        
                return function TimeWidgetFactory(){
                        TimeWidgetConstructor.prototype = new Widget();
                        return new TimeWidgetConstructor();
                };
        });
