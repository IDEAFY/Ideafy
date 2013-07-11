/*
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Amy/Control-plugin","Bind.plugin","Place.plugin","Amy/Delegate-plugin","service/map","service/config","./public-stack","service/utils","./lists/list-public","./lists/list-polling","Amy/Stack-plugin","service/submenu","Promise"],function(e,t,n,r,i,s,o,u,a,f,l,c,h){return function(){var p=new e,d,v,m,g=o.get("db"),y=new t(p),b=new u,w,E,S,x,T=new c;return p.template='<div id="public"><div id = "public-menu"></div><div id="public-list" class="list"><div class="header blue-light"><div class="option left" data-publiccontrol="toggle:.option.left,mosaic,mousedown,mosaic"></div><span data-label="bind: innerHTML, publicideasheadertitle"></span><div class="option right" data-publicevent="listen: mousedown, plus"></div></div><div data-liststack="destination" data-publiccontrol="radio:li,selected,mousedown,selectStart"><div class="tools"><input class="search" type="text" data-label="bind: placeholder, searchpublicplaceholder" data-publicevent="listen: keypress, search"><div name="#list-date" class="tools-button bydate pushed" data-publicevent="listen:mousedown,show"></div><div name="#list-rating" class="tools-button byrating" data-publicevent="listen:mousedown,show"></div></div></div></div><div id="public-detail" class="details" data-publicplace="place:details"></div></div>',p.plugins.addAll({liststack:T,label:new n(o.get("labels")),publicevent:new i(p),publicplace:new r({details:b}),publiccontrol:y}),p.place(s.get("public")),p.selectStart=function(e){var t=T.getStack().getCurrentScreen().getModel(),n=e.target.getAttribute("data-listideas_id");b.reset(t,n)},p.displayHighlightedIdea=function(){var t=T.getStack().getCurrentScreen(),n=t.dom.querySelector(".list-item.selected")||t.dom.querySelector("li[data-listideas_id='0']");id=n.getAttribute("data-listideas_id"),n.classList.add("selected"),n.scrollIntoView(),y.init(n),b.reset(t.getModel(),id)},p.show=function(e,t){var n=d.querySelector(".bydate"),r=d.querySelector(".byrating"),i=t.getAttribute("name");i!==T.getStack().getCurrentName&&(T.getStack().show(i),i==="#list-date"?(r.classList.remove("pushed"),n.classList.add("pushed")):(r.classList.add("pushed"),n.classList.remove("pushed")),p.displayHighlightedIdea())},p.mosaic=function(){var e=document.getElementById("public-detail");d.classList.toggle("mosaic"),e.classList.contains("invisible")&&(e.classList.remove("invisible"),b.reset(E.getModel(),0))},p.plus=function(){s.get("newidea-popup").classList.add("appear"),s.get("cache").classList.add("appear")},p.search=function(e,t){e.keyCode===13&&(t.value===""?E.resetQuery().then(function(){v.setAttribute("style","display: inline-block;"),m.setAttribute("style","display: inline-block;"),T.getStack().show("#list-date"),v.classList.add("pushed"),m.classList.remove("pushed"),p.displayHighlightedIdea()}):p.searchIdea(t.value),t.blur())},p.searchIdea=function(t){v.setAttribute("style","display: none;"),m.setAttribute("style","display: none;"),x.resetQuery({q:t,sort:"\\creation_date<date>",include_docs:!0}).then(function(){T.getStack().show("#list-search"),x.getModel().getNbItems()>0?(document.getElementById("noresult").classList.add("invisible"),p.displayHighlightedIdea()):document.getElementById("noresult").classList.remove("invisible")})},p.reset=function(){S.init(b.reset),E.init(b.reset).then(function(){T.getStack().show("#list-date"),b.reset(E.getModel(),0)})},p.showMenu=function(){w.toggleActive(!0)},p.hideMenu=function(){w.toggleActive(!1)},w=new h(p.dom.querySelector("#public-menu")),w.toggleActive(!1),d=p.dom,v=d.querySelector(".bydate"),m=d.querySelector(".byrating"),E=new l(g,"library","_view/publicideas"),S=new f(g,"ideas","_view/ideasbyvotes"),x=new f("_fti/local/"+g,"indexedideas","publicbyname",{q:"init_listSearch_UI",sort:"\\creation_date<date>",limit:60,include_docs:!0}),T.getStack().add("#list-rating",S),T.getStack().add("#list-search",x),T.getStack().add("#list-date",E),S.init(),E.init().then(function(){T.getStack().show("#list-date"),p.displayHighlightedIdea()}),p}});