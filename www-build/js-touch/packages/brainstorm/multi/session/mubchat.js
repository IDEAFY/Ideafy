/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","CouchDBDocument","Store","Bind.plugin","Event.plugin","service/avatar","service/utils","lib/spin.min","Promise"],function(e,t,n,r,i,s,o,u,a,f){function l(){var e=this,l=new r([]),c=new n,h=t.get("labels"),p=t.get("user"),d="null",v=(new a({color:"#9AC9CD",lines:10,length:10,width:6,radius:10,top:20})).spin();c.setTransport(t.get("transport")),e.plugins.addAll({labels:new i(h),model:new i(c,{setReadonly:function(e){e?(this.setAttribute("contenteditable",!1),this.setAttribute("style","display:none;")):(this.setAttribute("style","disaply:table-cell;"),this.setAttribute("contenteditable",!0))},setHeight:function(e){e?this.classList.add("extended"):this.classList.remove("extended")}}),chat:new i(l,{setLiStyle:function(e){e===d?this.setAttribute("style","text-align: right;"):this.setAttribute("style","text-align: left;")},setInnerMsgStyle:function(e){e==="SYS"?this.setAttribute("style","background: none; border: none"):e===d?this.setAttribute("style","background: #9AC9CD; border: 1px solid #808080; border-radius: 5px;"):this.setAttribute("style","background: #E6E6E6; border: 1px solid #808080; border-radius: 5px;float: left;max-width: 556px;")},setTime:function(e){e&&(this.innerHTML=u.formatTime(e))},setAvatar:function(e){var t,n,r;e==="SYS"?(this.classList.remove("invisible"),this.classList.add("doctor-deedee")):e===d?this.classList.add("invisible"):typeof e=="number"&&(this.classList.remove("invisible"),t=document.createDocumentFragment(),r=c.get("users")[e].userid,n=new o([r]),n.place(t),this.hasChildNodes()?this.replaceChild(t,this.firstChild):this.appendChild(t))},setUserName:function(e){typeof e=="number"&&e!==d&&(this.innerHTML=" "+c.get("users")[e].username+h.get("said"))},setMsg:function(e){var t,n;e?(this.innerHTML=e,this.setAttribute("style","color: #292929; font-size: 14px;")):(this.setAttribute("style","color: #CCCCCC; font-size: 12px;"),t=this.getAttribute("data-chat_id"),n=l.get(t).type,n<=3?this.innerHTML=c.get("users")[l.get(t).arg].username+h.get("chatmsg"+n):n===5?this.innerHTML=h.get("chatmsg"+n)+h.get(l.get(t).arg):this.innerHTML=h.get("chatmsg"+n))}}),chatevent:new s(e)}),e.template='<div class="mubchat"><div id="chatspinner"></div><div class="chatread" data-model="bind:setHeight, readonly"><ul class="chatmessages" data-chat="foreach"><li data-chat="bind:setLiStyle, user"><div class="container" data-chat="bind:setAvatar, user"></div><div class="innerchatmsg" data-chat="bind:setInnerMsgStyle, user"><span class="time" data-chat="bind: setTime, time"></span><span class="username" data-chat="bind:setUserName, user"></span><br/><span class="chatmsg" data-chat="bind: setMsg, msg"></span></div></li></ul></div><div class="chatwrite placeholder" data-model="bind:setReadonly, readonly" data-labels="bind:innerHTML, typemsg" data-chatevent = "listen:touchstart, removePlaceholder; listen: keypress, post"></div></div>',e.removePlaceholder=function(e,t){t.innerHTML===h.get("typemsg")&&(t.innerHTML="",t.classList.remove("placeholder"))},e.post=function(t,n){var r,i,s;t.keyCode===13&&n.innerHTML!==""&&(r=(new Date).getTime(),i=c.get("msg"),l.alter("push",{user:d,time:r,msg:n.innerHTML}),s=l.getNbItems()-1,e.dom.querySelector("li[data-chat_id='"+s+"']").scrollIntoView(),i.push({user:d,time:r,msg:n.innerHTML}),c.set("msg",i),n.innerHTML=h.get("typemsg"),n.classList.add("placeholder"),n.blur(),c.upload())},e.setReadonly=function(){c.set("readonly",!0)},e.conclude=function(n){e.setReadonly(),e.setMessage(n)},e.setMessage=function(n,r){var i=(new Date).getTime(),s=c.get("msg"),o,u,a=new f;switch(n){case"start":u={user:"SYS",time:i,type:4};break;case"leave":u={user:"SYS",type:2,time:i,arg:d};break;case"next":u={user:"SYS",type:6,time:i};break;case"initStep":u={user:"SYS",type:5,time:i,arg:r};break;default:}return l.alter("push",u),o=l.getNbItems()-1,e.dom.querySelector("li[data-chat_id='"+o+"']").scrollIntoView(),s.push(u),c.set("msg",s),c.upload().then(function(){a.fulfill()}),a},e.clear=function(){l.reset([])},e.reset=function(r){var i=new f;return d="null",e.dom.querySelector(".chatwrite").classList.add("placeholder"),e.dom.querySelector(".chatwrite").innerHTML=h.get("typemsg"),c.unsync(),c.reset({}),l.reset([]),v.spin(e.dom.querySelector("#chatspinner")),c.sync(t.get("db"),r).then(function(){var t,n=c.get("users");for(t=0;t<n.length;t++)if(n[t].userid===p.get("_id")){d=t;break}isNaN(d)&&!c.get("readonly")?e.joinChat().then(function(){v.stop(),i.fulfill()}):(l.reset(c.get("msg")),v.stop(),i.fulfill())}),i},e.joinChat=function(){var t=new f,n=c.get("users"),r=n.length,i=(new Date).getTime(),s=c.get("msg");return n.push({username:p.get("username"),userid:p.get("_id")}),c.set("users",n),c.get("_id").search("_0")>-1&&(s.push({user:"SYS",time:i,type:1,arg:r}),c.set("msg",s),l.reset(s)),c.upload().then(function(){d=r,t.fulfill()}),t},e.leave=function(){var n=new f,r=null,i,s=c.get("users");return e.setMessage("leave").then(function(){return c.upload()}).then(function(){n.fulfill(),c.unsync(),c.reset(),l.reset([])}),n},e.cancel=function(){c.remove(),c.unsync(),c.reset({}),l.reset([])},e.getModel=function(){return c},c.watchValue("msg",function(t){var n=t.length-1;l.reset(t),e.dom.querySelector("li[data-chat_id='"+n+"']").scrollIntoView()})}return function(){return l.prototype=new e,new l}});