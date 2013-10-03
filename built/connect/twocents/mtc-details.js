/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Store","Bind.plugin","Event.plugin","twocents/writetwocent","twocents/twocentlist","service/avatar","service/utils","Place.plugin"],function(e,t,s,i,n,a,r,c,o,l){return function(){var s=new e,n=t.get("labels"),a=t.get("user"),c=new r("connect");return s.plugins.addAll({labels:new i(n),place:new l({TwocentUI:c})}),s.template='<div class="twocent-detail"><div class="header blue-dark"><span data-labels="bind: innerHTML, mytwocentwall"></span></div><div class = "detail-contents"><div id="connect-twocents" class="twocents" data-place="place: TwocentUI"></div></div></div>',s.reset=function(){c.reset(a.get("_id"),"connect")},s}});