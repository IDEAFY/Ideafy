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
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      WriteTwocent = require("../../twocents/writetwocent"),
      TwocentList = require("../../twocents/twocentlist"),
      Avatar = require("../../../services/avatar"),
      Utils = require("../../../services/utils"),
      Place = olives["Place.plugin"];

module.exports = function MTCDetailsConstructor(){
                        
                        var mtcDetailUI = new Widget(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            twocentList = new TwocentList("connect");
                        
                        mtcDetailUI.seam.addAll({
                                "labels" : new Model(labels),
                                "place" : new Place({"TwocentUI": twocentList})      
                        });
                        
                        mtcDetailUI.template = '<div class="twocent-detail"><div class="header blue-dark"><span data-labels="bind: innerHTML, mytwocentwall"></span></div><div class = "detail-contents"><div id="connect-twocents" class="twocents" data-place="place: TwocentUI"></div></div></div>';
                       
                       mtcDetailUI.reset = function reset(){
                                twocentList.reset(user.get("_id"), "connect");        
                       };
                                          
                       return mtcDetailUI;       
};


