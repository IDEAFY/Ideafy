/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","CouchDBView","service/config","Bind.plugin","Event.plugin","service/utils","service/avatar","service/actionbar","Promise"],function(e,t,n,r,i,s,o,u,a){function f(e,o,f,l){var c=new t([]),h,p,d=!1,v=null,m={db:e,view:f,design:o,query:{descending:!0,limit:50}};c.setTransport(n.get("transport")),l&&(m.query=l),this.template="<div><div id='noresult' class='date invisible' data-labels='bind:innerHTML,noresult' ></div><ul class='idea-list' data-listideas='foreach'><li class='list-item' data-listevent='listen:touchstart, setStart; listen:touchmove, showActionBar'><div class='item-header'><div class='avatar' data-listideas='bind:setAvatar,value.doc.authors'></div><h2 data-listideas='bind:innerHTML,value.doc.authornames'></h2><span class='date' data-listideas='bind:date,value.doc.creation_date'></span></div><div class='item-body'><h3 data-listideas='bind:innerHTML,value.doc.title'>Idea title</h3><p data-listideas='bind:innerHTML,value.doc.description'></p></div><div class='item-footer'><a class='idea-type'></a><a class='item-acorn'></a><span class='rating' data-listideas='bind:setRating, value.rating'></span> </div></li></ul></div>",m.query.q&&(this.template="<div><div id='noresult' class='date invisible' data-labels='bind:innerHTML,noresult' ></div><ul class='idea-list' data-listideas='foreach'><li class='list-item' data-listevent='listen:touchstart, setStart; listen:touchmove, showActionBar'><div class='item-header'><div class='avatar' data-listideas='bind:setAvatar,doc.authors'></div><h2 data-listideas='bind:innerHTML,doc.authornames'></h2><span class='date' data-listideas='bind:date,doc.creation_date'></span></div><div class='item-body'><h3 data-listideas='bind:innerHTML,doc.title'>Idea title</h3><p data-listideas='bind:setDesc,doc.description'></p></div><div class='item-footer'><a class='idea-type'></a><a class='item-acorn'></a><span class='rating' data-listideas='bind:setRating, rating'></span> </div></li></ul></div>"),this.plugins.addAll({labels:new r(n.get("labels")),listideas:new r(c,{date:function g(g){this.innerHTML=s.formatDate(g)},setDesc:function(e){this.innerHTML=e.replace(/\n/g,"<br>")},setRating:function(t){if(t===undefined){var n=this.getAttribute("data-listideas_id"),r=c.get(n).doc.votes||[];r.length===0?this.innerHTML="":this.innerHTML=Math.round(r.reduce(function(e,t){return e+t})/r.length*100)/100}else this.innerHTML=t},setAvatar:function(t){var n,r}}),listevent:new i(this)}),this.getModel=function(){return c},this.resetQuery=function(e){var t=new a;return m.query=e,c.unsync(),c.reset([]),c.sync(m.db,m.design,m.view,m.query).then(function(){t.fulfill()}),t},this.setStart=function(e,t){h=[e.pageX,e.pageY],v&&this.hideActionBar(v)},this.showActionBar=function(e,t){var n=t.getAttribute("data-listideas_id"),r=document.getElementById("public");p=[e.pageX,e.pageY];if(!r.classList.contains("mosaic")&&!d&&h[0]-p[0]>40&&p[1]-h[1]<20&&p[1]-h[1]>-20){var i=new u("idea",t,c.get(n).id,this.hideActionBar),s=document.createDocumentFragment();i.place(s),t.appendChild(s),v=i,d=!0}},this.hideActionBar=function(t){var n=t.dom.parentElement;n.removeChild(n.lastChild),d=!1,v=null},this.init=function(){var t=new a;return c.sync(m.db,m.design,m.view,m.query).then(function(){t.fulfill()}),t}}return function(n,r,i,s){return f.prototype=new e,new f(n,r,i,s)}});