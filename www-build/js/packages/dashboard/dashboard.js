/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/map","service/submenu","Amy/Stack-plugin","./profile/profile","./settings/settings","./about/about","service/config"],function(e,t,n,r,i,s,o,u){return function(){var f=new e,l=new r,c=u.get("observer"),h=function(t){l.getStack().show(t)},p=new n(t.get("dashboard-menu"),h);return f.plugins.add("dashboardstack",l),f.alive(t.get("dashboard")),f.showMenu=function(){p.toggleActive(!0)},f.hideMenu=function(){p.toggleActive(!1)},p.toggleActive(!1),l.getStack().add("#profile",new i),l.getStack().add("#settings",new s),l.getStack().add("#about",new o),l.getStack().show("#profile"),u.get("observer").watch("display-tutorials",function(){l.getStack().getCurrentName()!=="#about"&&l.getStack().show("#about"),l.getStack().get("#about").show("#tutorials")}),f}});