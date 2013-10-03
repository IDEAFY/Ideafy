/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Amy/Stack-plugin","./wbdefault","./wbmain","./wbpostit","./wbimport","./wbdrawing","Store"],function(e,t,i,s,n,a,r){function c(e,c,o,l){var d=new r([]),u=this;this.selectScreen=function(e,t){var i=u.getStack().get(e);i.reset&&i.reset(t),u.getStack().show(e)},this.exitScreen=function(e){c.getNbItems()?u.getStack().show("main"):u.getStack().show("default"),o.set(e,"inactive")},this.getContent=function(){return d},this.setSessionId=function(e){u.getStack().get("main").setSessionId(e),u.getStack().get("import").setSessionId(e),u.getStack().get("drawing").setSessionId(e)},this.setReadonly=function(e){u.getStack().get("main").setReadonly(e)},this.getStack().add("default",new t(e,l)),this.getStack().add("main",new i(c,o,this.selectScreen)),this.getStack().add("postit",new s(c,this.exitScreen)),this.getStack().add("import",new n(c,this.exitScreen)),this.getStack().add("drawing",new a(c,this.exitScreen))}return function(t,i,s,n){return c.prototype=new e,new c(t,i,s,n)}});