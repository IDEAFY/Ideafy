/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","CouchDBDocument","Store"],function(e,t,s,i,n){return function(){var a=new e,c=t.get("user"),r=new n;return a.plugins.add("eula",new s(r)),a.template='<div class="aboutcontent"><h4 data-eula = "bind:innerHTML, title"></h4><div data-eula="bind:innerHTML, body"></div></div>',a.fetch=function(e){var s=new i;s.setTransport(t.get("transport")),s.sync(t.get("db"),"EULA").then(function(){s.get("default_lang")!==e&&s.get("translations")[e]?(r.set("title",s.get("translations")[e].title),r.set("body",s.get("translations")[e].body)):(r.set("title",s.get("title")),r.set("body",s.get("body")))})},a.fetch(c.get("lang")),c.watchValue("lang",function(){a.fetch(c.get("lang"))}),a}});