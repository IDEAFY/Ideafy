/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","service/config","Store"],function(e,t,n,r,i,s){return new function(){var u=new e,a=i.get("labels"),f=new s({html:""});return u.plugins.addAll({help:new n(f),helpevent:new r(u)}),u.template='<div><div class="help-doctor"></div><div class="close-help" data-helpevent="listen:mousedown, closeHelp"></div><div class="help-screen" data-help="bind:innerHTML,html"></div></div>',u.render(),u.place(t.get("help-popup")),u.setContent=function(t){f.set("html",a.get(t))},u.closeHelp=function(e,t){document.getElementById("help-popup").classList.remove("appear"),document.getElementById("cache").classList.remove("appear")},u}});