/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Amy/Stack-plugin","service/map","service/submenu","./ideas/ideas","./sessions/sessions","./decks/decks","service/config"],function(e,t,n,r,i,s,o,u){return function(){var f=new e,l=new t,c,h,p,d=u.get("observer"),v=function(t){l.getStack().show(t)},m;return f.plugins.add("librarystack",l),f.template='<div id="library"><div id="library-menu"></div><div class="stack" data-librarystack="destination"></div></div>',f.place(n.get("library")),f.showMenu=function(){m.toggleActive(!0)},f.hideMenu=function(){m.toggleActive(!1)},f.reset=function(){c.reset(),p.reset(),h.reset(),m.reset(),l.getStack().show("#ideas")},m=new r(f.dom.querySelector("#library-menu"),v),m.toggleActive(!1),c=new i,h=new s,p=new o,l.getStack().add("#ideas",c),l.getStack().add("#sessions",h),l.getStack().add("#decks",p),l.getStack().show("#ideas"),d.watch("display-doc",function(e,t){switch(t){case 6:var n=l.getStack().get("#ideas");n.searchIdea(e.substr(2)),l.getStack().getCurrentScreen()!==n&&l.getStack().show("#ideas");break;default:}}),f}});