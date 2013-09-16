/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Amy/Stack-plugin","Bind.plugin","Event.plugin","service/config","Promise","Store","./init/newmub","./init/mulist"],function(e,t,n,r,i,s,o,u,a){return function(o){var f=new e,l=new u(o),c=new a(o),h=new t,p=i.get("labels");return f.plugins.addAll({labels:new n(p),muinitstack:h,muinitevent:new r(f)}),f.template='<div id="mub-init"><div id="muinitsliderlbl"><label data-labels="bind:innerHTML, startnewmub"></label><label data-labels="bind:innerHTML, joinmub"></label></div><input id="muinitslider" type="range" min="0" max="1" value ="1" data-muinitevent="listen: mouseup, toggleMode"><div class="exit-brainstorm" data-muinitevent="listen: mousedown, press; listen: mouseup, exit"></div><div class="stack" data-muinitstack="destination"></div></div>',f.place(document.getElementById("mub-init")),f.toggleMode=function(e,t){var n;t.value==="1"?n="new":n="list",h.getStack().show(n),h.getStack().get(n).reset()},f.press=function(e,t){t.classList.add("pressed")},f.exit=function(e,t){t.classList.remove("pressed"),o()},f.reset=function(){l.reset(),c.reset()},h.getStack().add("new",l),h.getStack().add("list",c),h.getStack().show("new"),f}});