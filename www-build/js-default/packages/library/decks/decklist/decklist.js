/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","service/config","Bind.plugin","Event.plugin","Store","CouchDBBulkDocuments","Promise","service/utils"],function(e,t,n,r,i,s,o,u,a){return function(u){var f=new e,l=n.get("labels"),c=n.get("user"),h=new s([]);return f.plugins.addAll({labels:new r(l),active:new r(c,{}),decks:new r(h,{setVersion:function(e){e?this.innerHTML=l.get("version")+e:this.innerHTML=""},setAuthor:function(e){e==="Taiaut"?(this.innerHTML="",this.setAttribute("style","background-image:url('img/logo.png');")):this.innerHTML=e},date:function(e){e?this.innerHTML=a.formatDate(e):this.innerHTML=""}}),decksevent:new i(f)}),f.template='<ul id="deck-list" data-decks="foreach"><li class="list-item"><div class = "decklight"></div><div class="item-header"><h3 data-decks="bind:innerHTML, title"></h3><span class="version" data-decks="bind:setVersion, version"></span></div><div class="item-body"><p data-decks="bind:innerHTML,description"></p></div><div class="item-footer"><label data-labels="bind:innerHTML, designedby"></label><div class="author" data-decks="bind:setAuthor, author"></div><span class="date" data-decks="bind:date, date"></div></div></li></ul>',f.reset=function(t){var n=t||null;h.reset([]),f.getDecks(u,n)},f.getModel=function(){return h},f.getDecks=function(t,r){var i=new o,s=[];switch(t){default:s=c.get("taiaut_decks").concat(c.get("custom_decks"))}i.setTransport(n.get("transport")),i.sync(n.get("db"),{keys:s}).then(function(){var e=c.get("lang"),t=[];i.loop(function(n,r){!n.doc.default_lang||n.doc.default_lang===e?t.push(n.doc):n.doc.translations&&n.doc.translations[e]?t.push(n.doc.translations[e]):t.push(n.doc)}),t.sort(function(e,t){var n=e.title,r=t.title;if(n<r)return-1;if(n>r)return 1;if(n===r)return 0}),h.reset(t),r&&r("ok"),i.unsync()})},f.getImportableDecks=function(){var t=[];return h.loop(function(e,n){(e.public||e.created_by===c.get("_id")||e.sharedwith.indexOf(c.get("_id")))&&t.push(e)}),t},f.initSelected=function(t,n){var r=f.dom,i=r.querySelector(".list-item[data-decks_id='"+n+"']");t(i),i.classList.add("selected")},f.highlightDeck=function(t,n){var r=f.dom,i,s;return n===0?(i=r.querySelector(".list-item[data-decks_id='0']"),s=0):(h.loop(function(e,t){e._id===n&&(s=t)}),i=r.querySelector(".list-item[data-decks_id='"+s+"']")),t(i),i.classList.add("selected"),i.scrollIntoView(),s},f.init=function(t){f.reset(t)},c.watchValue("lang",function(){f.getDecks(u)}),f}});