/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","service/map","Store","Bind.plugin","Place.plugin","Event.plugin","service/avatar"],function(e,t,n,r,s,o,u,a){return function(){var f=new e,c=new e,h=t.get("user"),p=t.get("observer"),d=t.get("labels"),v=0,m=0,g=!0,y=new r({unread:0,newmsg:!1}),b=new r([]);return f.plugins.addAll({notif:new s(y,{flashNew:function(e){var t,n=this;e&&(t=setInterval(function(){n.classList.contains("orange")?n.classList.remove("orange"):n.classList.add("orange")},600),setTimeout(function(){clearInterval(t),n.classList.remove("orange"),y.set("newmsg",!1)},3e3))}}),place:new o({notifyPopup:c}),notifevent:new u(f)}),f.template='<div><div class = "notif-bubble" data-notif="bind:innerHTML, unread"></div><div class="deedee" data-notif="bind:flashNew, newmsg" data-notifevent="listen: touchstart, push; listen:touchend, showPopup"></div><div class = "signout-bubble" data-notifevent="listen:touchstart, signout"></div><div class = "info-bubble" data-notifevent="listen:touchstart, press; listen:touchend, showAbout">i</div><div id="notify-popup" data-place="place:notifyPopup"></div></div>',f.getUnread=function(){var t=h.get("notifications"),n=0;for(i=0,l=t.length;i<l;i++)t[i].status==="unread"&&n++;return n},f.push=function(e,t){t.classList.add("orange"),e.stopPropagation()},f.press=function(e,t){t.classList.add("pressed")},f.showPopup=function(e,t){t.classList.remove("orange"),c.showPopup()},f.signout=function(n,r){document.getElementById("cache").classList.add("appear"),document.getElementById("dock").querySelector(".selected").classList.remove("selected"),document.querySelector('a[href="#public"]').classList.add("selected"),t.get("observer").notify("signout")},f.showAbout=function(e,n){n.classList.remove("pressed"),t.get("observer").notify("goto-screen","#dashboard"),t.get("observer").notify("show-about")},c.plugins.addAll({labels:new s(d),notify:new s(b,{setObject:function(e){var t=this.getAttribute("data-notify_id");if(e)switch(e){case"CXR":this.innerHTML=b.get(t).username+d.get("CXRobject");break;case"INV":this.innerHTML=b.get(t).username+d.get("INVObject");break;case"CXRaccept":this.innerHTML=b.get(t).username+d.get("acceptedCXR");break;case"CXRreject":this.innerHTML=b.get(t).username+d.get("rejectedCXR");break;case"CXCancel":this.innerHTML=b.get(t).username+d.get("canceledCX");break;case"DOC":this.innerHTML=b.get(t).username+d.get("sentdocmsg");break;case"2Q+":this.innerHTML=b.get(t).username+d.get("askednew");break;case"2C+":this.innerHTML=b.get(t).username+d.get("senttc");break;case"REF":this.innerHTML=b.get(t).username+d.get("joinedideafy");break;default:this.innerHTML=b.get(t).object}},setStyle:function(e){e==="unread"?this.setAttribute("style","font-weight: bold;"):this.setAttribute("style","font-weight: normal;")},setAvatar:function(e){var t,n,r=this;e&&(t=document.createDocumentFragment(),n=new a([e]),n.place(t),r.firstChild?r.replaceChild(t,r.firstChild):r.appendChild(t))}}),notifyevent:new u(c)}),c.template='<div class="invisible"><div class="notify-header" data-labels="bind:innerHTML, notificationlbl" data-notifyevent="listen:touchstart, closePopup"></div><ul class="notify-list" data-notify="foreach: messages, 0, 7"><li data-notify="bind: setStyle, status" data-notifyevent="listen:touchstart, displayComCenter"><div data-notify="bind:setAvatar, author"></div><p><span class="notify-name" data-notify="bind:innerHTML, firstname"></span> : <span class="notify-body" data-notify="bind:setObject, type"></span></p></li></ul></div>',c.closePopup=function(t,n){c.dom.classList.add("invisible")},c.showPopup=function(t,n){c.dom.classList.remove("invisible")},c.displayComCenter=function(t,n){var r=n.getAttribute("data-notify_id");p.notify("display-message",r)},p.watch("display-message",function(){c.closePopup()}),f.init=function(){f.reset(),c.dom.classList.add("invisible")},f.reset=function(){m=f.getUnread(),y.set("unread",m),y.set("newmsg",!1),b.reset(h.get("notifications"))},h.watchValue("notifications",function(){var e=f.getUnread();b.reset([]),e>m?(y.set("newmsg",!0),y.set("unread",e),m=e,h.get("settings")&&h.get("settings").notifyPopup&&popup.classList.add("show-notify")):e<m&&(y.set("unread",e),m=e),b.reset(h.get("notifications"))}),f}});