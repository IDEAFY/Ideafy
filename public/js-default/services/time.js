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
                                                var now = new Date().getHours();
                                                if (!h && h!==0){
                                                        this.value = now;
                                                        if (now<10) this.innerHTML = "0"+h;
                                                        this.setAttribute("style", "color: #ccc;");
                                                }
                                                else{
                                                        this.setAttribute("style", "color: #404040;");
                                                }   
                                        },
                                        setMin : function(m){
                                                var now = new Date().getMinutes();
                                                if (!m && m!==0){
                                                        this.value = now;
                                                        if (now<10) this.innerHTML = "0"+now;
                                                        this.setAttribute("style", "color: #ccc;");
                                                } 
                                                else{
                                                        this.setAttribute("style", "color: #404040;");
                                                }  
                                        },
                                        displayAMPM : function(h){
                                                (h <12) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        _widget.template = '<div class = "timeui"><input type="text" maxlength=2 name="hour" data-model="bind:setHour, hour" data-event="listen:keypress, check; listen:blur, format">:<input type="text" maxlength=2 name="min" data-model="bind:setMin, minutes" data-event="listen:input, check; listen:blur, format"></select><select name="am" class="invisible" datas-model="bind:displayAMPM, hour" data-event="listen: change, setTime"><option>AM</option><option>PM</option></select></div>';
                        
                        _widget.getTime= function(){
                                var h, m = time.get("min");
                                (time.get("am")) ? h = time.get("hour") : h=time.get("hour")+12;
                                return [h, m, 0];
                        };
                        
                        _widget.check = function(event, node){
                                var field = node.getAttribute("name"), n=node.value, regex=/[0-9]/;
                                // test for numbers
                                if (regex.test(n)){
                                        // test for hours
                                        if (field === "hour"){ 
                                                console.log(n);
                                                if (n<24) {
                                                        time.set(field, n);
                                                        if (n<10) node.value = "0"+n;
                                                }
                                                else {
                                                        node.value = "00";
                                                        time.set(field, 0);
                                                }
                                        }
                                        // test for minutes
                                        if (field === "min"){
                                                console.log(n);
                                                if (n<60) {
                                                        time.set(field, n);
                                                        if (n<10) node.value = "0"+n;
                                                }
                                                else {
                                                        node.value = "00";
                                                        time.set(field, 0);
                                                }
                                        }
                                }
                                else {
                                        node.value = "00";
                                        time.set(field, 0);
                                }        
                        };
                        
                        _widget.format = function(event, node){
                                var  n=node.value;
                                if ( n<10) node.innerHTML = "0"+n;
                         };
                        
                        _widget.setTime = function(event, node){
                                (node.selectedIndex === 1) ? time.set("am", false) : time.set("am", true); 
                        };
                        
                        _widget.getTimestamp = function(){
                                var offset = new Date().getTimezoneOffset(),
                                      h, m = time.get("min");
                                      
                                (time.get("am")) ? h = time.get("hour") : h=time.get("hour")+12;
                                
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
                        
                        _widget.render();
                        
                }
                        
                return function TimeWidgetFactory(){
                        TimeWidgetConstructor.prototype = new Widget();
                        return new TimeWidgetConstructor();
                };
        });
