/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Store"],function(e,t,s,i){return function(){var n=new e,a=t.get("labels"),c=new i([{name:a.get("solene"),contrib:a.get("contribsolene")},{name:a.get("oliviers"),contrib:a.get("contribscherrer")},{name:a.get("olivierw"),contrib:a.get("contribwietrich")},{name:a.get("vincent"),contrib:a.get("contribvincent")}]);return n.plugins.addAll({labels:new s(a),credits:new s(c)}),n.template='<div class="aboutcontent"><legend data-labels="bind:innerHTML, aboutlbl"></legend><p data-labels="bind:innerHTML, ideafydesc"></p><legend data-labels="bind:innerHTML, about-taiaut"></legend><p data-labels="bind:innerHTML, taiautdesc"></p><legend data-labels="bind: innerHTML, credits"></legend><p><ul data-credits="foreach"><li><span class="contributor" data-credits="bind:innerHTML, name"></span><span class="contribution" data-credits="bind:innerHTML, contrib"></span></li></ul></p></div>',n}});