/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","Amy/Stack-plugin","service/map","Amy/Delegate-plugin","service/config","Olives/Model-plugin"],function(e,t,n,r,i,s){return function(){var u=new e,a=new e,f=new e,l=new e,c=new e,h=new e,p=new t;return a.alive(n.get("login-form")),f.alive(n.get("signup-form")),l.alive(n.get("loading")),c.alive(n.get("serverdown")),h.alive(n.get("nointernet")),u.plugins.addAll({loginstack:p,label:new s(i.get("labels")),loginevent:new r(this)}),u.alive(n.get("login")),p.getStack().add("#login-screen",a),p.getStack().add("#signup-screen",f),p.getStack().add("#loading-screen",l),p.getStack().add("#maintenance-screen",c),p.getStack().add("#nointernet",h),p.getStack().setCurrentScreen(a),u.setScreen=function(e){p.getStack().show(e)},u}});