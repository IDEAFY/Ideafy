/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily"),
      Widget = olives.OObject,
      Config = require("../../../services/config"),
      Store = emily.Store,
      Promise = emily.Promise,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Utils = require("../../../services/utils");

var calendar= new Widget(),
      cal = new Store([]),
      labels = Config.get("labels"),
      user = Config.get("user");
                        
calendar.template = '<div class="calendar"></div>';
                        
calendar.seam.addAll({
        "labels": new Model(labels),
        "model": new Model(cal),
        "calevent": new Event(calendar)
});
                        
/**
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
                        
module.exports =  calendar;