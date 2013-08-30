/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Amy/Stack-plugin","./wbdefault","./wbmain","./wbpostit","./wbimport","./wbdrawing","Store"],function(e,t,n,r,i,s,o){function u(e,u,a,f){var l=new o([]),c=this;this.selectScreen=function(t,n){var r=c.getStack().get(t);r.reset&&r.reset(n),c.getStack().show(t)},this.exitScreen=function(t){u.getNbItems()?c.getStack().show("main"):c.getStack().show("default"),a.set(t,"inactive")},this.getContent=function(){return l},this.setSessionId=function(e){c.getStack().get("main").setSessionId(e),c.getStack().get("import").setSessionId(e),c.getStack().get("drawing").setSessionId(e)},this.setReadonly=function(e){c.getStack().get("main").setReadonly(e)},this.getStack().add("default",new t(e,f)),this.getStack().add("main",new n(u,a,this.selectScreen)),this.getStack().add("postit",new r(u,this.exitScreen)),this.getStack().add("import",new i(u,this.exitScreen)),this.getStack().add("drawing",new s(u,this.exitScreen))}return function(n,r,i,s){return u.prototype=new e,new u(n,r,i,s)}});