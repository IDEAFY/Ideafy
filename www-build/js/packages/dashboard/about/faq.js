/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/config","CouchDBStore","Olives/Model-plugin","Olives/Event-plugin","Store"],function(e,t,n,r,i,s){return function(){var u=new e,a=new n,f=t.get("user").get("lang");return faqlist=new s([]),u.plugins.addAll({faq:new r(faqlist),faqevent:new i(u)}),u.template='<div class="aboutcontent"><ul data-faq="foreach"><li><legend data-faq="bind:innerHTML, question"></legend><p data-faq="bind: innerHTML, response"></p></li></ul></div>',a.setTransport(t.get("transport")),a.sync(t.get("db"),"about","_view/faq").then(function(){a.loop(function(e,t){e.value.default_lang===f||!e.value.translations[f]?faqlist.alter("push",e.value):faqlist.alter("push",e.value.translations[f])})}),u}});