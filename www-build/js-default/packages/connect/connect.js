/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Amy/Stack-plugin","service/submenu","./contacts/contacts","./messages/messages","./twocents/mytwocents","service/config"],function(e,t,n,r,i,s,o,u){return function(){var f=new e,l=new n,c=u.get("observer"),h=function(t){l.getStack().show(t)},p,d=new s,v=new i,m=new o;return f.plugins.add("connectstack",l),f.template='<div id="connect"><div id="connect-menu"></div><div class="stack" data-connectstack="destination"></div></div>',f.place(t.get("connect")),f.showMenu=function(){p.toggleActive(!0)},f.hideMenu=function(){p.toggleActive(!1)},f.reset=function(){p.reset(),v.reset(),d.reset(),m.reset(),l.getStack().show("#messages")},p=new r(f.dom.querySelector("#connect-menu"),h),p.toggleActive(!1),d.init(),v.init(),l.getStack().add("#messages",d),l.getStack().add("#contacts",v),l.getStack().add("#twocents",m),l.getStack().show("#messages"),c.watch("display-message",function(e){l.getStack().show("#messages")}),c.watch("display-twoq",function(){l.getStack().show("#twocents")}),c.watch("display-twoc",function(){l.getStack().show("#twocents")}),c.watch("message-contact",function(){l.getStack().show("#messages")}),f}});