/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Event.plugin","CouchDBView","Store","service/avatar","Promise","lib/spin.min"],function(e,t,n,r,s,o,u,a,f){return function(){var c=new e,h=new s,p=new o({email:"",firstname:"",lastname:"",result:"",display:!1,sentok:!1,message:"",invite:!1}),d=new o([]),v={},m=t.get("user"),g=t.get("transport"),y=t.get("labels"),b=(new f({color:"#5F8F28",lines:8,length:8,width:4,radius:8,left:-20,top:-36})).spin(),w=function(e,t){var n=/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;e==="email"?n.test(t.toLowerCase())?(p.set("result",""),E("userid",t.toLowerCase())):p.set("result",y.get("signupinvalidemail")):p.get("email")?p.set("result",y.get("clearemailfirst")):p.get("firstname")&&p.get("lastname")?(p.set("result",""),E("username",p.get("firstname").toLowerCase()+" "+p.get("lastname").toLowerCase())):p.set("result",y.get("needbothfnln"))},E=function(e,n){var r=new s;r.setTransport(g),e==="userid"?r.sync(t.get("db"),"users","_view/searchbyid",{key:'"'+n+'"',descending:!0}).then(function(){d.reset(JSON.parse(r.toJSON())),d.getNbItems()?p.set("display",!0):p.set("invite",!0),r.unsync()}):r.sync(t.get("db"),"users","_view/searchbyusername",{key:'"'+n+'"',descending:!0}).then(function(){d.reset(JSON.parse(r.toJSON())),d.getNbItems()?p.set("display",!0):p.set("result",y.get("noentryfound")),r.unsync()})},S=function(e){var t=!1,n=m.get("sentMessages")||[],r=m.get("connections"),i=!1,s=!1,o,u,a,f;if(e.userid===m.get("_id"))p.set("result",y.get("cannotaddself"));else{for(u=0,a=r.length;u<a;u++)if(r[u].userid===e.userid){s=!0;break}if(s)p.set("result",e.username+y.get("alreadyconnected"));else{for(o=0,f=n.length;o<f;o++)if(n[o].type==="CXR"&&n[o].toList.search(e.username)>-1){i=!0;break}i?p.set("result",y.get("alreadysentCXR")+e.username):t=!0}}return t},x=function(e){var t=new Date,n={};S(e)&&(n.dest=[e.userid],n.type="CXR",n.status="unread",n.date=[t.getFullYear(),t.getMonth(),t.getDate(),t.getHours(),t.getMinutes(),t.getSeconds()],n.author=m.get("_id"),n.username=m.get("username"),n.firstname=m.get("firstname"),n.toList=e.username,n.ccList="",n.object=m.get("username")+y.get("CXRobject"),n.body=p.get("message"),n.signature=m.get("signature"),n.contactInfo={firstname:m.get("firstname"),lastname:m.get("lastname"),userid:m.get("_id"),username:m.get("username"),intro:m.get("intro"),type:"user"},g.request("Notify",n,function(e){var t=JSON.parse(e);t[0].res==="ok"?(p.set("result",y.get("CXRsent")),setTimeout(function(){c.reset()},2e3)):model.set("result","There was an error, please try again later")}))};return c.plugins.addAll({label:new n(y),count:new n(h),search:new n(p,{setVisible:function(e){e?this.classList.remove("invisible"):this.classList.add("invisible")},setStyle:function(e){e?this.setAttribute("style","color: #5F8F28;"):this.setAttribute("style","color: #F27B3D;")}}),contacts:new n(d,{setAvatar:function(t){var n,r;_frag=document.createDocumentFragment(),_ui=new u([t]),_ui.place(_frag),this.hasChildNodes()?this.replaceChild(_frag,this.firstChild):this.appendChild(_frag)},setSelected:function(e){e?this.innerHTML="&#10003;":this.innerHTML=""}}),searchdbevent:new r(c),invitecontactevent:new r(c)}),c.template='<div id="addcontact"><div class="header blue-dark"><span class="newcontactlbl" data-label="bind:innerHTML, newcontactlbl"></span></div><div class = "detail-contents"><div class="doctor-deedee"></div><div class="addcontactform"><p class="half"><span data-label="bind:innerHTML, beforecount"></span><strong><span data-count="bind:innerHTML, 0.value"></span></strong><span data-label="bind:innerHTML, aftercount"></span></p><p class="half" data-label="bind: innerHTML, addcontactrightintro"></p><legend data-label="bind:innerHTML, addcontactnow"></legend><input class="search" type="text" name="email" data-label="bind:placeholder, searchcontactplaceholder" data-search="bind: value, email" data-searchdbevent="listen: keypress, searchDB"><legend data-label="bind:innerHTML, lookup"></legend><div class="searchcontact"><input type="text" class="search half" name="fn" data-label="bind:placeholder, firstnameplaceholder" data-search="bind: value, firstname" data-searchdbevent="listen: keypress, searchDB"><input class="search half right" type="text" name="ln" data-label="bind: placeholder, lastnameplaceholder" data-search="bind: value, lastname" data-searchdbevent="listen: keypress, searchDB"></div><p class="searchresult" data-search="bind: innerHTML, result; bind:setStyle, sentok"></p></div><div class="contactinvite" data-search="bind: setVisible, invite"><p>The person you are looking for was not found in Ideafy. Would you like to send him/her an invitation ? You will receive 200 Ideafy Points if the person joins the community</p><div><span class="sendmail" data-label="bind:innerHTML, sendlbl" data-invitecontactevent="listen: touchstart, press; listen:touchend, sendInvite">Accept</span><span class="cancelmail" data-label="bind:innerHTML, cancellbl" data-invitecontactevent="listen: touchstart, press; listen:touchend, cancelInvite">Cancel</span></div></div><div class = "contactlist invisible" data-search="bind: setVisible, display"><legend data-label="bind:innerHTML, selectcontact"></legend><ul data-contacts="foreach"><li class = "contact list-item"><div data-contacts="bind:setAvatar, value.userid"></div><p class="contact-name" data-contacts="bind:innerHTML, value.username"></p><p class="contact-intro" data-contacts="bind:innerHTML, value.intro"></p><div class="select-contact" data-searchdbevent="listen:touchstart, check"></div></li></ul><textarea class="input" data-label="bind:placeholder, addamessage" data-search="bind:value, message"></textarea><div class="addcontactbtns"><div class="addct" data-searchdbevent="listen:touchstart, push; listen:touchend, add"></div><div class="cancelct" data-searchdbevent="listen:touchstart, push; listen:touchend, cancel"></div></div></div></div></div>',c.init=function(){var n=new a;return h.setTransport(g),h.sync(t.get("db"),"users","_view/count").then(function(){n.fulfill()}),n},c.searchDB=function(e,t){var n;e.keyCode===13&&(e.target.blur(),n=t.getAttribute("name"),w(n,t.value))},c.check=function(e,t){var n=t.getAttribute("data-contacts_id");t.innerHTML?(t.innerHTML="",v[n]=!1):(t.innerHTML="&#10003;",v[n]=!0)},c.reset=function(){p.reset({email:"",firstname:"",lastname:"",result:"",display:!1,sentok:!1,message:"",invite:!1}),d.reset([])},c.push=function(e,t){t.classList.add("pushed")},c.cancel=function(e,t){t.classList.remove("pushed"),c.reset()},c.press=function(e,t){t.classList.add("pressed")},c.cancelInvite=function(e,t){t.classList.remove("pressed"),c.reset()},c.sendInvite=function(e,t){var n={id:p.get("email").toLowerCase(),senderid:m.get("_id"),sendername:m.get("username"),subject:m.get("username")+y.get("invitesyou"),body:y.get("invitebody")};b.spin(t),g.request("Invite",n,function(e){e==="ok"&&alert(y.get("invitationsent")),e==="alreadyinvited"&&alert(y.get("alreadyinvited")),b.stop(),t.classList.remove("pressed"),c.reset()})},c.add=function(e,t){t.classList.remove("pushed");for(i in Object.keys(v))x(d.get(i).value)},ADDCTSPIN=b,c}});