/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Amy/Control-plugin","Bind.plugin","Place.plugin","Amy/Delegate-plugin","Store","service/map","service/config","./idea-stack","./lists/idealist","Amy/Stack-plugin"],function(e,t,n,r,i,s,o,u,a,f,l){return function(){var h=new e,p,d,v,m=new s({search:""}),g=u.get("db"),y=u.get("observer"),b=new t(h),w=new a,E,S,x,T=new l;return h.template='<div id = "ideas"><div id="idea-list" class="list"><div class="header blue-light"><div class="option left" data-ideascontrol="toggle:.option.left,mosaic,touchstart,mosaic"></div><span data-label="bind: innerHTML, idealistheadertitle">My Ideas</span><div class="option right" data-ideasevent="listen: touchstart, plus"></div></div><div class="overflow" data-idealiststack="destination" data-ideascontrol="radio:li,selected,touchstart,selectStart"><div class="tools"><input class="search" type="text" data-search="bind: value, search" data-label="bind: placeholder, searchprivateplaceholder" data-ideasevent="listen: keypress, search"><div name="#list-date" class="tools-button bydate pushed" data-ideasevent="listen:touchstart,show"></div><div name="#list-rating" class="tools-button byrating" data-ideasevent="listen:touchstart,show"></div></div></div></div><div id="ideas-detail" class="details" data-ideaplace="place:details"></div></div>',h.plugins.addAll({idealiststack:T,search:new n(m),ideasevent:new i(h),ideaplace:new r({details:w}),ideascontrol:b}),h.place(o.get("ideas")),h.selectStart=function(e){var t=T.getStack().getCurrentScreen().getModel(),n=e.target.getAttribute("data-listideas_id");w.reset(t,n),m.set("search","")},h.displayHighlightedIdea=function(){var t=T.getStack().getCurrentScreen(),n=t.dom.querySelector(".list-item.selected")||t.dom.querySelector("li[data-listideas_id='0']");id=n.getAttribute("data-listideas_id"),n.classList.add("selected"),n.scrollIntoView(),b.init(n),w.reset(t.getModel(),id)},h.show=function(e,t){var n=p.querySelector(".bydate"),r=p.querySelector(".byrating"),i=t.getAttribute("name");i!==T.getStack().getCurrentName&&(T.getStack().show(i),i==="#list-date"?(r.classList.remove("pushed"),n.classList.add("pushed")):(r.classList.add("pushed"),n.classList.remove("pushed")),h.displayHighlightedIdea())},h.mosaic=function(){var e=document.getElementById("ideas-detail");p.classList.toggle("mosaic"),e.classList.contains("invisible")?(e.classList.remove("invisible"),w.reset(E.getModel(),0)):e.classList.add("invisible")},h.plus=function(){o.get("newidea-popup").classList.add("appear"),o.get("cache").classList.add("appear")},h.search=function(e,t){var n;e.keyCode===13&&(t.value===""?(d.setAttribute("style","display: inline-block;"),v.setAttribute("style","display: inline-block;"),T.getStack().show("#list-date"),d.classList.add("pushed"),v.classList.remove("pushed"),h.displayHighlightedIdea()):(n=u.get("user").get("_id").replace(/@/,"at"),h.searchIdea("users:"+n+" AND "+t.value)),t.blur())},h.searchIdea=function(t){d.setAttribute("style","display: none;"),v.setAttribute("style","display: none;"),x.resetQuery({q:t,sort:"\\creation_date<date>",include_docs:!0}).then(function(){T.getStack().show("#list-search"),x.getModel().getNbItems()>0?(m.set("search",x.getModel().get(0).doc.title),document.getElementById("noresult").classList.add("invisible"),h.displayHighlightedIdea()):document.getElementById("noresult").classList.remove("invisible")})},h.reset=function(){m.set("search",""),x.resetQuery({q:"init_listSearch_UI",sort:"\\creation_date<date>",limit:30,include_docs:!0}),S.resetQuery({startkey:'["'+u.get("user").get("_id")+'",{}]',endkey:'["'+u.get("user").get("_id")+'"]',descending:!0,include_docs:!0}),E.resetQuery({key:u.get("uid"),descending:!0,include_docs:!0}).then(function(){T.getStack().show("#list-date"),h.displayHighlightedIdea()})},p=h.dom,d=p.querySelector(".bydate"),v=p.querySelector(".byrating"),E=new f(g,"library","_view/ideas",{key:u.get("uid"),descending:!0}),x=new f("_fti/local/"+g,"indexedideas","userbyname",{q:"init_listSearch_UI",sort:"\\creation_date<date>",limit:30,include_docs:!0}),S=new f(g,"ideas","_view/privatebyvotes",{startkey:'["'+u.get("user").get("_id")+'",{}]',endkey:'["'+u.get("user").get("_id")+'"]',descending:!0}),T.getStack().add("#list-date",E),T.getStack().add("#list-rating",S),T.getStack().add("#list-search",x),S.init(),E.init().then(function(){T.getStack().show("#list-date"),h.displayHighlightedIdea()}),h}});