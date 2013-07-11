/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","Amy/Control-plugin","Amy/Stack-plugin","Store","service/config","service/avatar","service/utils","./message-detail","./newmessage","service/actionbar","Promise"],function(e,t,n,r,s,o,u,a,f,c,h,p,d,v){return function(){var g=new e,y=new o,b=function(e){y.getStack().show(e)},w="#defaultPage",E=new e,S=new h(b),x=new p(b),T=new u([{name:"all",label:"allbtn",selected:!0},{name:"messages",label:"msgbtn",selected:!1},{name:"notifications",label:"notifbtn",selected:!1},{name:"unread",label:"unreadbtn",selected:!1}]),N=0,C=new u([]),k=a.get("labels"),L,A,O=!1,M=a.get("user"),_=a.get("observer"),D=function(e){var t=T.get(e).name,n=M.get("notifications"),r,i=n.length,s=[];switch(t){case"messages":for(r=0;r<i;r++)n[r].type==="MSG"&&s.push(n[r]);break;case"notifications":for(r=0;r<i;r++)n[r].type!=="MSG"&&s.push(n[r]);break;case"unread":for(r=0;r<i;r++)n[r].status==="unread"&&s.push(n[r]);break;default:s=n}return s},P=function(e){var t=[],n=[];t=M.get("notifications").concat();if(e==="")n=t,T.update(0,"selected",!0),N=0;else for(i=0,l=t.length;i<l;i++)JSON.stringify(t[i]).toLowerCase().search(e.toLowerCase())>-1&&n.push(t[i]);return n};return g.plugins.addAll({label:new n(k),sort:new n(T,{setLabel:function(e){this.innerHTML=k.get(e)},setSelected:function(e){e?this.classList.add("pressed"):this.classList.remove("pressed")}}),msg:new n(C,{setObject:function(e){var t=this.getAttribute("data-msg_id");switch(e){case"INV":this.innerHTML=C.get(t).username+k.get("INVObject");break;case"CXR":this.innerHTML=C.get(t).username+k.get("CXRobject");break;case"CXRaccept":this.innerHTML=C.get(t).username+k.get("acceptedCXR");break;case"CXRreject":this.innerHTML=C.get(t).username+k.get("rejectedCXR");break;case"CXCancel":this.innerHTML=C.get(t).username+k.get("canceledCX");break;case"DOC":this.innerHTML=C.get(t).username+k.get("sentdocmsg");break;case"2Q+":this.innerHTML=C.get(t).username+k.get("askednew");break;case"2C+":this.innerHTML=C.get(t).username+k.get("senttc");break;case"REF":this.innerHTML=C.get(t).username+k.get("joinedideafy");break;default:this.innerHTML=C.get(t).object}},date:function H(H){var e=new Date;if(H&&H[0]===e.getFullYear()&&H[1]===e.getMonth()&&H[2]===e.getDate()){var t=H[3],n=H[4],r=H[5];t<10&&(t="0"+t),n<10&&(n="0"+n),r<10&&(r="0"+r),this.innerHTML=t+":"+n+":"+r}else this.innerHTML=c.formatDate(H)},highlight:function(e){e&&e==="unread"?this.classList.add("unread"):this.classList.remove("unread")},setAvatar:function(t){var n,r;t&&(n=document.createDocumentFragment(),r=new f([t]),r.place(n),this.hasChildNodes()?this.replaceChild(n,this.firstChild):this.appendChild(n))}}),msglistevent:new r(g),msglistcontrol:new s(g),msgdetailstack:y}),g.template='<div id="connect-messages"><div class="messages"><div class="header blue-light"><span data-label="bind: innerHTML, msglistheadertitle">My Messages</span><div class="option right" data-msglistevent="listen: touchstart, plus"></div></div><ul class="selectors" data-sort = "foreach"><li class="sort-button" data-sort="bind: setLabel, label; bind:setSelected, selected, bind: name, name" data-msglistevent="listen:touchstart, displaySort"></li></ul><input class="search" type="text" data-label="bind: placeholder, searchmsgplaceholder" data-msglistevent="listen: keypress, search"><div class="msglist overflow" data-msglistcontrol="radio:li,selected,touchend,selectMsg"><ul data-msg="foreach"><li class="msg list-item" data-msglistevent="listen:touchstart, setStart; listen:touchmove, showActionBar"><div data-msg="bind:setAvatar, author"></div><p class="msg-author unread" data-msg="bind:highlight, status; bind:innerHTML, username">Author</p><div class="select-msg"></div><span class="date" data-msg="bind: date, date"></span><p class="msg-subject unread" data-msg="bind:highlight, status; bind:setObject, type">Subject</p></li></ul></div></div><div id="msg-detail" class="details" data-msgdetailstack="destination"></div></div>',g.place(t.get("connect-messages")),g.plus=function(t,n){y.getStack().get("#newmsg").reset(),y.getStack().show("#newmsg")},g.displaySort=function(e,t){var n=t.getAttribute("data-sort_id");C.reset([]),y.getStack().show("#defaultPage"),N>-1&&T.update(N,"selected",!1),T.update(n,"selected",!0),N=n,C.reset(D(n))},g.search=function(e,t){e.keyCode===13&&(T.update(N,"selected",!1),N=-1,C.reset(P(t.value)))},g.selectMsg=function(t,n){var r=t.target.getAttribute("data-msg_id"),s=M.get("notifications"),o;if(C.get(r).status==="unread"){for(i=0,l=s.length;i<l;i++)if(JSON.stringify(s[i])===JSON.stringify(C.get(r))){index=i;break}C.update(r,"status","read"),s[index]=C.get(r),M.set("notifications",s),M.upload()}y.getStack().show("#msgdetail"),S.reset(C.get(r)),w="#msgdetail"},g.init=function(){C.reset(M.get("notifications")),g.cleanOld()},g.reset=function(){T.reset([{name:"all",label:"allbtn",selected:!0},{name:"messages",label:"msgbtn",selected:!1},{name:"notifications",label:"notifbtn",selected:!1},{name:"unread",label:"unreadbtn",selected:!1}]),g.init(),y.getStack().show("#defaultPage")},g.getSelectedmsg=function(){var e=document.querySelector(".msg.selected"),t=-1;return e&&(t=e.getAttribute("data-msg_id")),t},g.cleanOld=function(){var e=new v,t=new Date,n,r,s=!1,o=M.get("notifications")||[],u=M.get("sentMessages")||[];for(i=o.length-1;i>=0;i--)n=new Date(o[i].date[0],o[i].date[1],o[i].date[2],o[i].date[3],o[i].date[4],o[i].date[5]),t.getTime()-n.getTime()>2592e6&&(o.pop(),s=!0);for(i=u.length-1;i>=0;i--)r=new Date(u[i].date[0],u[i].date[1],u[i].date[2],u[i].date[3],u[i].date[4],u[i].date[5]),t.getTime()-r.getTime()>2592e6&&(u.pop(),s=!0);return s?(M.set("notifications",o),M.set("sentMessages",u),M.upload().then(function(){e.fulfill()})):e.fulfill(),e},g.setStart=function(e,t){L=[e.pageX,e.pageY],document.querySelector(".actionbar")&&g.hideActionBar()},g.showActionBar=function(e,t){var n=t.getAttribute("data-msg_id");A=[e.pageX,e.pageY];if(!O&&L[0]-A[0]>40&&A[1]-L[1]<20&&A[1]-L[1]>-20){var r=new d("message",t,C.get(n),g.hideActionBar),i=document.createDocumentFragment();r.place(i),t.appendChild(i),O=!0}},g.hideActionBar=function(){var t=document.querySelector(".actionbar"),n=t.parentNode;n.removeChild(n.lastChild),O=!1},E.template='<div class="msgsplash"><div class="header blue-dark"><span>'+a.get("labels").get("messageview")+'</span></div><div class="innersplash" data-labels="bind: innerHTML, messagecenter"></div></div>',E.plugins.add("labels",new n(k)),g.init(),y.getStack().add("#defaultPage",E),y.getStack().add("#msgdetail",S),y.getStack().add("#newmsg",x),y.getStack().show("#defaultPage"),M.watchValue("notifications",function(){var e,t=[];C.reset([]),t=D(N),C.reset(t),y.getStack().getCurrentName()==="#msgdetail"&&(e=g.getSelectedmsg(),e>-1?S.reset(C.get(e)):y.getStack().show("#defaultPage"))}),_.watch("display-message",function(e){var t=M.get("notifications");T.update(N,"selected",!1),t[e].type==="MSG"?(T.update(1,"selected",!0),N=1):(T.update(2,"selected",!0),N=2),t[e].status="read",M.set("notifications",t),M.upload(),C.reset([t[e]]),document.querySelector('li[data-msg_id="0"]').classList.add("selected"),msgControl.init(document.querySelector('li[data-msg_id="0"]')),y.getStack().show("#msgdetail"),S.reset(t[e]),w="#msgdetail"}),_.watch("message-contact",function(e){x.reset(e),y.getStack().show("#newmsg")}),M.watchValue("lang",function(){var e;T.loop(function(t,n){t.selected&&(e=n)}),T.reset([{name:"all",label:"allbtn",selected:!0},{name:"messages",label:"msgbtn",selected:!1},{name:"notifications",label:"notifbtn",selected:!1},{name:"unread",label:"unreadbtn",selected:!1}]),T.update(e,"selected",!0)}),g}});