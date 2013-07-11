/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Event.plugin","Store","service/avatar"],function(e,t,n,r,s,o){return function(){var a=new e,f=new s,c=new s([]),h,p=[{color:"#4D4D4D",icon:"graygroup.png",selected:!1},{color:"#657B99",icon:"bluegroup.png",selected:!1},{color:"#9AC9CD",icon:"azurgroup.png",selected:!1},{color:"#5F8F28",icon:"greengroup.png",selected:!1},{color:"#F2E520",icon:"yellowgroup.png",selected:!1},{color:"#F27B3D",icon:"orangegroup.png",selected:!1},{color:"#BD262C",icon:"redgroup.png",selected:!1}],d=new s(p),v=new s([]),m=new s({error:""}),g={},y=t.get("user"),b=t.get("labels");return a.template='<div id="groupdetails"><div class="header blue-dark"><span class="newfolderlbl" data-group="bind:innerHTML, username"></span></div><div class = "detail-contents"><div class="folderpic" data-group="bind: setColor, color"></div><form><p><input type="text" class="input" data-group="bind:value, username" data-label="bind:placeholder, groupnamelbl"></p><p><textarea class="input" data-group="bind:value, intro" data-label="bind:placeholder, groupdesclbl"></textarea></p><legend data-label="bind:innerHTML, colortouch"></legend><ul class="groupcolors" data-color="foreach"><li data-color="bind:setColor, color; bind:setSelected, selected" data-grpdetailsevent="listen: touchstart, selectColor"></li></ul></form><div class = "grpcontactlist" data-group="bind: setVisible, contacts"><legend name="list" data-label="bind:innerHTML, grpcontacts" data-grpdetailsevent="listen: touchstart, toggleHide"></legend><ul class="contactlistdetail" data-grpcontacts="foreach"><li class = "contact list-item" data-grpdetailsevent="listen:touchstart, discardContact"><div data-grpcontacts="bind:setAvatar, userid"></div><p class="contact-name" data-grpcontacts="bind:innerHTML, username"></p><div class="remove-contact"></div><p class="contact-intro" data-grpcontacts="bind:innerHTML, intro"></p></li></ul></div><p class="update"><label class="cancelmail" data-label="bind:innerHTML, cancellbl" data-grpdetailsevent="listen: touchstart, press; listen:touchend, cancel">Cancel</label><label class="sendmail" data-label="bind:innerHTML, updatelbl" data-grpdetailsevent="listen:touchstart, press; listen:touchend, updateGroup"></label><label class="editerror" data-error="bind:innerHTML, error"></label><div class="addgrpcontacts"><legend name="add" data-label="bind:innerHTML, addgrpcontacts" data-grpdetailsevent="listen: touchstart, toggleHide"></legend><div class="addgrpcontactdetails"><input class="search" data-grpdetailsevent="listen:keyup, updateAutoContact" data-label="bind:placeholder, tocontactlbl"><div class = "autocontact"><ul data-auto="foreach"><li data-auto="bind:innerHTML, contact.username; bind:highlight, selected" data-grpdetailsevent="listen:touchend, select"></li></ul></div></div></div></div>',a.plugins.addAll({label:new n(b),error:new n(m),color:new n(d,{setColor:function(e){this.setAttribute("style","background:"+e+";")},setSelected:function(e){e?this.innerHTML="&#10003;":this.innerHTML=""}}),group:new n(f,{setColor:function(e){this.setAttribute("style","background: url('img/connect/"+e+"') no-repeat top left; background-size: contain;")},setStyle:function(e){e?this.setAttribute("style","color: #5F8F28;"):this.setAttribute("style","color: #F27B3D;")},setVisible:function(e){e.length?this.classList.remove("invisible"):this.classList.add("invisible")}}),grpcontacts:new n(c,{setAvatar:function(t){var n,r;t&&(_frag=document.createDocumentFragment(),_ui=new o([t]),_ui.place(_frag),this.hasChildNodes()?this.replaceChild(_frag,this.firstChild):this.appendChild(_frag))},setSelected:function(e){e?this.innerHTML="&#10003;":this.innerHTML=""}}),auto:new n(v,{highlight:function(e){e?this.classList.add("selected"):this.classList.remove("selected")}}),grpdetailsevent:new r(a)}),a.selectColor=function(e,t){var n=t.getAttribute("data-color_id");d.loop(function(e,t){d.update(t,"selected",!1)}),d.update(n,"selected",!0),f.set("color",d.get(n).icon)},a.toggleHide=function(e,t){var n=t.getAttribute("name");t.classList.contains("hide")?(t.classList.remove("hide"),n==="add"?document.querySelector(".addgrpcontactdetails").classList.remove("invisible"):document.querySelector(".contactlistdetail").classList.remove("invisible")):(t.classList.add("hide"),n==="add"?document.querySelector(".addgrpcontactdetails").classList.add("invisible"):document.querySelector(".contactlistdetail").classList.add("invisible"))},a.select=function(e,t){var n=t.getAttribute("data-auto_id");v.get(n).selected?(a.removeContact(n),setTimeout(function(){v.update(n,"selected",!1)},200)):(a.addContact(n),setTimeout(function(){v.update(n,"selected",!0)},200))},a.addContact=function(t){var n=JSON.parse(c.toJSON()),r=v.get(t).contact,s=0;if(c.toJSON().search(r.userid)<0){for(i=0,l=n.length;i<l;i++)r.lastname>n[i].lastname?s++:r.lastname===n[i].lastname&&r.username>n[i].username&&s++;n.splice(s,0,r),c.reset(n),f.set("contacts",n)}},a.removeContact=function(t){var n=JSON.parse(c.toJSON());for(i=n.length-1;i>=0;i--)n[i].userid===v.get(t).contact.userid&&n.splice(i,1);c.reset(n),f.set("contacts",n)},a.updateAutoContact=function(e,t){var n=JSON.parse(v.toJSON()),r=y.get("connections");if(t.value===""){n=[];for(i=0,l=r.length;i<l;i++)r[i].type==="user"&&n.push({contact:r[i],selected:!1})}else if(e.keyCode===8||e.keyCode===46){n=[];for(i=0,l=r.length;i<l;i++)r[i].type==="user"&&n.push({contact:r[i],selected:!1});for(i=n.length-1;i>=0;i--)n[i].contact.username.search(t.value)!==0&&n.splice(i,1)}else for(i=n.length-1;i>=0;i--)n[i].contact.username.search(t.value)!==0&&n.splice(i,1);v.reset(n),v.loop(function(e,t){c.toJSON().search(e.contact.userid)>-1&&v.update(t,"selected",!0)})},a.discardContact=function(e,t){var n=t.getAttribute("data-grpcontacts_id"),r=c.get(n).userid;c.alter("splice",n,1),v.loop(function(e,t){e.contact.userid===r&&setTimeout(function(){v.update(t,"selected",!1)},200)}),f.set("contacts",JSON.parse(c.toJSON()))},a.press=function(e,t){t.classList.add("pressed")},a.cancel=function(e,t){t.classList.remove("pressed"),a.reset(h),document.querySelector("#groupdetails input.search").value=""},a.updateGroup=function(e,t){var n=y.get("connections"),r,i=JSON.parse(f.toJSON());t.classList.remove("pressed"),m.set("error","");if(i.username==="")m.set("error",b.get("nogrpname"));else if(i.intro==="")m.set("error",b.get("nogrpintro"));else if(!i.contacts.length)m.set("error",b.get("nocontactselected"));else for(r=n.length-1;r>=0;r--)n[r].type==="group"&&n[r].username===h.username&&(m.get("error")||(n.splice(r,1,i),y.set("connections",n),y.upload().then(function(){a.reset(i),m.set("error",b.get("groupupdated"))})))},a.reset=function(t){d.reset(p),d.loop(function(e,n){e.icon===t.color?d.update(n,"selected",!0):d.update(n,"selected",!1)}),f.reset(t),h=t,c.reset(t.contacts),v.reset([]),m.reset({error:""}),y.get("connections").forEach(function(e){e.type==="user"&&v.alter("push",{contact:e,selected:!1})}),v.loop(function(e,t){c.toJSON().search(e.contact.userid)>-1&&v.update(t,"selected",!0)})},a.init=function(){y.get("connections").forEach(function(e){e.type==="user"&&v.alter("push",{contact:e,selected:!1})})},a}});