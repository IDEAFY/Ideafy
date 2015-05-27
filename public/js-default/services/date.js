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
      Config = require("./config"),
      Utils = require("./utils");

function DateWidgetConstructor(){
                
        var _labels = Config.get("labels"),
              date = new Store({"day":"", "month":"", "year":""}),
              _widget = this;
                        
        this.seam.addAll({
                "label" : new Model(_labels),
                "model" : new Model(date,{
                        setYear : function(y){
                                var res = "", current = new Date().getFullYear(), node = this;
                                if (!node.firstChild){
                                        for (i=0; i<10; i++){
                                                res +="<option>"+(current+i)+"</option>";
                                        }
                                        this.innerHTML=res;
                                }
                                                if (y) this.selectedIndex=(y-current);
                        },
                        setMonth : function(m){
                                var res = "",
                                      months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
                                      node = this;
                                                
                                if (!node.firstChild){
                                        months.forEach(function(month){
                                                res += "<option>"+_labels.get(month)+"</option>";
                                        });
                                        this.innerHTML = res;        
                                }
                                if (m){
                                        this.selectedIndex = m;
                                }
                        },
                        setDays : function(m){
                                var length, res = "";
                                if (m === 1){
                                        (date.get("year")%4 === 0) ? length = 29 : length = 28;
                                }
                                else{
                                        ([3, 5, 8, 10].indexOf(m) > -1) ? length = 30 : length = 31;
                                }
                                for (i=0;i<length; i++){
                                        (i<9) ? res+="<option>0"+(i+1)+"</option>" : res+="<option>"+(i+1)+"</option>";
                                }
                                this.innerHTML = res;
                                if (date.get("day") && (date.get("day") <= length)) this.selectedIndex=date.get("day")-1;
                                else this.selectedIndex=0;
                        },
                        setDay : function(d){
                                if (d) this.selectedIndex = d-1;        
                        }
                }),
                "event" : new Event(this)
        });
                        
        this.template = '<div class = "dateui"><div class="dateicon"></div><select name="day" data-model="bind:setDays, month; bind:setDay, day" data-event="listen: change, setDay"></select><select name="month" data-model="bind:setMonth, month" data-event="listen: change, setMonth"></select><select name="year" data-model="bind:setYear, year" data-event="listen: change, setYear"></select></div>';
                        
        this.getDate= function(){
                return [date.get("year"), date.get("month")+1, date.get("day")];
        };
                        
        this.getDatestamp = function(){
                var d;
                d = date.get("year") + '/' + ( parseInt(date.get("month"), 10) + 1 ) + '/' + date.get("day");
                return new Date(d).getTime();        
        };
                        
        this.setDate = function(y,m,d){
                var now = new Date(),
                      _year = y || now.getFullYear(),
                      _month = m || now.getMonth(),
                      _day = d || now.getDate();
                date.set("year", _year);  
                date.set("month", _month);
                date.set("day", _day);
        };
                        
        this.setDay = function(event, node){
                date.set("day", parseInt(node.value));        
        };
                        
        this.setMonth = function(event, node){
                date.set("month", node.selectedIndex);        
        };
                        
        this.setYear = function(event, node){
                date.set("year", parseInt(node.value));  
        };
                        
        this.reset = function(y,m,d){
                var _y = y || null, _m = m || null; _d = d || null;
                _widget.setDate(_y, _m, _d);        
        };
                        
        this.render();
        this.reset();
};

module.exports = function DateWidgetFactory(){
        DateWidgetConstructor.prototype = new Widget();
        return new DateWidgetConstructor();
};
