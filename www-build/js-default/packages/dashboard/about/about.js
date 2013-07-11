/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","Amy/Stack-plugin","service/config","Store","./aboutideafy","./faq","./userguide","./tutorials","./support","./eula"],function(e,t,n,r,i,s,o,u,a,f,l,c,h){return function(){var d=new e,v=new i,m=s.get("labels"),g=[{name:"#about",label:m.get("aboutIdeafy"),currentUI:!1},{name:"#faq",label:m.get("faq"),currentUI:!1},{name:"#userguide",label:m.get("userguide"),currentUI:!1},{name:"#tutorials",label:m.get("tutorials"),currentUI:!1},{name:"#support",label:m.get("support"),currentUI:!1},{name:"#eula",label:m.get("eula"),currentUI:!1}],y=new o(g);return d.plugins.addAll({label:new n(m),aboutmenu:new n(y,{setCurrent:function(e){e?this.classList.add("pressed"):this.classList.remove("pressed")}}),aboutstack:v,aboutevent:new r(d)}),d.template='<div id="dashboard-about"><div class="header blue-dark"><span data-label="bind:innerHTML, aboutlbl"></span></div><div class = "progressbar"><ul id = "aboutmenu" class="steplist" data-aboutmenu="foreach"><li class="step" data-aboutmenu="bind: innerHTML, label; bind:setCurrent, currentUI" data-aboutevent="listen: mousedown, changeDisplay"></li></ul></div><div id="aboutstack" data-aboutstack="destination"></div></div>',d.place(t.get("dashboard-about")),d.changeDisplay=function(t,n){var r=n.getAttribute("data-aboutmenu_id");d.show(y.get(r).name)},d.show=function(t){var n;y.loop(function(e,r){y.update(r,"currentUI",!1),e.name===t&&(n=r)}),y.update(n,"currentUI",!0),v.getStack().show(y.get(n).name)},v.getStack().add("#about",new u),v.getStack().add("#faq",new a),v.getStack().add("#userguide",new f),v.getStack().add("#tutorials",new l),v.getStack().add("#support",new c),v.getStack().add("#eula",new h),v.getStack().show("#about"),y.update(0,"currentUI",!0),d}});