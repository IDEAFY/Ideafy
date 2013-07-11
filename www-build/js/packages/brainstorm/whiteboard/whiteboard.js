/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Amy/Stack-plugin","./wbdefault","./wbmain","./wbpostit","./wbimport","./wbdrawing","Store"],function(e,t,n,r,i,s,o){function u(e,u,a){var f=new o([]),l=this;this.selectScreen=function(t,n){n&&l.getStack().get(t).reset(n),l.getStack().show(t)},this.exitScreen=function(t){u.getNbItems()?l.getStack().show("main"):l.getStack().show("default"),a.set(t,"inactive")},this.getContent=function(){return f},this.setSessionId=function(e){l.getStack().get("main").setSessionId(e),l.getStack().get("import").setSessionId(e),l.getStack().get("drawing").setSessionId(e)},this.setReadonly=function(e){l.getStack().get("main").setReadonly(e)},this.getStack().add("default",new t(e)),this.getStack().add("main",new n(u,a,this.selectScreen)),this.getStack().add("postit",new r(u,this.exitScreen)),this.getStack().add("import",new i(u,this.exitScreen)),this.getStack().add("drawing",new s(u,this.exitScreen))}return function(n,r,i){return u.prototype=new e,new u(n,r,i)}});