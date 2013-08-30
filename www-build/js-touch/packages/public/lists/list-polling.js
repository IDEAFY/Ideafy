/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","CouchDBView","Store","service/config","Bind.plugin","Event.plugin","service/utils","service/avatar","service/actionbar","Promise"],function(e,t,n,r,i,s,o,u,a,f){function l(e,n,u,l){var c=new t([]),h,p,d,v=null,m=r.get("user"),g={db:e,view:u,design:n,query:{descending:!0,limit:50}},y=this;this.template="<ul class='idea-list' data-listideas='foreach'><li class='list-item' data-listevent='listen:touchstart, setStart; listen:touchmove, showActionBar'><div class='item-header'><div class='avatar' data-listideas='bind:setAvatar,value.doc.authors'></div><h2 data-listideas='bind:innerHTML,value.doc.authornames'></h2><span class='date' data-listideas='bind:date,value.doc.creation_date'></span></div><div class='item-body'><h3 data-listideas='bind:innerHTML,value.doc.title'>Idea title</h3><p data-listideas='bind:setDesc,value.doc.description'></p></div><div class='item-footer'><a class='idea-type'></a><a class='item-acorn'></a><span class='rating' data-listideas='bind:setRating, value.rating'></span> </div></li></ul>",this.plugins.addAll({listideas:new i(c,{date:function(t){this.innerHTML=o.formatDate(t)},setDesc:function(e){this.innerHTML=e.replace(/\n/g,"<br>")},setRating:function(t){if(t===undefined){var n=this.getAttribute("data-listideas_id"),r=c.get(n).doc.votes||[];r.length===0?this.innerHTML="":this.innerHTML=Math.round(r.reduce(function(e,t){return e+t})/r.length*100)/100}else this.innerHTML=t},setAvatar:function(t){var n,r}}),listevent:new s(this)}),this.getModel=function(){return c},y.resetQuery=function(n){var i=new f,s=m.get("settings").polling_interval||r.get("polling_interval"),o=new t;return n&&(g.query=n),clearInterval(d),o.setTransport(r.get("transport")),o.sync(g.db,g.design,g.view,g.query).then(function(){v&&v.hide(),c.reset(JSON.parse(o.toJSON())),o.unsync(),d=setInterval(function(){o.reset([]),o.sync(g.db,g.design,g.view,g.query).then(function(){v&&v.hide(),c.reset(JSON.parse(o.toJSON())),o.unsync()})},s),i.fulfill()}),i},this.setStart=function(e,t){h=[e.pageX,e.pageY],v&&v.hide()},this.showActionBar=function(e,t){var n=t.getAttribute("data-listideas_id"),r=document.getElementById("public"),i,s=!1;p=[e.pageX,e.pageY],v&&v.getParent()===t&&(s=!0),!s&&h[0]-p[0]>40&&p[1]-h[1]<20&&p[1]-h[1]>-20&&(v=new a("idea",t,c.get(n).id),i=document.createDocumentFragment(),v.place(i),t.appendChild(i))},l&&(g.query=l),this.init=function(){var n=new f,i=m.get("settings").polling_interval||r.get("polling_interval"),s=new t;return s.setTransport(r.get("transport")),s.sync(g.db,g.design,g.view,g.query).then(function(){c.reset(JSON.parse(s.toJSON())),s.unsync(),d=setInterval(function(){s.reset([]),s.sync(g.db,g.design,g.view,g.query).then(function(){c.reset(JSON.parse(s.toJSON())),s.unsync()})},i),n.fulfill()}),n},m.watchValue("settings",function(){var e=new t,n;m.get("settings").polling_interval!==r.get("polling_interval")&&(r.set("polling_interval",m.get("settings").polling_interval),n=r.get("polling_interval"),clearInterval(d),e.setTransport(r.get("transport")),d=setInterval(function(){e.reset(),e.sync(g.db,g.design,g.view,g.query).then(function(){v&&v.hide(),c.reset(JSON.parse(e.toJSON())),e.unsync()})},n))}),r.get("observer").watch("update-polling",function(){y.resetQuery()})}return function(n,r,i,s){return l.prototype=new e,new l(n,r,i,s)}});