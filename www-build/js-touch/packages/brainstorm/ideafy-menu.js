/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Store","Bind.plugin","Event.plugin","service/config"],function(e,t,n,r,i,s){return function(u){var a=new e,f=s.get("user"),l=s.get("labels"),c=new n,h={name:"continue",active:!0,selected:!1,label:l.get("continuesession"),bg:"continuesession.png",bgselected:"continueactive.png"},p="";return a.plugins.addAll({ideafymenu:new r(c,{setActive:function(e){e?this.classList.remove("inactive"):this.classList.add("inactive")},setBg:function(e){var t=this.getAttribute("data-ideafymenu_id");e?this.setAttribute("style","background-image:url('img/brainstorm/"+c.get(t).bgselected+"');color:white;"):this.setAttribute("style","background-image:url('img/brainstorm/"+c.get(t).bg+"');color:#4D4D4D;")}}),labels:new r(l),ideafyevent:new i(this)}),a.template='<div id="ideafy-menu"><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, brainstormchoosemode"></div><ul class="menu" data-ideafymenu = "foreach"><li data-ideafymenu="bind:innerHTML, label; bind: setActive, active; bind:setBg, selected" data-ideafyevent="listen:touchstart, press; listen: touchend, start"></li></ul></div>',a.place(t.get("ideafy-menu")),this.press=function(e,t){var n=t.getAttribute("data-ideafymenu_id");c.update(n,"selected",!0),t.classList.add("pressed")},this.start=function(e,t){var n=t.getAttribute("data-ideafymenu_id");c.get(n).name==="continue"?u("continue",p):u(c.get(n).name),t.classList.remove("pressed"),c.update(n,"selected",!1)},a.addContinue=function(t){var n=JSON.parse(c.toJSON());c.get(0).name!=="continue"&&(n.unshift(h),c.reset(n)),p=t},a.removeContinue=function(){var t=JSON.parse(c.toJSON());t[0].name==="continue"&&t.splice(0,1),c.reset(t),p=""},a.reset=function(){c.reset([{name:"quick",active:!0,selected:!1,label:l.get("quickbmode"),bg:"quick.png",bgselected:"quickactive.png"},{name:"musession",active:!0,selected:!1,label:l.get("musession"),bg:"multiuser.png",bgselected:"multiuseractive.png"},{name:"customb",active:!1,selected:!1,label:l.get("customsession"),bg:"customb.png",bgselected:"custombactive.png"},{name:"tutorial",active:!0,selected:!1,label:l.get("ideafytutorial"),bg:"tutorial.png",bgselected:"tutorialactive.png"}]),f.get("sessionInProgress")&&f.get("sessionInProgress").id&&a.addContinue(f.get("sessionInProgress"))},a.reset(),f.watchValue("sessionInProgress",function(e){e.id&&e.type?a.addContinue(e):a.removeContinue()}),f.watchValue("lang",function(){var e=s.get("labels");c.loop(function(t,n){switch(t.name){case"continue":c.update(n,"label",e.get("continuesession"));break;case"quick":c.update(n,"label",e.get("quickbmode"));break;case"musession":c.update(n,"label",e.get("musession"));break;case"customb":c.update(n,"label",e.get("customsession"));break;case"tutorial":c.update(n,"label",e.get("ideafytutorial"))}})}),a}});