/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","service/submenu","Amy/Stack-plugin","./profile/profile","./settings/settings","./about/about","service/config"],function(e,t,n,r,i,s,o,u){return function(){var f=new e,l=new r,c,h,p,d=u.get("observer"),v=function(t){l.getStack().show(t)},m;return f.plugins.add("dashboardstack",l),f.template='<div id="dashboard"><div id="dashboard-menu"></div><div class="stack" data-dashboardstack="destination"></div></div>',f.place(t.get("dashboard")),f.showMenu=function(){m.toggleActive(!0)},f.hideMenu=function(){m.toggleActive(!1)},f.reset=function(){m.reset(),c.reset(),h.reset()},m=new n(f.dom.querySelector("#dashboard-menu"),v),m.toggleActive(!1),c=new i,h=new s,p=new o,l.getStack().add("#profile",c),l.getStack().add("#settings",h),l.getStack().add("#about",p),l.getStack().show("#profile"),u.get("observer").watch("display-tutorials",function(){m.setWidget("#about"),l.getStack().get("#about").show("#tutorials")}),u.get("observer").watch("show-about",function(){m.setWidget("#about"),l.getStack().get("#about").show("#userguide")}),f}});