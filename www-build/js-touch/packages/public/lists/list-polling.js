/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","CouchDBView","Store","service/config","Bind.plugin","Event.plugin","service/utils","service/avatar","service/actionbar","Promise"],function(e,t,n,r,i,s,o,u,a,f){function l(e,n,u,l){var c=new t([]),h,p,d,v=!1,m=null,g=r.get("user"),y={db:e,view:u,design:n,query:{descending:!0,limit:50}},b=this;this.template="<ul class='idea-list' data-listideas='foreach'><li class='list-item' data-listevent='listen:touchstart, setStart; listen:touchmove, showActionBar'><div class='item-header'><div class='avatar' data-listideas='bind:setAvatar,value.doc.authors'></div><h2 data-listideas='bind:innerHTML,value.doc.authornames'></h2><span class='date' data-listideas='bind:date,value.doc.creation_date'></span></div><div class='item-body'><h3 data-listideas='bind:innerHTML,value.doc.title'>Idea title</h3><p data-listideas='bind:setDesc,value.doc.description'></p></div><div class='item-footer'><a class='idea-type'></a><a class='item-acorn'></a><span class='rating' data-listideas='bind:setRating, value.rating'></span> </div></li></ul>",this.plugins.addAll({listideas:new i(c,{date:function(t){this.innerHTML=o.formatDate(t)},setDesc:function(e){this.innerHTML=e.replace(/\n/g,"<br>")},setRating:function(t){if(t===undefined){var n=this.getAttribute("data-listideas_id"),r=c.get(n).doc.votes||[];r.length===0?this.innerHTML="":this.innerHTML=Math.round(r.reduce(function(e,t){return e+t})/r.length*100)/100}else this.innerHTML=t},setAvatar:function(t){var n,r}}),listevent:new s(this)}),this.getModel=function(){return c},b.resetQuery=function(n){var i=new f,s=g.get("settings").polling_interval||r.get("polling_interval"),o=new t;return n&&(y.query=n),clearInterval(d),o.setTransport(r.get("transport")),o.sync(y.db,y.design,y.view,y.query).then(function(){c.reset(JSON.parse(o.toJSON())),o.unsync(),d=setInterval(function(){o.reset([]),o.sync(y.db,y.design,y.view,y.query).then(function(){c.reset(JSON.parse(o.toJSON())),o.unsync()})},s),i.fulfill()}),i},this.setStart=function(e,t){h=[e.pageX,e.pageY],m&&this.hideActionBar(m)},this.showActionBar=function(e,t){var n=t.getAttribute("data-listideas_id"),r=document.getElementById("public");p=[e.pageX,e.pageY];if(!r.classList.contains("mosaic")&&!v&&h[0]-p[0]>40&&p[1]-h[1]<20&&p[1]-h[1]>-20){var i=new a("idea",t,c.get(n).id,this.hideActionBar),s=document.createDocumentFragment();i.place(s),t.appendChild(s),m=i,v=!0}},this.hideActionBar=function(t){var n=t.dom.parentElement;n.removeChild(n.lastChild),v=!1,m=null},l&&(y.query=l),this.init=function(){var n=new f,i=g.get("settings").polling_interval||r.get("polling_interval"),s=new t;return s.setTransport(r.get("transport")),s.sync(y.db,y.design,y.view,y.query).then(function(){c.reset(JSON.parse(s.toJSON())),s.unsync(),d=setInterval(function(){s.reset([]),s.sync(y.db,y.design,y.view,y.query).then(function(){c.reset(JSON.parse(s.toJSON())),s.unsync()})},i),n.fulfill()}),n},g.watchValue("settings",function(){var e=new t,n;g.get("settings").polling_interval!==r.get("polling_interval")&&(r.set("polling_interval",g.get("settings").polling_interval),n=r.get("polling_interval"),clearInterval(d),e.setTransport(r.get("transport")),d=setInterval(function(){e.reset(),e.sync(y.db,y.design,y.view,y.query).then(function(){c.reset(JSON.parse(e.toJSON())),e.unsync()})},n))}),r.get("observer").watch("update-polling",function(){b.resetQuery()})}return function(n,r,i,s){return l.prototype=new e,new l(n,r,i,s)}});