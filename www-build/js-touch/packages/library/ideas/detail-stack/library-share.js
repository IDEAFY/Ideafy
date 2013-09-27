/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","service/config","Bind.plugin","Event.plugin","Store","service/avatar","service/utils","service/autocontact","CouchDBDocument","Promise","lib/spin.min"],function(e,t,n,r,s,o,u,a,f,l,c,h){return function(a){var f=new e,p=new o({errormsg:""}),d=n.get("user"),v=n.get("transport"),m=n.get("labels"),g=new o({body:"",docId:"",docType:"",attachment:"",docTitle:"",signature:d.get("signature")}),y=new o([]),b=new o([]),w=!1,E=(new h({color:"#5F8F28",lines:8,length:8,width:4,radius:8,left:30,top:-6})).spin();return f.plugins.addAll({labels:new r(m),share:new r(g,{setHeader:function(e){this.innerHTML=m.get("sharing")+e}}),contacts:new r(b,{setSelected:function(e){e?this.innerHTML="&#10003;":this.innerHTML=""}}),auto:new r(y,{highlight:function(e){e?this.classList.add("selected"):this.classList.remove("selected")}}),shareevent:new s(f),errormsg:new r(p)}),f.template='<div class="idea-share"><div class="header blue-dark"><span data-share="bind:setHeader, docTitle">Sharing idea</span></div><form class="form"><legend>Select contacts</legend><div class="selectall" data-labels="bind:innerHTML, selectall" data-shareevent="listen: touchstart, press; listen:touchend, selectAll">Select all</div><input class="search" data-shareevent="listen:touchstart, displayAutoContact; listen:input, updateAutoContact" data-labels="bind:placeholder, tocontactlbl"><div id="sharelistauto" class="autocontact invisible"><div class="autoclose" data-shareevent="listen:touchstart,close"></div><ul data-auto="foreach"><li data-auto="bind:innerHTML, username; bind:highlight, selected" data-shareevent="listen:touchend, select"></li></ul></div><div class="sharecontactlist"><ul data-contacts="foreach"><li class = "contact list-item" data-shareevent="listen:touchstart, discardContact"><p class="contact-name" data-contacts="bind:innerHTML, username"></p><div class="remove-contact"></div><p class="contact-intro" data-contacts="bind:innerHTML, intro"></p></li></ul></div><p><legend>Add a message</legend><textarea class="input sharemessage" data-share="bind:value, body"></textarea></p><p><legend>Signature</legend><textarea class="signature" data-share="bind:value, signature"></textarea></p><div class="sendmail-footer"><p class="send"><label class="cancelmail" data-labels="bind:innerHTML, cancellbl" data-shareevent="listen: touchstart, press; listen:touchend, cancel">Cancel</label><label class="sendmail" data-labels="bind:innerHTML, sharelbl" data-shareevent="listen:touchstart, press; listen:touchend, share">Share</label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></form></div>',f.reset=function(t){p.reset({errormsg:""}),g.reset({body:"",docId:t,docType:"",docTitle:"",signature:d.get("username")+" <"+d.get("_id")+">"}),f.getIdeaDetails(t),d.get("signature")&&g.set("signature",d.get("signature")),b.reset([]),y.reset(d.get("connections").concat())},f.getIdeaDetails=function(t){var r=new l({});r.setTransport(v),r.sync(n.get("db"),t).then(function(){g.set("docType",r.get("type")),g.set("docTitle",r.get("title")),r.unsync()})},f.updateAutoContact=function(e,t){var n=JSON.parse(y.toJSON()),r=d.get("connections").concat(),s,o=t.value.toLowerCase();if(t.value==="")y.reset(r);else{for(i=n.length-1;i>=0;i--)s=n[i].username.toLowerCase(),s.search(o)!==0&&n.splice(i,1);y.reset(n)}y.loop(function(e,t){b.toJSON().search(e.userid)>-1&&y.update(t,"selected",!0)})},f.close=function(t,n){n.parentNode.classList.add("invisible")},f.displayAutoContact=function(e,t){f.dom.querySelector("#sharelistauto").classList.remove("invisible"),y.reset(d.get("connections").concat())},f.discardContact=function(e,t){var n=t.getAttribute("data-contacts_id"),r=b.get(n).userid;b.alter("splice",n,1),y.loop(function(e,t){e.userid===r&&setTimeout(function(){y.update(t,"selected",!1)},200)}),f.unselectGroup(r)},f.select=function(e,t){var n=t.getAttribute("data-auto_id");y.get(n).selected?(f.removeContact(y.get(n)),setTimeout(function(){y.update(n,"selected",!1),document.getElementById("sharelistauto").classList.add("invisible")},200)):(f.addContact(y.get(n)),f.selectGroup(),setTimeout(function(){y.update(n,"selected",!0),document.getElementById("sharelistauto").classList.add("invisible")},200))},f.selectAll=function(e,t){t.classList.remove("pressed"),b.reset([]),y.reset(d.get("connections").concat()),y.loop(function(e,t){y.update(t,"selected",!0),e.type==="user"&&b.alter("push",e)})},f.removeContact=function(e){if(e.type==="group")for(j=e.contacts.length-1;j>=0;j--)f.removeContact(e.contacts[j]);else b.loop(function(t,n){t.userid===e.userid&&b.alter("splice",n,1)}),f.unselectGroup(e.userid),y.loop(function(t,n){t.userid===e.userid&&y.update(n,"selected",!1)})},f.selectGroup=function(){var e,t=!1;y.loop(function(n,r){if(n.type==="group"&&!n.selected){e=n.contacts,t=!0;for(j=e.length-1;j>=0;j--)if(b.toJSON().search(e[j].userid)<0){t=!1;break}t&&y.update(r,"selected",!0)}})},f.unselectGroup=function(e){y.loop(function(t,n){t.type==="group"&&t.selected&&JSON.stringify(t.contacts).search(e)>0&&y.update(n,"selected",!1)})},f.addContact=function(e){var t,n,r=!0;if(e.type==="user")b.alter("push",e);else for(t=0,n=e.contacts.length;t<n;t++)b.loop(function(n,s){n.userid===e.contacts[t].userid&&(r=!1)}),r&&(b.alter("push",e.contacts[t]),y.loop(function(n,r){n.userid===e.contacts[t].userid&&y.update(r,"selected",!0)}))},f.press=function(e,t){t.classList.add("pressed")},f.share=function(e,t){var n=new Date,r={type:"DOC",status:"unread",date:[n.getFullYear(),n.getMonth(),n.getDate(),n.getHours(),n.getMinutes(),n.getMinutes()],author:d.get("_id"),username:d.get("username"),firstname:d.get("firstname"),toList:"",ccList:"",object:"",body:g.get("body"),signature:g.get("signature"),docId:g.get("docId"),docType:g.get("docType"),docTitle:g.get("docTitle"),dest:[]};w||(w=!0,E.spin(t),f.buildRecipientList(r.docId,r.dest).then(function(){r.dest.length?v.request("Notify",r,function(e){p.set("errormsg",m.get("shareok")),t.classList.remove("pressed"),w=!1,setTimeout(function(){E.stop(),f.reset(r.docId),f.dom.querySelector("#sharelistauto").classList.add("invisible"),y.reset(d.get("connections").concat()),a("close")},2500)}):(p.set("errormsg","intented recipients already have this idea"),t.classList.remove("pressed"),w=!1,setTimeout(function(){E.stop(),f.reset(r.docId),f.dom.querySelector("#sharelistauto").classList.add("invisible"),y.reset(d.get("connections").concat()),a("close")},2500))}))},f.cancel=function(e,t){t.classList.remove("pressed"),a("close")},f.buildRecipientList=function(t,r){var i=new c,s=new l;return s.setTransport(v),s.sync(n.get("db"),t).then(function(){var e=s.get("sharedwith")||[],t=s.get("authors"),n;return b.loop(function(n,i){t.indexOf(n.userid)<0&&(e.length?e.indexOf(n.userid)<0&&(e.push(n.userid),r.push(n.userid)):(e.push(n.userid),r.push(n.userid)))}),s.set("sharedwith",e),s.upload()}).then(function(){i.fulfill()}),i},f.place(t.get("library-share")),f}});