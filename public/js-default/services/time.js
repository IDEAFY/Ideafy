/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "Bind.plugin", "Event.plugin", "service/config", "Store", "service/utils"],
        function(Widget, Model, Event, Config, Store, Utils){
                
                function TimeWidgetConstructor(){
                
                        var _widget = this,
                              _labels = Config.get("labels"),
                              user = Config.get("user"),
                              time = new Store({"hour": 0, "min":0, "am":true});
                        
                        _widget.plugins.addAll({
                                "label" : new Model(_labels, {
                                        setInputLabel : function(lbl){
                                                this.innerHTML = _labels.get(lbl);
                                        }
                                }),
                                "model" : new Model(time, {
                                        setAMPM : function(am){
                                                (am) ? this.selectedIndex = 0 : this.selectedIndex=1;
                                        }        
                                }),
                                "user" : new Model(user, {
                                        displayAMPM : function(lang){
                                                switch(lang){
                                                        case "fr-fr":
                                                                this.classList.add("invisible");
                                                                break;
                                                        default:
                                                                this.classList.remove("invisible");
                                                }
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        _widget.template = '<div class = "timeui"><div class="timeicon"></div><input type="number" maxlength="2" max="23" name="hour" data-model="bind:value, hour" data-event="listen:blur, format"><span>:</span><input type="number" maxlength="2" max="59" name="min" data-model="bind:value, min" data-event="listen:blur, format"></select><select name="am" class="invisible" data-model="bind:setAMPM, am" data-user="bind:displayAMPM, lang" data-event="listen: change, setAMPM"><option>AM</option><option>PM</option></select><input class="now" type="checkbox" checked=true data-event="listen: change, updateNow"><label data-label="bind:setInputLabel, now"></label></div>';
                        
                        _widget.getTime= function(){
                                var h, m = time.get("min");
                                (time.get("am")) ? h = time.get("hour") : h=parseInt(time.get("hour"))+12;
                                return [h, m, 0];
                        };
                        
                        _widget.format = function(event, node){
                                var  n=node.value,
                                        field = node.getAttribute("name");
                                if (!/[0-9]/.test(n)) time.set(field, "00");
                                if ( n<10 && n.length<2) node.value = "0"+n;
                                if (field === "hour" && n > 23) time.set(field, "00");
                                if (field === "min" && n > 59) time.set(field, "00");
                                
                                // uncheck now button
                                _widget.dom.querySelector(".now").checked = false;
                         };
                        
                        _widget.setAMPM = function(event, node){
                                (node.selectedIndex === 1) ? time.set("am", false) : time.set("am", true); 
                        };
                        
                        _widget.getTimestamp = function(){
                                var offset = new Date().getTimezoneOffset(),
                                      h, m = parseInt(time.get("min"), 10) || 0;
                                      
                                (time.get("am")) ? h = parseInt(time.get("hour"), 10) : h = parseInt(time.get("hour"), 10) + 12;
                                
                                return (3600*h + 60*m + offset)*1000;      
                        };
                        
                        _widget.setTime= function(h,m,am){
                                var now = new Date(),
                                      lang = user.get("lang"),
                                      _hour = h || now.getHours(),
                                      _min = m || now.getMinutes(),
                                      _am = am;
                                
                                (_min<10) ? time.set("min", "0"+_min) : time.set("min", _min);
                                (_hour > 11) ? time.set("am", false) : time.set("am", true);
                                switch (lang){
                                        case 'fr-fr':
                                                time.set("hour", _hour);
                                                break;
                                        default:
                                                (_hour <12) ? time.set("hour", _hour) : time.set("hour", _hour%12);
                                                break;
                                }
                        };
                        
                        _widget.updateNow = function(event, node){
                                if (node.checked) _widget.reset();        
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
