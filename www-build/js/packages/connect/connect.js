/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/map","Amy/Stack-plugin","service/submenu","./contacts/contacts","./messages/messages","./twocents/mytwocents","service/config"],function(e,t,n,r,i,s,o,u){return function(){var f=new e,l=new n,c=u.get("observer"),h=function(t){l.getStack().show(t)},p=new r(t.get("connect-menu"),h);return f.plugins.add("connectstack",l),f.alive(t.get("connect")),f.showMenu=function(){p.toggleActive(!0)},f.hideMenu=function(){p.toggleActive(!1)},p.toggleActive(!1),l.getStack().add("#messages",new s),l.getStack().add("#contacts",new i),l.getStack().add("#twocents",new o),l.getStack().show("#messages"),c.watch("display-message",function(e){l.getStack().show("#messages")}),c.watch("display-twoq",function(){l.getStack().show("#twocents")}),c.watch("display-twoc",function(){l.getStack().show("#twocents")}),c.watch("message-contact",function(){l.getStack().show("#messages")}),f}});