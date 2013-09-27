/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Amy/Control-plugin","Bind.plugin","Place.plugin","Amy/Delegate-plugin","Store","service/map","service/config","./idea-stack","./lists/idealist","Amy/Stack-plugin","lib/spin.min"],function(e,t,n,r,i,s,o,u,a,f,l,c){return function(){var p=new e,d=new s({search:""}),v=u.get("db"),m=u.get("observer"),g=new t(p),y=new a,b,w,E,S,x,T,N=u.get("user"),C=u.get("labels"),k=N.get("lang").substring(0,2),L=new s([{name:"#list-fav",css:"byfav",pushed:!1,lang:null},{name:"#list-date",css:"bydate",pushed:!0,lang:null},{name:"#list-rating",css:"byrating",pushed:!1,lang:null},{name:"#lang",css:"bylang",pushed:!1,lang:k}]),A=new s([{name:"*"}]),O=u.get("userLanguages"),M=new l,_=(new c({color:"#808080",lines:10,length:12,width:6,radius:10,top:328})).spin();return O.forEach(function(e){A.alter("push",e)}),p.template='<div id = "ideas"><div id="idea-list" class="list"><div class="header blue-light"><div class="option left" data-ideascontrol="toggle:.option.left,mosaic,touchstart,mosaic"></div><span data-label="bind: innerHTML, idealistheadertitle">My Ideas</span><div class="option right" data-ideasevent="listen: touchstart, plus"></div></div><div data-idealiststack="destination" data-ideascontrol="radio:li.list-item,selected,touchstart,selectStart"><div class="tools"><input class="search" type="text" data-search="bind: value, search" data-label="bind: placeholder, searchprivateplaceholder" data-ideasevent="listen: keypress, search"><ul class="listbtns" data-listbtns="foreach"><li class="tools-button" data-listbtns="bind:setName, name; bind:setClass, css; bind:setPushed, pushed; bind:setLang, lang" data-ideasevent="listen:touchstart,show"></li></ul><ul class="langlist invisible" data-select="foreach"><li data-select="bind: setBg, name" data-ideasevent="listen: touchstart, setLang; listen:touchend, stopPropagation"></li></ul></div></div></div><div id="ideas-detail" class="details" data-ideaplace="place:details"></div></div>',p.plugins.addAll({idealiststack:M,listbtns:new n(L,{setPushed:function(e){e?this.classList.add("pushed"):this.classList.remove("pushed")},setLang:function(e){e&&e!=="*"&&(this.setAttribute("style","background-image:url('img/flags/"+e+".png');"),this.innerHTML=""),e==="*"&&(this.setAttribute("style","background-image: none;"),this.innerHTML="*")},setClass:function(e){e&&this.classList.add(e)},setName:function(e){e&&this.setAttribute("name",e)}}),select:new n(A,{setBg:function(e){e==="*"?(this.setAttribute("style","background-image: none;background: whitesmoke;"),this.innerHTML="*"):this.setAttribute("style","background-image:url('img/flags/"+e+".png');")}}),label:new n(C),search:new n(d),ideasevent:new i(p),ideaplace:new r({details:y}),ideascontrol:g}),p.place(o.get("ideas")),p.selectStart=function(e){var t=M.getStack().getCurrentScreen().getModel(),n=e.target.getAttribute("data-listideas_id");y.reset(t,n),d.set("search","")},p.displayHighlightedIdea=function(){var t=M.getStack().getCurrentScreen(),n=t.dom.querySelector(".list-item.selected")||t.dom.querySelector("li[data-listideas_id='0']"),r;n?(r=n.getAttribute("data-listideas_id"),n.classList.add("selected"),n.scrollIntoView(),g.init(n),y.reset(t.getModel(),r)):y.displayEmpty(M.getStack().getCurrentName())},p.show=function(e,t){var n=parseInt(t.getAttribute("data-listbtns_id"),10),r=L.get(n).name,i=M.getStack();r==="#lang"?p.dom.querySelector(".langlist").classList.remove("invisible"):(L.loop(function(e,t){t===n?L.update(t,"pushed",!0):L.update(t,"pushed",!1)}),r!==i.getCurrentName&&(i.show(r),i.get(r).getModel().getNbItems()?p.displayHighlightedIdea():y.displayEmpty(r)))},p.setLang=function(e,t){var n,r;e.stopPropagation(),e.preventDefault(),n=t.getAttribute("data-select_id"),r=A.get(n).name,k=r,_.spin(document.getElementById("idea-list")),L.loop(function(e,t){e.name==="#lang"&&L.update(t,"lang",r)}),p.dom.querySelector(".langlist").classList.add("invisible"),["#list-rating","#list-fav","#list-date"].forEach(function(e){var t=M.getStack();t.get(e).setLang(r).then(function(){t.getCurrentName()===e&&_.stop(),t.getCurrentName()===e&&t.get(e).getModel().getNbItems()===0?y.displayEmpty(e):p.displayHighlightedIdea()})})},p.stopPropagation=function(e,t){e.stopPropagation(),e.preventDefault()},p.mosaic=function(){var e=document.getElementById("ideas-detail");p.dom.classList.toggle("mosaic"),e.classList.contains("invisible")?(e.classList.remove("invisible"),y.reset(b.getModel(),0)):e.classList.add("invisible")},p.plus=function(){o.get("newidea-popup").classList.add("appear"),o.get("cache").classList.add("appear")},p.search=function(e,t){var n;e.keyCode===13&&(t.value===""?(p.dom.querySelector(".listbtns").classList.remove("invisible"),M.getStack().show("#list-date"),L.loop(function(e,t){e.name==="#list-date"?L.update(t,"pushed",!0):L.update(t,"pushed",!1)}),p.displayHighlightedIdea()):(n=N.get("_id").replace(/@/,"at"),p.searchIdea("users:"+n+" AND "+t.value)),t.blur())},p.searchIdea=function(t){p.dom.querySelector(".listbtns").classList.add("invisible"),E.resetQuery({q:t,sort:"\\creation_date<date>",include_docs:!0}).then(function(){M.getStack().show("#list-search"),E.getModel().getNbItems()>0?(d.set("search",E.getModel().get(0).doc.title),p.dom.querySelector(".noresult").classList.add("invisible"),p.displayHighlightedIdea()):p.dom.querySelector(".noresult").classList.remove("invisible")})},p.reset=function(){d.set("search",""),E.resetQuery({q:"init_listSearch_UI",sort:"\\creation_date<date>",limit:30,include_docs:!0}),w.resetQuery({startkey:'["'+u.get("user").get("_id")+'",{}]',endkey:'["'+u.get("user").get("_id")+'"]',descending:!0,include_docs:!0}),b.resetQuery({key:'"'+N.get("_id")+'"',descending:!0,include_docs:!0}).then(function(){M.getStack().show("#list-date"),p.displayHighlightedIdea()})},N.get("settings").contentLang&&(k=N.get("settings").contentLang,k==="all"&&(k="*"),L.loop(function(e,t){e.name==="#lang"&&L.update(t,"lang",k)})),k==="*"?(x={key:'"'+N.get("_id")+'"',descending:!0},T={endkey:'[0,"'+N.get("_id")+'"]',startkey:'[0,"'+N.get("_id")+'",{},{}]',descending:!0}):(x={key:'[0,"'+N.get("_id")+'","'+k+'"]',descending:!0},T={endkey:'[1,"'+N.get("_id")+'","'+k+'"]',startkey:'[1,"'+N.get("_id")+'","'+k+'",{},{}]',descending:!0}),b=new f(v,"library","_view/ideas",x),E=new f("_fti/local/"+v,"indexedideas","userbyname",{q:"init_listSearch_UI",sort:"\\creation_date<date>",limit:30,include_docs:!0}),w=new f(v,"ideas","_view/privatebyvotes",T),S=new f(v,"library","_view/allideas","fav"),M.getStack().add("#list-date",b),M.getStack().add("#list-rating",w),M.getStack().add("#list-search",E),M.getStack().add("#list-fav",S),w.init(),b.init().then(function(){return M.getStack().show("#list-date"),b.getModel().getNbItems()?p.displayHighlightedIdea():y.displayEmpty("#list-date"),S.setLang(k)}).then(function(){N.watchValue("library-favorites",function(e){e.length!==S.getModel().getNbItems()&&S.resetQuery(k).then(function(){M.getStack().getCurrentName()==="#list-fav"&&(S.getModel().getNbItems()?p.displayHighlightedIdea():y.displayEmpty("#list-fav"))})}),N.watchValue("settings",function(e){e.contentLang?e.contentLang==="all"?k="*":k=e.contentLang:k=N.get("lang").substring(0,2),L.loop(function(e,t){e.name==="#lang"&&L.update(t,"lang",k)}),["#list-date","#list-rating","#list-fav"].forEach(function(e){M.getStack().get(e).setLang(k)})})}),p}});