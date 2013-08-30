/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/config","Store","Olives/Model-plugin","Olives/Event-plugin","twocents/writetwocent","twocents/twocentlist","service/avatar","service/utils"],function(e,t,n,r,i,s,o,u,a){return function(){var i=new e,s=t.get("labels"),u=t.get("user"),a=new o;return i.plugins.addAll({labels:new r(s)}),i.template='<div class="twocent-detail"><div class="header blue-dark"><span data-labels="bind: innerHTML, mytwocentwall"></span></div><div class = "detail-contents"><div id="connect-twocents" class="twocents"></div></div></div>',i.reset=function(){a.reset(u.get("_id"),"connect")},i}});