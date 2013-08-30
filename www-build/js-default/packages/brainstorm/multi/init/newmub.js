/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Bind.plugin","Event.plugin","CouchDBDocument","service/config","Promise","Store","service/utils","lib/spin.min"],function(e,t,n,r,s,o,u,a,f){return function(c){var h=new e,p=new u({}),d=new u([]),v=new u([]),m=new u({errormsg:""}),g=s.get("labels"),y=s.get("user"),b={title:"",description:"",initiator:{id:y.get("_id"),username:y.get("username"),intro:y.get("intro")},participants:[],date:[],startTime:null,resumeTime:null,duration:null,elapsedTime:0,elapsedTimers:{},mode:"roulette",type:8,deck:y.get("active_deck"),status:"waiting",step:"mustart",lang:y.get("lang"),characters:[],contexts:[],problems:[],scenarioWB:[],scenario:[],techno:[[]],ideaWB:[],idea:[],score:"",chat:[],invited:[]},w=(new f({color:"#8cab68",lines:10,length:8,width:4,radius:8,top:-8,left:660})).spin();return h.plugins.addAll({labels:new t(g),newmub:new t(p,{initSessionMode:function(e){switch(e){case"campfire":this.selectedIndex=1,this.setAttribute("style","color: #F27B3D;");break;case"boardroom":this.selectedIndex=2,this.setAttribute("style","color: #4D4D4D;");break;default:this.selectedIndex=0,this.setAttribute("style","color: #5F8F28;")}},setSessionInfo:function(e){switch(e){case"campfire":this.innerHTML=g.get("campfireinfo");break;case"boardroom":this.innerHTML=g.get("boardroominfo");break;default:this.innerHTML=g.get("rouletteinfo")}},displayInvitations:function(e){e==="boardroom"?this.classList.remove("invisible"):this.classList.add("invisible")},setTitle:function(e){var t=new Date;e&&e.username&&this.setAttribute("placeholder",g.get("quickstarttitleplaceholderpre")+e.username+g.get("quickstarttitleplaceholderpost"))}}),auto:new t(d,{highlight:function(e){e?this.classList.add("selected"):this.classList.remove("selected")}}),invited:new t(v,{setSelected:function(e){e?this.innerHTML="&#10003;":this.innerHTML=""}}),errormsg:new t(m),newmubevent:new n(h)}),h.template='<div id="newmub"><div id="newmub-content"><form><label data-labels="bind:innerHTML, selectmode"></label><hr/><div class="select-mode"><select data-newmub="bind:initSessionMode, mode" data-newmubevent="listen:change, changeSessionMode"><option name="roulette" data-labels="bind:innerHTML, roulette"></option><option name="campfire" data-labels="bind:innerHTML, campfire"></option><option name="boardroom" data-labels="bind:innerHTML, boardroom"></option></select><span class="session-info" data-newmub="bind: setSessionInfo, mode"></span></div><div class="invite-contacts invisible" data-newmub="bind:displayInvitations, mode"><label></label><hr/><div class="selectall" data-labels="bind:innerHTML, selectall" data-newmubevent="listen: mousedown, press; listen:mouseup, selectAll">Select all</div><input class="search" data-newmubevent="listen:mousedown, displayAutoContact; listen:input, updateAutoContact" data-labels="bind:placeholder, tocontactlbl"><div id="invitelistauto" class="autocontact invisible"><div class="autoclose" data-newmubevent="listen:mousedown,close"></div><ul data-auto="foreach"><li data-auto="bind:innerHTML, username; bind:highlight, selected" data-newmubevent="listen:mouseup, select"></li></ul></div><div class="invitecontactlist"><ul data-invited="foreach"><li class = "contact list-item" data-newmubevent="listen:mousedown, discardContact"><p class="contact-name" data-invited="bind:innerHTML, username"></p><div class="remove-contact"></div></li></ul></div></div><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="session-title" maxlength=60 readonly="readonly" name="title" data-newmub="bind:value, title; bind: setTitle, initiator" data-newmubevent="listen: mousedown, removeReadonly"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="session-desc" name="description" data-newmub="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea></form><div class="newmub-footer"><p class="send"><label class="clear" data-labels="bind:innerHTML, clear" data-newmubevent="listen: mousedown, press; listen:mouseup, clear"></label><label class="create" data-labels="bind:innerHTML, create" data-newmubevent="listen:mousedown, press; listen:mouseup, create"></label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></div></div>',h.place(document.getElementById("newmub")),h.reset=function(){var t={title:"",description:"",initiator:{id:y.get("_id"),username:y.get("username"),intro:y.get("intro")},participants:[],date:[],startTime:null,resumeTime:null,duration:null,elapsedTime:0,elapsedTimers:{},mode:"roulette",type:8,deck:y.get("active_deck"),status:"waiting",step:"",lang:y.get("lang"),characters:[],contexts:[],problems:[],scenarioWB:[],scenario:[],techno:[[]],ideaWB:[],idea:[],score:"",chat:[],invited:[]};p.reset(t),p.set("lang",y.get("lang")),p.set("deck",y.get("active_deck")),p.set("initiator",{id:y.get("_id"),username:y.get("username"),intro:y.get("intro")}),v.reset([]),m.set("errormsg",""),d.reset(y.get("connections").concat())},h.changeSessionMode=function(e,t){var n=t.selectedIndex,r=t.childNodes[n],i=r.getAttribute("name");d.reset(y.get("connections")),v.reset([]),p.set("mode",i)},h.displayAutoContact=function(e,t){document.getElementById("invitelistauto").classList.remove("invisible"),d.reset(y.get("connections").concat())},h.updateAutoContact=function(e,t){var n=JSON.parse(d.toJSON()),r=y.get("connections").concat(),s,o=t.value.toLowerCase();if(t.value==="")d.reset(r);else{for(i=n.length-1;i>=0;i--)s=n[i].username.toLowerCase(),s.search(o)!==0&&n.splice(i,1);d.reset(n)}d.loop(function(e,t){v.toJSON().search(e.contact.userid)>-1&&d.update(t,"selected",!0)})},h.close=function(t,n){n.parentNode.classList.add("invisible")},h.discardContact=function(e,t){var n=t.getAttribute("data-invited_id"),r=v.get(n).userid;v.alter("splice",n,1),d.loop(function(e,t){e.userid===r&&setTimeout(function(){d.update(t,"selected",!1)},200)}),h.unselectGroup(r)},h.select=function(e,t){var n=t.getAttribute("data-auto_id");d.get(n).selected?(h.removeContact(d.get(n)),setTimeout(function(){d.update(n,"selected",!1),document.getElementById("invitelistauto").classList.add("invisible")},200)):(h.addContact(d.get(n)),h.selectGroup(),setTimeout(function(){d.update(n,"selected",!0),document.getElementById("invitelistauto").classList.add("invisible")},200))},h.selectAll=function(e,t){t.classList.remove("pressed"),v.reset([]),d.reset(y.get("connections")),d.loop(function(e,t){d.update(t,"selected",!0),e.type==="user"&&v.alter("push",e)})},h.removeContact=function(e){if(e.type==="group")for(j=e.contacts.length-1;j>=0;j--)h.removeContact(e.contacts[j]);else v.loop(function(t,n){t.userid===e.userid&&v.alter("splice",n,1)}),h.unselectGroup(e.userid),d.loop(function(t,n){t.userid===e.userid&&d.update(n,"selected",!1)})},h.selectGroup=function(){var e,t=!1;d.loop(function(n,r){if(n.type==="group"&&!n.selected){e=n.contacts,t=!0;for(j=e.length-1;j>=0;j--)if(v.toJSON().search(e[j].userid)<0){t=!1;break}t&&d.update(r,"selected",!0)}})},h.unselectGroup=function(e){d.loop(function(t,n){t.type==="group"&&t.selected&&JSON.stringify(t.contacts).search(e)>0&&d.update(n,"selected",!1)})},h.addContact=function(e){var t,n,r=!0;if(e.type==="user")v.alter("push",e);else for(t=0,n=e.contacts.length;t<n;t++)v.loop(function(n,s){n.userid===e.contacts[t].userid&&(r=!1)}),r&&(v.alter("push",e.contacts[t]),d.loop(function(n,r){n.userid===e.contacts[t].userid&&d.update(r,"selected",!0)}))},h.removeReadonly=function(e,t){t.removeAttribute("readonly")},h.press=function(e,t){t.classList.add("pressed")},h.clear=function(e,t){t.classList.remove("pressed"),h.reset()},h.create=function(e,t){t.classList.remove("pressed"),m.set("errormsg",""),p.get("title").length<3||p.get("description").length<3?m.set("errormsg",g.get("providesessioninfo")):p.get("mode")!=="roulette"&&y.get("connections").length<1?m.set("errormsg",g.get("nofriendtoinvite")):p.get("mode")==="boardroom"&&!v.getNbItems()?m.set("errormsg",g.get("inviteatleastone")):(t.classList.add("invisible"),w.spin(t.parentNode),h.uploadSession().then(function(){w.stop(),t.classList.remove("invisible"),h.reset()}))},h.createChat=function(t){var n=new r,i=(new Date).getTime(),u=new o;return n.setTransport(s.get("transport")),n.set("users",[{username:y.get("username"),userid:y.get("_id")}]),n.set("msg",[{user:"SYS",type:0,arg:0,time:i}]),n.set("sid",p.get("_id")),n.set("lang",p.get("lang")),n.set("readonly",!1),n.set("step",0),n.set("type",17),n.sync(s.get("db"),t).then(function(){return n.upload()}).then(function(){u.fulfill(),n.unsync()}),u},h.uploadSession=function(){var t=new r,n=new Date,i,u=p.get("chat")||[],f=new o;return p.set("_id","S:MU:"+n.getTime()),p.set("date",[n.getFullYear(),n.getMonth(),n.getDate()]),p.get("mode")==="boardroom"&&v.loop(function(e,t){p.get("invited").push(e.userid)}),p.get("mode")==="campfire"&&p.set("invited",a.getUserContactIds()),i=p.get("_id")+"_0",u.push(i),p.set("chat",u),t.reset(JSON.parse(p.toJSON())),t.setTransport(s.get("transport")),t.sync(s.get("db"),t.get("_id")).then(function(){return h.createChat(i)}).then(function(){return t.upload()}).then(function(){t.get("mode")==="boardroom"?(m.set("errormsg",g.get("sendinginvites")),h.sendInvites(t.get("invited"),t.get("_id"),t.get("title")).then(function(){s.get("observer").notify("start-mu_session",t.get("_id")),f.fulfill(),t.unsync()})):(s.get("observer").notify("start-mu_session",t.get("_id")),f.fulfill(),t.unsync())}),f},h.sendInvites=function(t,n,r){var i=new o,u=new Date,a={type:"INV",status:"unread",date:[u.getFullYear(),u.getMonth(),u.getDate(),u.getHours(),u.getMinutes(),u.getMinutes()],author:y.get("_id"),username:y.get("username"),firstname:y.get("firstname"),toList:"",ccList:"",object:"",body:"",signature:"",docId:n,docTitle:r,dest:t};return s.get("transport").request("Notify",a,function(e){m.set("errormsg",g.get("invitesent")),i.fulfill()}),i},h.reset(),y.watchValue("lang",function(){var e=JSON.parse(p.toJSON()),t=JSON.parse(m.toJSON());p.reset({}),p.reset(e),m.reset({}),m.reset(t)}),h}});