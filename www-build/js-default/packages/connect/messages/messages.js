/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","Amy/Control-plugin","Amy/Stack-plugin","Store","service/config","service/avatar","service/utils","./message-detail","./newmessage","service/actionbar","Promise"],function(e,t,n,r,s,o,u,a,f,c,h,p,d,v){return function(){var g=new e,y=new s(g),b=new o,w=function(e){b.getStack().show(e)},E="#defaultPage",S=new e,x=new h(w),T=new p(w),N=new u([{name:"all",label:"allbtn",selected:!0},{name:"messages",label:"msgbtn",selected:!1},{name:"notifications",label:"notifbtn",selected:!1},{name:"unread",label:"unreadbtn",selected:!1}]),C=0,k=new u([]),L=a.get("labels"),A=null,O=a.get("user"),M=a.get("observer"),_=function(e){var t=N.get(e).name,n=O.get("notifications"),r,i=n.length,s=[];switch(t){case"messages":for(r=0;r<i;r++)n[r].type==="MSG"&&s.push(n[r]);break;case"notifications":for(r=0;r<i;r++)n[r].type!=="MSG"&&s.push(n[r]);break;case"unread":for(r=0;r<i;r++)n[r].status==="unread"&&s.push(n[r]);break;default:s=n}return s},D=function(e){var t=[],n=[];t=O.get("notifications").concat();if(e==="")n=t,N.update(0,"selected",!0),C=0;else for(i=0,l=t.length;i<l;i++)JSON.stringify(t[i]).toLowerCase().search(e.toLowerCase())>-1&&n.push(t[i]);return n};return g.plugins.addAll({label:new n(L),sort:new n(N,{setLabel:function(e){this.innerHTML=L.get(e)},setSelected:function(e){e?this.classList.add("pressed"):this.classList.remove("pressed")}}),msg:new n(k,{setObject:function(e){var t=this.getAttribute("data-msg_id");switch(e){case"INV":this.innerHTML=k.get(t).username+L.get("INVObject");break;case"CXR":this.innerHTML=k.get(t).username+L.get("CXRobject");break;case"CXRaccept":this.innerHTML=k.get(t).username+L.get("acceptedCXR");break;case"CXRreject":this.innerHTML=k.get(t).username+L.get("rejectedCXR");break;case"CXCancel":this.innerHTML=k.get(t).username+L.get("canceledCX");break;case"DOC":this.innerHTML=k.get(t).username+L.get("sentdocmsg");break;case"2Q+":this.innerHTML=k.get(t).username+L.get("askednew");break;case"2C+":this.innerHTML=k.get(t).username+L.get("senttc");break;case"REF":this.innerHTML=k.get(t).username+L.get("joinedideafy");break;default:this.innerHTML=k.get(t).object}},date:function P(P){var e=new Date;if(P&&P[0]===e.getFullYear()&&P[1]===e.getMonth()&&P[2]===e.getDate()){var t=P[3],n=P[4],r=P[5];t<10&&(t="0"+t),n<10&&(n="0"+n),r<10&&(r="0"+r),this.innerHTML=t+":"+n+":"+r}else this.innerHTML=c.formatDate(P)},highlight:function(e){e&&e==="unread"?this.classList.add("unread"):this.classList.remove("unread")},setAvatar:function(t){var n,r;t&&(n=document.createDocumentFragment(),r=new f([t]),r.place(n),this.hasChildNodes()?this.replaceChild(n,this.firstChild):this.appendChild(n))}}),msglistevent:new r(g),msglistcontrol:y,msgdetailstack:b}),g.template='<div id="connect-messages"><div class="messages"><div class="header blue-light"><span data-label="bind: innerHTML, msglistheadertitle">My Messages</span><div class="option right" data-msglistevent="listen: mousedown, plus"></div></div><ul class="selectors" data-sort = "foreach"><li class="sort-button" data-sort="bind: setLabel, label; bind:setSelected, selected, bind: name, name" data-msglistevent="listen:mousedown, displaySort"></li></ul><input class="search" type="text" data-label="bind: placeholder, searchmsgplaceholder" data-msglistevent="listen: keypress, search"><div class="msglist overflow" data-msglistcontrol="radio:li,selected,mouseup,selectMsg"><ul data-msg="foreach"><li class="msg list-item" data-msglistevent="listen:mousedown, setStart; listen:dblclick, showActionBar"><div data-msg="bind:setAvatar, author"></div><p class="msg-author unread" data-msg="bind:highlight, status; bind:innerHTML, username">Author</p><div class="select-msg"></div><span class="date" data-msg="bind: date, date"></span><p class="msg-subject unread" data-msg="bind:highlight, status; bind:setObject, type">Subject</p></li></ul></div></div><div id="msg-detail" class="details" data-msgdetailstack="destination"></div></div>',g.place(t.get("connect-messages")),g.plus=function(t,n){b.getStack().get("#newmsg").reset(),b.getStack().show("#newmsg")},g.displaySort=function(e,t){var n=t.getAttribute("data-sort_id");k.reset([]),b.getStack().show("#defaultPage"),C>-1&&N.update(C,"selected",!1),N.update(n,"selected",!0),C=n,k.reset(_(n))},g.search=function(e,t){e.keyCode===13&&(N.update(C,"selected",!1),C=-1,k.reset(D(t.value)))},g.selectMsg=function(t,n){var r=t.target.getAttribute("data-msg_id"),s=O.get("notifications"),o;if(k.get(r).status==="unread"){for(i=0,l=s.length;i<l;i++)if(JSON.stringify(s[i])===JSON.stringify(k.get(r))){index=i;break}k.update(r,"status","read"),s[index]=k.get(r),O.set("notifications",s),O.upload()}b.getStack().show("#msgdetail"),x.reset(k.get(r)),E="#msgdetail"},g.init=function(){k.reset(O.get("notifications")),g.cleanOld()},g.reset=function(){N.reset([{name:"all",label:"allbtn",selected:!0},{name:"messages",label:"msgbtn",selected:!1},{name:"notifications",label:"notifbtn",selected:!1},{name:"unread",label:"unreadbtn",selected:!1}]),g.init(),b.getStack().show("#defaultPage"),display=!1},g.getSelectedmsg=function(){var e=document.querySelector(".msg.selected"),t=-1;return e&&(t=e.getAttribute("data-msg_id")),t},g.cleanOld=function(){var e=new v,t=new Date,n,r,s=!1,o=O.get("notifications")||[],u=O.get("sentMessages")||[];for(i=o.length-1;i>=0;i--)n=new Date(o[i].date[0],o[i].date[1],o[i].date[2],o[i].date[3],o[i].date[4],o[i].date[5]),t.getTime()-n.getTime()>2592e6&&(o.pop(),s=!0);for(i=u.length-1;i>=0;i--)r=new Date(u[i].date[0],u[i].date[1],u[i].date[2],u[i].date[3],u[i].date[4],u[i].date[5]),t.getTime()-r.getTime()>2592e6&&(u.pop(),s=!0);return s?(O.set("notifications",o),O.set("sentMessages",u),O.upload().then(function(){e.fulfill()})):e.fulfill(),e},g.setStart=function(e,t){A&&A.hide()},g.showActionBar=function(e,t){var n=t.getAttribute("data-msg_id"),r,i=!1;A&&A.getParent()===t&&(i=!0),i||(A=new d("message",t,k.get(n)),r=document.createDocumentFragment(),A.place(r),t.appendChild(r),i=!0)},S.template='<div class="msgsplash"><div class="header blue-dark"><span>'+a.get("labels").get("messageview")+'</span></div><div class="innersplash" data-labels="bind: innerHTML, messagecenter"></div></div>',S.plugins.add("labels",new n(L)),g.init(),b.getStack().add("#defaultPage",S),b.getStack().add("#msgdetail",x),b.getStack().add("#newmsg",T),b.getStack().show("#defaultPage"),O.watchValue("notifications",function(){var e,t=[];k.reset([]),t=_(C),k.reset(t),b.getStack().getCurrentName()==="#msgdetail"&&(e=g.getSelectedmsg(),e>-1?x.reset(k.get(e)):b.getStack().show("#defaultPage"))}),M.watch("display-message",function(e){var t=O.get("notifications");N.update(C,"selected",!1),t[e].type==="MSG"?(N.update(1,"selected",!0),C=1):(N.update(2,"selected",!0),C=2),t[e].status="read",O.set("notifications",t),O.upload(),k.reset([t[e]]),document.querySelector('li[data-msg_id="0"]').classList.add("selected"),y.init(document.querySelector('li[data-msg_id="0"]')),b.getStack().show("#msgdetail"),x.reset(t[e]),E="#msgdetail"}),M.watch("message-contact",function(e){T.reset(e),b.getStack().show("#newmsg")}),O.watchValue("lang",function(){var e;N.loop(function(t,n){t.selected&&(e=n)}),N.reset([{name:"all",label:"allbtn",selected:!0},{name:"messages",label:"msgbtn",selected:!1},{name:"notifications",label:"notifbtn",selected:!1},{name:"unread",label:"unreadbtn",selected:!1}]),N.update(e,"selected",!0)}),g}});