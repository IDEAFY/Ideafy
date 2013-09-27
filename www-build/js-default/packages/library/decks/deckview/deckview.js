/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Bind.plugin","Event.plugin","Place.plugin","Amy/Stack-plugin","Store","service/map","./deckdetails","./cardlist","service/config","./cardeditor/newcard","./deck-share"],function(e,t,n,r,i,s,o,u,a,f,l,c){return function(h){var p=new e,d=new l(h),v=new c,m=new s([{name:"characters",active:!1,count:0},{name:"contexts",active:!1,count:0},{name:"problems",active:!1,count:0},{name:"techno",active:!1,count:0}]),g=new i,y="",b="";return p.plugins.addAll({cardmenu:new t(m,{setClass:function(e){e&&this.classList.add(e)},setActive:function(e){e?this.classList.add("active"):this.classList.remove("active")}}),place:new r({newCard:d,shareDeck:v}),deckviewstack:g,deckviewevent:new n(p)}),p.template='<div id="deckview" class="details"><div data-place="place: newCard"></div><div data-place="place: shareDeck"></div><ul class="card-menu" data-cardmenu="foreach"><li><div class="card-type" data-cardmenu = "bind: setClass, name; bind:setActive, active" data-deckviewevent="listen: mousedown, viewCards"></div><div class="card-count" data-cardmenu="bind:innerHTML, count"></div></li></li></ul><div id="deckviewstack" data-deckviewstack="destination"></div></div>',p.viewCards=function(e,t){var n=t.getAttribute("data-cardmenu_id");m.loop(function(e,t){t===parseInt(n)?m.update(t,"active",!0):m.update(t,"active",!1)}),g.getStack().show(m.get(n).name)},p.editCard=function(t,n){d.reset(t,n,b,y)},p.hideEditView=function(){d&&d.close()},p.reset=function(t,n){p.hideEditView(),v.hide(),p.dom.setAttribute("style","overflow-y: none;"),["details","characters","contexts","problems","techno"].forEach(function(e){g.getStack().get(e).reset(t)}),b=t._id,y=t.title,m.reset([]),["characters","contexts","problems","techno"].forEach(function(e){t.content[e][0]==="newcard"?m.alter("push",{name:e,active:!1,count:t.content[e].length-1}):m.alter("push",{name:e,active:!1,count:t.content[e].length})}),n?g.getStack().show(n):g.getStack().show("details")},p.init=function(){g.getStack().add("details",new u(h)),g.getStack().add("characters",new a("characters",p.editCard,h)),g.getStack().add("contexts",new a("contexts",p.editCard,h)),g.getStack().add("problems",new a("problems",p.editCard,h)),g.getStack().add("techno",new a("techno",p.editCard,h))},f.get("observer").watch("deck-share",function(e){v.reset(e),v.show()}),p}});