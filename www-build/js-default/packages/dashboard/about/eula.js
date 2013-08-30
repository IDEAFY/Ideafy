/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","CouchDBDocument","Store"],function(e,t,n,r,i){return function(){var o=new e,u=t.get("user"),a=new i;return o.plugins.add("eula",new n(a)),o.template='<div class="aboutcontent"><h4 data-eula = "bind:innerHTML, title"></h4><div data-eula="bind:innerHTML, body"></div></div>',o.fetch=function(n){var i=new r;i.setTransport(t.get("transport")),i.sync(t.get("db"),"EULA-PC").then(function(){i.get("default_lang")===n||!i.get("translations")[n]?(a.set("title",i.get("title")),a.set("body",i.get("body"))):(a.set("title",i.get("translations")[n].title),a.set("body",i.get("translations")[n].body))})},o.fetch(u.get("lang")),u.watchValue("lang",function(){o.fetch(u.get("lang"))}),o}});