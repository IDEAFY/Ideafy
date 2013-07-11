/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","service/config","Amy/Stack-plugin","Bind.plugin","Event.plugin","Amy/Control-plugin","Store","service/avatar","service/actionbar","./addcontact","./addgroup","./contact-detail","./group-detail"],function(e,t,n,r,s,o,u,a,f,c,h,p,d,v){return function(){var g=new e,y=new r,b=new h,w=new p,E=new d,S=new v,x=new a([{name:"all",label:"allbtn",selected:!0},{name:"users",label:"usrbtn",selected:!1},{name:"groups",label:"grpbtn",selected:!1}]),T=0,N=new a([]),C=!1,k=n.get("user"),L=n.get("labels"),A=function(e){var t=x.get(e).name,n=k.get("connections"),r=n.length,s=[];switch(t){case"users":for(i=0;i<r;i++)n[i].type==="user"&&s.push(n[i]);break;case"groups":for(i=0;i<r;i++)n[i].type==="group"&&s.push(n[i]);break;default:s=n}return s},O=function(e){var t=[],n=[];t=k.get("connections").concat();if(e==="")n=t,x.update(0,"selected",!0),T=0;else for(i=0,l=t.length;i<l;i++)JSON.stringify(t[i]).toLowerCase().search(e.toLowerCase())>-1&&n.push(t[i]);return n};return g.plugins.addAll({label:new s(L),sort:new s(x,{setLabel:function(e){this.innerHTML=L.get(e)},setSelected:function(e){e?this.classList.add("pressed"):this.classList.remove("pressed")}}),contact:new s(N,{setAvatar:function(t){var n=this.getAttribute("data-contact_id"),r,i;t==="group"?(this.hasChildNodes()&&this.removeChild(this.firstChild),this.setAttribute("style","background: url('img/connect/"+N.get(n).color+"') no-repeat center center; background-size: contain;display:block; width:40px; height:40px;float:left;")):t==="user"&&(this.setAttribute("style","background:none;"),r=document.createDocumentFragment(),i=new f([N.get(n).userid]),i.place(r),this.hasChildNodes()?this.replaceChild(r,this.firstChild):this.appendChild(r))},setIntro:function(e){e?this.innerHTML=e:this.innerHTML=" "}}),contactdetailstack:y,contactlistcontrol:new u(g),contactlistevent:new o(g)}),g.template='<div id="connect-contacts"><div class="contacts"><div class="header blue-light"><span data-label="bind: innerHTML, contactlistheadertitle">My Contacts</span><div class="option right" data-contactlistevent="listen: mousedown, plus"></div></div><ul class="selectors" data-sort = "foreach"><li class="sort-button" data-sort="bind: setLabel, label; bind:setSelected, selected, bind: name, name" data-contactlistevent="listen:mousedown, displaySort"></li></ul><input class="search" type="text" data-label="bind: placeholder, searchmsgplaceholder" data-contactlistevent="listen: keypress, search"><div class="contactlist overflow" data-contactlistcontrol="radio:li,selected,mousedown,selectContact"><ul data-contact="foreach"><li class="contact list-item" data-contactlistevent="listen:mousedown, setStart; listen:dblclick, showActionBar"><div data-contact="bind:setAvatar, type"></div><p class="contact-name" data-contact="bind:innerHTML, username"></p><p class="contact-intro" data-contact="bind:setIntro, intro"></p><div class="select-contact"></div></li></ul></div></div><div id="toggleadd" class="group" data-contactlistevent="listen:mousedown, press; listen:mouseup, toggleAddUI"></div><div id="contact-detail" class="details" data-contactdetailstack="destination"></div></div>',g.place(t.get("connect-contacts")),g.plus=function(t,n){var r=document.getElementById("toggleadd");y.getStack().get("#addcontact").reset(),y.getStack().show("#addcontact"),r.classList.contains("user")&&r.classList.remove("user"),r.classList.add("group")},g.init=function(){N.reset(k.get("connections")),b.init().then(function(){y.getStack().show("#addcontact")}),w.init(),S.init()},g.reset=function(){N.reset(k.get("connections")),b.reset(),y.getStack().show("#addcontact")},g.getSelectedContact=function(){var e=document.querySelector(".contact.selected"),t=-1;return e&&(t=e.getAttribute("data-contact_id")),t},g.selectContact=function(e){var t=e.target.getAttribute("data-contact_id"),n=N.get(t);document.getElementById("toggleadd").classList.remove("group"),document.getElementById("toggleadd").classList.remove("user"),n.type==="user"?(E.reset(N.get(t)),y.getStack().getCurrentName()!=="#contactdetails"&&y.getStack().show("#contactdetails")):(S.reset(N.get(t)),y.getStack().getCurrentName()!=="#groupdetails"&&y.getStack().show("#groupdetails"))},g.displaySort=function(e,t){var n=t.getAttribute("data-sort_id");N.reset([]),T>-1&&x.update(T,"selected",!1),x.update(n,"selected",!0),T=n,N.reset(A(n))},g.search=function(e,t){e.keyCode===13&&(x.update(T,"selected",!1),T=-1,N.reset(O(t.value)))},g.setStart=function(e,t){document.querySelector(".actionbar")&&g.hideActionBar()},g.showActionBar=function(e,t){var n=t.getAttribute("data-contact_id"),r=new c("contact",t,N.get(n),g.hideActionBar),i=document.createDocumentFragment();r.place(i),t.appendChild(i),C=!0},g.hideActionBar=function(t){var t=document.querySelector(".actionbar"),n=t.parentNode;n.removeChild(n.lastChild),C=!1},g.press=function(e,t){t.classList.add("pressed")},g.toggleAddUI=function(e,t){t.classList.remove("pressed"),t.classList.contains("group")?(t.classList.remove("group"),y.getStack().get("#addgroup").reset(),y.getStack().show("#addgroup"),t.classList.add("user")):(t.classList.remove("user"),y.getStack().get("#addcontact").reset(),y.getStack().show("#addcontact"),t.classList.add("group"))},y.getStack().add("#contactdetails",E),y.getStack().add("#groupdetails",S),y.getStack().add("#addcontact",b),y.getStack().add("#addgroup",w),w.init(),g.init(),k.watchValue("connections",function(){var e;T>-1&&N.reset(A(T)),y.getStack().getCurrentName()==="#contactdetails"&&(e=g.getSelectedContact(),e>-1?(contactDetail.reset(N.get(e)),y.getStack().show("#contactdetails")):(y.getStack().show("#addcontact"),document.getElementById("toggleadd").classList.add("group")))}),n.get("observer").watch("contact-deleted",function(){y.getStack().show("#addcontact")}),k.watchValue("lang",function(){var e;x.loop(function(t,n){t.selected&&(e=n)}),x.reset([{name:"all",label:"allbtn",selected:!1},{name:"users",label:"usrbtn",selected:!1},{name:"groups",label:"grpbtn",selected:!1}]),x.update(e,"selected",!0)}),g}});