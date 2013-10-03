/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","CouchDBView","Bind.plugin","Event.plugin","Store"],function(e,t,s,i,n,a){return function(){var c=new e,r=new s,o=t.get("user");return faqlist=new a([]),c.plugins.addAll({faq:new i(faqlist),faqevent:new n(c)}),c.template='<div class="aboutcontent"><ul data-faq="foreach"><li><legend data-faq="bind:innerHTML, question"></legend><p data-faq="bind: innerHTML, response"></p></li></ul></div>',r.setTransport(t.get("transport")),c.fetch=function(e){r.unsync(),r.reset([]),faqlist.reset([]),r.sync(t.get("db"),"about","_view/faq").then(function(){r.loop(function(t){t.value.default_lang!==e&&t.value.translations[e]?faqlist.alter("push",t.value.translations[e]):faqlist.alter("push",t.value)})})},c.fetch(o.get("lang")),o.watchValue("lang",function(){c.fetch(o.get("lang"))}),c}});