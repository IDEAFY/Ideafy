/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Amy/Stack-plugin","service/map","service/submenu","./ideas/ideas","./sessions/sessions","./decks/decks","service/config"],function(e,t,i,n,s,a,r,o){return function(){var c,l,d,u,p=new e,g=new t,h=o.get("observer"),v=function(e){g.getStack().show(e)};return p.plugins.add("librarystack",g),p.template='<div id="library"><div id="library-menu"></div><div class="stack" data-librarystack="destination"></div></div>',p.place(i.get("library")),p.showMenu=function(){u.toggleActive(!0)},p.hideMenu=function(){u.toggleActive(!1)},p.reset=function(){c.reset(),d.reset(),l.reset(),u.reset(),g.getStack().show("#ideas")},u=new n(p.dom.querySelector("#library-menu"),v),u.toggleActive(!1),c=new s,l=new a,d=new r,g.getStack().add("#ideas",c),g.getStack().add("#sessions",l),g.getStack().add("#decks",d),g.getStack().show("#ideas"),h.watch("display-doc",function(e,t){switch(t){case 6:var i=g.getStack().get("#ideas");i.searchIdea(e.substr(2)),g.getStack().getCurrentScreen()!==i&&g.getStack().show("#ideas");break;case 9:g.getStack().show("#decks")}}),p}});