/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","CouchDBDocument","Store","Promise","service/utils","Bind.plugin","Event.plugin","twocents/twocentreplylist","twocents/writetwocent","twocents/writetwocentreply","service/avatar"],function(e,t,n,r,i,s,o,u,a,f,l,c){function h(e){var h=this,p=new n,d=t.get("labels"),v=new r([]),m=t.get("transport"),g=t.get("user"),y,b=e;p.setTransport(m),h.plugins.addAll({labels:new o(t.get("labels")),twocents:new o(v,{date:function w(w){w&&(this.innerHTML=s.formatDate(w))},setFirstName:function(e){var n;e&&(e!==g.get("firstname")?this.innerHTML=e:(n=this.getAttribute("data-twocents_id"),v.get(n).author===g.get("_id")?this.innerHTML=t.get("labels").get("youlbl"):this.innerHTML=e))},setCommentlbl:function(e){var t;e&&(e!==g.get("firstname")?this.innerHTML=d.get("twocentcommentlbl"):(t=this.getAttribute("data-twocents_id"),v.get(t).author===g.get("_id")?this.innerHTML=d.get("youcommentedlbl"):this.innerHTML=d.get("twocentcommentlbl")))},setVisible:function(e){e&&(e===g.get("_id")?this.setAttribute("style","display: block;"):this.setAttribute("style","display: none;"))},setInVisible:function(e){e&&(e===g.get("_id")?this.setAttribute("style","display: none;"):this.setAttribute("style","display: block;"))},deleteOK:function(e){var t;e&&e.length>0?this.setAttribute("style","display: none;"):(t=this.getAttribute("data-twocents_id"),g.get("_id")===v.get(t).author?this.setAttribute("style","display: block;"):this.setAttribute("style","display: none;"))},toggleHideButton:function(e){!e||!e.length?this.classList.add("invisible"):(this.classList.remove("invisible"),e.length===1?this.innerHTML=t.get("labels").get("showonetcreply"):this.innerHTML=t.get("labels").get("showtcrepliesbefore")+e.length+t.get("labels").get("showtcrepliesafter"))},displayReplies:function(e){var t,n,r;!e||!e.length?this.classList.add("invisible"):(t=this.getAttribute("data-twocents_id"),n=new a(e,y,t,b),r=document.createDocumentFragment(),n.render(),n.place(r),this.hasChildNodes()?this.replaceChild(r,this.firstChild):this.appendChild(r),this.classList.remove("invisible"))},setAvatar:function(t){var n,r;t&&(n=document.createDocumentFragment(),r=new c([t]),r.place(n),this.hasChildNodes()?this.replaceChild(n,this.firstChild):this.appendChild(n))}}),twocentevent:new u(h)}),h.template='<ul class="twocentList" data-twocents="foreach"><li class="twocent"><div class="twocentHeader"><div class="twocentAvatar" data-twocents="bind: setAvatar, author"></div><div class="twocentAuthor"data-twocents="bind: setFirstName, firstname"></div><span class="commentLabel" data-twocents="bind: setCommentlbl, firstname"></span><br/><div class="twocentDate date" data-twocents="bind: date, date"></div><div class="twocentMenu"><div class="twocentButton twocentEditButton" data-twocents="bind: setVisible, author" data-twocentevent="listen: mousedown, edit"></div><div class="twocentButton twocentDeleteButton" data-twocents="bind: deleteOK, replies" data-twocentevent="listen: mousedown, deleteTwocent"></div><div class="twocentButton twocentReplyButton" data-twocents="bind: setInVisible, author" data-twocentevent="listen: mousedown, reply"></div></div></div><div class="twocentBody"><p class="twocentMessage" data-twocents="bind: innerHTML, message"></p><div class="repliesButton hideReplies" name="hide" data-twocents="bind: toggleHideButton, replies" data-twocentevent="listen: mousedown, toggleReplies" data-labels="bind:innerHTML, hidetwocentreplies"></div></div><div class="writePublicTwocentReply invisible"></div><div class="displayReplies" data-twocents="bind: displayReplies, replies"></div></li></ul>',h.edit=function(e,t){var n=t.getAttribute("data-twocents_id"),r=h.dom.children[n],i=new f,s=document.createDocumentFragment(),o=function(){h.dom.replaceChild(r,i.dom)};i.reset(y,v.get(n),n,o),i.render(),i.place(s),h.dom.replaceChild(s,r)},h.reset=function(n){var r=new i;return y=n,v.reset([]),p.unsync(),p.reset({}),p.sync(t.get("db"),y).then(function(){var e=p.get("twocents");e.length&&v.reset(p.get("twocents")),p.watchValue("twocents",function(e){v.reset(e)}),r.fulfill()},function(e){console.log(e)}),r},h.deleteTwocent=function(e,n){var r=n.getAttribute("data-twocents_id"),i={docId:y,type:"delete",position:r,twocent:{author:g.get("_id")}};alert("Are you sure?"),m.request("WriteTwocent",i,function(e){e!=="ok"&&alert(t.get("labels").get("somethingwrong"))})},h.reply=function(e,t){var n=t.getAttribute("data-twocents_id"),r=document.querySelector(".writePublicTwocentReply[data-twocents_id='"+n+"']"),i=new l(r),s=document.createDocumentFragment();i.reset(y,n),i.render(),i.place(s),r.hasChildNodes()||r.appendChild(s),r.classList.remove("invisible")},h.toggleReplies=function(e,t){var n=t.getAttribute("data-twocents_id"),r=v.get(n).replies,i=t.getAttribute("name"),s=document.querySelector(".displayReplies[data-twocents_id='"+n+"']");i==="show"?(s.classList.remove("invisible"),t.setAttribute("name","hide"),t.classList.remove("showReplies"),t.classList.add("hideReplies")):(s.classList.add("invisible"),t.setAttribute("name","show"),t.classList.remove("hideReplies"),t.classList.add("showReplies"))}}return function(n){return h.prototype=new e,new h(n)}});