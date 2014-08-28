/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily"),
      Widget = olives.OObject,
      Config  = require("../../../services/config"),
      Model = olives["Bind.plugin"],
      Store = emily.Store;

module.exports = function AboutIdeafyConstructor(){
                        
                        var aboutIdeafy = new Widget(),
                            labels = Config.get("labels"),
                            credits = new Store([
                                    {"name": labels.get("solene"), "contrib": labels.get("contribsolene")},
                                    {"name": labels.get("oliviers"), "contrib": labels.get("contribscherrer")},
                                    //{"name": labels.get("olivierw"), "contrib": labels.get("contribwietrich")},
                                    {"name": labels.get("vincent"), "contrib": labels.get("contribvincent")}
                            ]);
                        
                        aboutIdeafy.seam.addAll({
                                "labels": new Model(labels),
                                "credits": new Model(credits)
                                });
                        
                        aboutIdeafy.template = '<div class="aboutcontent"><legend data-labels="bind:innerHTML, aboutlbl"></legend><p data-labels="bind:innerHTML, ideafydesc"></p><legend data-labels="bind:innerHTML, about-taiaut"></legend><p data-labels="bind:innerHTML, taiautdesc"></p><legend data-labels="bind: innerHTML, credits"></legend><p><ul data-credits="foreach"><li><span class="contributor" data-credits="bind:innerHTML, name"></span><span class="contribution" data-credits="bind:innerHTML, contrib"></span></li></ul></p></div>';
                        
                        return aboutIdeafy;
 };