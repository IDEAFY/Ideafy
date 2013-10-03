/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","service/config","Store"],function(e,t,i,n,s,a){return new function(){var r=new e,o=s.get("labels"),c=new a({html:""});return r.plugins.addAll({help:new i(c),helpevent:new n(r)}),r.template='<div><div class="help-doctor"></div><div class="close-help" data-helpevent="listen:touchstart, closeHelp"></div><div class="help-screen" data-help="bind:innerHTML,html"></div></div>',r.render(),r.place(t.get("help-popup")),r.setContent=function(e){c.set("html",o.get(e))},r.closeHelp=function(){document.getElementById("help-popup").classList.remove("appear"),document.getElementById("cache").classList.remove("appear")},r}});