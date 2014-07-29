/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "Store", "Promise", "Bind.plugin", "Event.plugin", "service/utils"],
        function(Widget, Config, Store, Promise, Model, Event, Utils){
                
                return new function CalendarConstructor(){
                        
                        var calendar= new Widget(),
                              cal = new Store([]),
                              labels = Config.get("labels"),
                              user = Config.get("user");
                        
                        calendar.template = '<div class="calendar"></div>';
                        
                        calendar.plugins.addAll({
                                "labels": new Model(labels),
                                "model": new Model(cal),
                                "calevent": new Event(calendar)
                        });
                        
                        /*
                         *  A function to add an entry to the calendar
                         * @param entry : Object {date: Number, type: String, docID: String, "info": String}
                         * @return promise : Promise
                         */
                        calendar.add = function add(entry){
                                var i, l, _cal;
                               
                               if (!entry.date || !entry.docId || !entry.type) console.log("error : wrong calendar entry format");
                                
                               ( user.get("cal") && user.get("cal").length ) ? _cal = user.get("cal").concat() :_cal = [];
                               
                               // insert entry according to date
                               if (_cal.length === 0) _cal.push(entry);
                               else{
                                       for (i=0, l =_cal.length; i<l; i++){
                                               if (_cal[i].date <= entry.date) break;
                                       }
                                       _cal.splice(i, 1, entry);
                               }
                               
                               user.set("cal", _cal);
                               return user.upload();
                        };
                        
                        calendar.init = function(){
                                CAL = this;
                        };


                        /*
                         * Watch user calendar
                         */
                        user.watchValue("cal", function(){
                                cal.reset(user.get("cal"));        
                        });
                        
                        return calendar;
                };
        });