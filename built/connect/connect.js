/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Amy/Stack-plugin","service/submenu","./contacts/contacts","./messages/messages","./twocents/mytwocents","service/config"],function(e,t,i,s,n,a,r,c){return function(){var o,d=new e,l=new i,u=c.get("observer"),p=function(e){l.getStack().show(e)},g=new a,v=new n,m=new r;return d.plugins.add("connectstack",l),d.template='<div id="connect"><div id="connect-menu"></div><div class="stack" data-connectstack="destination"></div></div>',d.place(t.get("connect")),d.showMenu=function(){o.toggleActive(!0)},d.hideMenu=function(){o.toggleActive(!1)},d.reset=function(){o.reset(),v.reset(),g.reset(),m.reset(),l.getStack().show("#messages")},o=new s(d.dom.querySelector("#connect-menu"),p),o.toggleActive(!1),g.init(),v.init(),l.getStack().add("#messages",g),l.getStack().add("#contacts",v),l.getStack().add("#twocents",m),l.getStack().show("#messages"),u.watch("display-message",function(){o.setWidget("#messages")}),u.watch("display-twoq",function(){o.setWidget("#twocents")}),u.watch("display-twoc",function(){o.setWidget("#twocents")}),u.watch("message-contact",function(){o.setWidget("#messages")}),d}});