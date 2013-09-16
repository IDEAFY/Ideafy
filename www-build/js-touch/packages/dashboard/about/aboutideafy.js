/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Store"],function(e,t,n,r){return function(){var s=new e,o=t.get("labels"),u=new r([{name:o.get("solene"),contrib:o.get("contribsolene")},{name:o.get("oliviers"),contrib:o.get("contribscherrer")},{name:o.get("olivierw"),contrib:o.get("contribwietrich")},{name:o.get("vincent"),contrib:o.get("contribvincent")}]);return s.plugins.addAll({labels:new n(o),credits:new n(u)}),s.template='<div class="aboutcontent"><legend data-labels="bind:innerHTML, aboutlbl"></legend><p data-labels="bind:innerHTML, ideafydesc"></p><legend data-labels="bind:innerHTML, about-taiaut"></legend><p data-labels="bind:innerHTML, taiautdesc"></p><legend data-labels="bind: innerHTML, credits"></legend><p><ul data-credits="foreach"><li><span class="contributor" data-credits="bind:innerHTML, name"></span><span class="contribution" data-credits="bind:innerHTML, contrib"></span></li></ul></p></div>',s}});