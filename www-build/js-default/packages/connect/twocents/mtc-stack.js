/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Amy/Stack-plugin","Bind.plugin","./mtc-details","./mtq-details","service/config","Store"],function(e,t,n,r,i,s,o,u){return function(){var u=new e,a=new e,f=o.get("labels"),l=new n;return u.template='<div id = "mtcdetailstack" data-mtcdetailstack = "destination"></div>',u.plugins.addAll({mtcdetailstack:l}),u.setView=function(t){var n=l.getStack().getCurrentName();t==="2Q"&&n!=="twoqdetail"?l.getStack().show("twoqdetail"):t==="2C"&&n!=="twocdetail"?(l.getStack().get("twocdetail").reset(),l.getStack().show("twocdetail")):l.getStack().show("defaultPage")},u.reset=function(t,n){t==="2Q"&&n&&(l.getStack().get("twoqdetail").reset(n),l.getStack().show("twoqdetail")),(t==="default"||!n)&&l.getStack().show("defaultPage")},a.template='<div class="msgsplash"><div class="header blue-dark" data-labels="bind: innerHTML, twocentview"><span></span></div><div class="innersplash" data-labels="bind: innerHTML, twocentcenter"></div></div>',a.plugins.add("labels",new r(f)),u.init=function(t,n){var r=new s,o=new i;l.getStack().add("twoqdetail",r),l.getStack().add("twocdetail",o),l.getStack().add("defaultPage",a),t==="default"&&l.getStack().show("defaultPage"),t==="2Q"&&(l.getStack().show("twoqdetail"),twoQDetail.reset(n))},u}});