/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","Amy/Stack-plugin","service/map","service/submenu","./ideas/ideas","./sessions/sessions","./decks/decks","service/config"],function(e,t,n,r,i,s,o,u){return function(){var f=new e,l=new t,c=u.get("observer"),h=function(t){l.getStack().show(t)},p=new r(n.get("library-menu"),h);return f.plugins.add("librarystack",l),f.alive(n.get("library")),f.showMenu=function(){p.toggleActive(!0)},f.hideMenu=function(){p.toggleActive(!1)},p.toggleActive(!1),l.getStack().add("#ideas",new i),l.getStack().add("#sessions",new s),l.getStack().add("#decks",new o),l.getStack().show("#ideas"),c.watch("display-doc",function(e,t){switch(t){case 6:var n=l.getStack().get("#ideas");n.searchIdea(e.substr(2)),l.getStack().getCurrentScreen()!==n&&l.getStack().show("#ideas");break;default:}}),f}});