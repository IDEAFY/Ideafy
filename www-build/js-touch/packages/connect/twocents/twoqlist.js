/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Store","CouchDBView","service/config","Bind.plugin","Event.plugin","service/utils","service/avatar","service/actionbar","Promise"],function(e,t,n,r,i,s,o,u,a,f){function l(e,l,c,h,p){var d=new n([]),v=new t([]),m,g,y="",b=null,w={db:l,view:h,design:c,query:{descending:!0}},E=r.get("labels"),S=this;d.setTransport(r.get("transport")),e==="contact"?y="contacttwoqlist":y="",this.template='<div><ul class="twoq-list '+y+'" data-twoqlist="foreach"><li class="list-item" data-twoqlistevent="listen:touchstart, setStart"><div class="item-header"><span class="date" data-twoqlist="bind:date,value.creation_date"></span></div><div class="item-body"><p data-twoqlist="bind:innerHTML,value.question"></p></div><div class="item-footer"><a class="item-twocent"></a><span class="replies" data-twoqlist="bind:showReplies, value.twocents"></span></div></li></ul><ul class="twoq-searchlist invisible '+y+'" data-twoqsearch="foreach"><li class="list-item" data-twoqlistevent="listen:touchstart, setStart"><div class="item-header"><span class="date" data-twoqsearch="bind:date,value.creation_date"></span></div><div class="item-body"><p data-twoqsearch="bind:innerHTML,value.question"></p></div><div class="item-footer"><a class="item-twocent"></a><span class="replies" data-twoqsearch="bind:showReplies, value.twocents"></span></div></li></ul></div>',this.plugins.addAll({twoqlist:new i(d,{date:function x(x){x?this.innerHTML=o.formatDate(x):this.innerHTML=""},showReplies:function(t){var n;t&&(n=t.length),n===0?this.innerHTML=E.get("noreplyyet"):n===1?this.innerHTML=n+" "+E.get("showonetcreply"):n>1&&(this.innerHTML=n+" "+E.get("showtcrepliesafter"))},setAvatar:function(t){var n,r;t&&(r=document.createDocumentFragment(),n=new u([t]),n.place(r),this.hasChildNodes()?this.replaceChild(r,this.firstChild):this.appendChild(r))},setVisibility:function(e){e&&e==="public"?this.classList.add("public"):this.classList.remove("public")}}),twoqsearch:new i(v,{date:function T(T){T?this.innerHTML=o.formatDate(T):this.innerHTML=""},showReplies:function(t){var n;t&&(n=t.length),n===0?this.innerHTML=E.get("noreplyyet"):n===1?this.innerHTML=n+" "+E.get("showonetcreply"):n>1&&(this.innerHTML=n+" "+E.get("showtcrepliesafter"))},setAvatar:function(t){var n,r;t&&(r=document.createDocumentFragment(),n=new u([t]),n.place(r),this.hasChildNodes()?this.replaceChild(r,this.firstChild):this.appendChild(r))},setVisibility:function(e){e&&e==="public"?this.classList.add("public"):this.classList.remove("public")}}),twoqlistevent:new s(this)}),this.getModel=function(){var e,t;return t=!S.dom.querySelector(".twoq-searchlist").classList.contains("invisible"),t?e=v:e=d,e},this.resetQuery=function(e){var t=new f;return w.query=e,d.unsync(),d.reset([]),S.hideSearch(),d.sync(w.db,w.design,w.view,w.query).then(function(){b&&b.hide(),t.fulfill()}),t},this.setStart=function(e,t){m=[e.pageX,e.pageY],b&&(b.hide(),b=null)},this.showActionBar=function(e,t){var n=t.getAttribute("data-twoqlist_id"),r=document.getElementById("mtc-list"),i,s=!1;g=[e.pageX,e.pageY],b&&b.getParent()===t&&(s=!0),!s&&m[0]-g[0]>40&&g[1]-m[1]<20&&g[1]-m[1]>-20&&(b=new a("2Q",t,d.get(n)._id),i=document.createDocumentFragment(),b.place(i),t.appendChild(i))},this.showSearch=function(){var t=document.querySelector(".twoq-searchlist"),n=document.querySelector(".twoq-list");t&&t.classList.contains("invisible")&&(n.classList.add("invisible"),t.classList.remove("invisible"))},this.hideSearch=function(){var t=this.dom.querySelector(".twoq-searchlist"),n=this.dom.querySelector(".twoq-list");t&&!t.classList.contains("invisible")&&(n.classList.remove("invisible"),t.classList.add("invisible"))},this.search=function(t){v.reset([]),t.toLowerCase()?(this.showSearch(),d.loop(function(e,n){JSON.stringify(e).search(t)>-1&&v.alter("push",e)})):this.hideSearch()},p&&(w.query=p),this.init=function(){var t=new f;return d.sync(w.db,w.design,w.view,w.query).then(function(){t.fulfill()}),t}}return function(n,r,i,s,o){return l.prototype=new e,new l(n,r,i,s,o)}});