/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Store","Bind.plugin","Event.plugin","twocents/writetwocent","twocents/twocentlist","service/avatar","service/utils","Place.plugin"],function(e,t,n,r,i,s,o,u,a,f){return function(){var i=new e,s=t.get("labels"),u=t.get("user"),a=new o("connect");return i.plugins.addAll({labels:new r(s),place:new f({TwocentUI:a})}),i.template='<div class="twocent-detail"><div class="header blue-dark"><span data-labels="bind: innerHTML, mytwocentwall"></span></div><div class = "detail-contents"><div id="connect-twocents" class="twocents" data-place="place: TwocentUI"></div></div></div>',i.reset=function(){a.reset(u.get("_id"),"connect")},i}});