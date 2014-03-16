/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "service/config", "Store", "service/utils"],
        function(Widget, Model, Event, Config, Store, Utils){
                
                function DateWidgetConstructor(){
                
                        var _widget = this,
                              _labels = Config.get("labels"),
                              date = new Store({"day":"", "month":"", "year":""});
                        
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "model" : new Model(date,{
                                        setYear : function(y){
                                                var res = "";
                                                if (y){
                                                        for (i=0; i<10; i++){
                                                                res +="<option>"+(y+i)+"</option>";
                                                        }
                                                }
                                                this.innerHTML=res;
                                        },
                                        setMonth : function(m){
                                                var res = "",
                                                      months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                                                
                                                if (m){
                                                        months.forEach(function(month){
                                                               res += "<option>"+_labels.get(month)+"</option>";
                                                        });
                                                        this.innerHTML = res;
                                                        this.selectedIndex = m-1;
                                                }
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        _widget.template = '<div class = "dateui"><select name="day"></select><select name="month" data-model="bind:setMonth, month"></select><select name="year" data-model="bind:setYear, year"></select></div>';
                        
                        _widget.getDate= function(){
                                return new Date([date.get("year"), date.get("month"), date.get("day")]);
                        };
                        
                        _widget.getDateStamp = function(){
                                
                        };
                        
                        _widget.setDate = function(y,m,d){
                                var now = new Date(),
                                      _year = y || now.getFullYear(),
                                      _month = m || now.getMonth(),
                                      _day = d || now.getDate();
                                date.set("year", _year);  
                                date.set("month", _month);
                                date.set("day", _day);
                        };
                        
                        _widget.render();
                        _widget.setDate();
                        
                }
                        
                return function DateWidgetFactory(){
                        DateWidgetConstructor.prototype = new Widget();
                        return new DateWidgetConstructor();
                };
        });
