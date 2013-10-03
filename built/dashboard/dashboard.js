/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","service/submenu","Amy/Stack-plugin","./profile/profile","./settings/settings","./about/about","service/config"],function(e,t,s,i,n,a,c,r){return function(){var o,l,d,u,p=new e,g=new i,v=(r.get("observer"),function(e){g.getStack().show(e)});return p.plugins.add("dashboardstack",g),p.template='<div id="dashboard"><div id="dashboard-menu"></div><div class="stack" data-dashboardstack="destination"></div></div>',p.place(t.get("dashboard")),p.showMenu=function(){u.toggleActive(!0)},p.hideMenu=function(){u.toggleActive(!1)},p.reset=function(){u.reset(),o.reset(),l.reset()},u=new s(p.dom.querySelector("#dashboard-menu"),v),u.toggleActive(!1),o=new n,l=new a,d=new c,g.getStack().add("#profile",o),g.getStack().add("#settings",l),g.getStack().add("#about",d),g.getStack().show("#profile"),r.get("observer").watch("display-tutorials",function(){u.setWidget("#about"),g.getStack().get("#about").show("#tutorials")}),r.get("observer").watch("show-about",function(){u.setWidget("#about"),g.getStack().get("#about").show("#userguide")}),p}});