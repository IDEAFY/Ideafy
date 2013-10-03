/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Amy/Stack-plugin","Bind.plugin","Event.plugin","service/config","Promise","Store","./init/newmub","./init/mulist"],function(e,t,i,s,n,a,l,r,o){return function(a){var l=new e,d=new r(a),c=new o(a),u=new t,g=n.get("labels");return l.plugins.addAll({labels:new i(g),muinitstack:u,muinitevent:new s(l)}),l.template='<div id="mub-init"><div id="muinitsliderlbl"><label data-labels="bind:innerHTML, startnewmub"></label><label data-labels="bind:innerHTML, joinmub"></label></div><input id="muinitslider" type="range" min="0" max="1" value ="1" data-muinitevent="listen: touchend, toggleMode"><div class="exit-brainstorm" data-muinitevent="listen: touchstart, press; listen: touchend, exit"></div><div class="stack" data-muinitstack="destination"></div></div>',l.place(document.getElementById("mub-init")),l.toggleMode=function(e,t){var i;i="1"===t.value?"new":"list",u.getStack().show(i),u.getStack().get(i).reset()},l.press=function(e,t){t.classList.add("pressed")},l.exit=function(e,t){t.classList.remove("pressed"),a()},l.reset=function(){d.reset(),c.reset()},u.getStack().add("new",d),u.getStack().add("list",c),u.getStack().show("new"),l}});