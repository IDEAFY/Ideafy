/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Event.plugin","Store","service/avatar"],function(e,t,n,r,s,o){return function(){var a=new e,f=new s({username:"",intro:"",type:"group",color:"graygroup.png",contacts:[]}),c=new s([{color:"#4D4D4D",icon:"graygroup.png",selected:!0},{color:"#657B99",icon:"bluegroup.png",selected:!1},{color:"#9AC9CD",icon:"azurgroup.png",selected:!1},{color:"#5F8F28",icon:"greengroup.png",selected:!1},{color:"#F2E520",icon:"yellowgroup.png",selected:!1},{color:"#F27B3D",icon:"orangegroup.png",selected:!1},{color:"#BD262C",icon:"redgroup.png",selected:!1}]),h=new s([]),p=new s([]),d=new s({error:""}),v={},m=t.get("user"),g=t.get("labels");return a.plugins.addAll({label:new n(g),error:new n(d),color:new n(c,{setColor:function(e){this.setAttribute("style","background:"+e+";")},setSelected:function(e){e?this.innerHTML="&#10003;":this.innerHTML=""}}),group:new n(f,{setColor:function(e){this.setAttribute("style","background: url('img/connect/"+e+"') no-repeat top left; background-size: contain;")},setStyle:function(e){e?this.setAttribute("style","color: #5F8F28;"):this.setAttribute("style","color: #F27B3D;")},setVisible:function(e){e.length?this.classList.remove("invisible"):this.classList.add("invisible")}}),contacts:new n(h,{setAvatar:function(t){var n,r;_frag=document.createDocumentFragment(),_ui=new o([t]),_ui.place(_frag),this.hasChildNodes()?this.replaceChild(_frag,this.firstChild):this.appendChild(_frag)},setSelected:function(e){e?this.innerHTML="&#10003;":this.innerHTML=""}}),auto:new n(p,{highlight:function(e){e?this.classList.add("selected"):this.classList.remove("selected")}}),addgrpevent:new r(a)}),a.template='<div id="addgroup"><div class="header blue-dark"><span class="newfolderlbl" data-label="bind:innerHTML, newfolderlbl"></span></div><div class = "detail-contents"><div class="folderpic" data-group="bind: setColor, color"></div><form><p><input type="text" class="input" data-group="bind:value, username" data-label="bind:placeholder, groupnamelbl"></p><p><textarea class="input" data-group="bind:value, intro" data-label="bind:placeholder, groupdesclbl"></textarea></p><legend data-label="bind:innerHTML, colortouch"></legend><ul class="groupcolors" data-color="foreach"><li data-color="bind:setColor, color; bind:setSelected, selected" data-addgrpevent="listen: mousedown, selectColor"></li></ul></form><div class = "groupcontactlist" data-group="bind: setVisible, contacts"><legend name="list" data-label="bind:innerHTML, grpcontacts" data-addgrpevent="listen: mousedown, toggleHide"></legend><ul class="contactlistdetail" data-contacts="foreach"><li class = "contact list-item" data-addgrpevent="listen:mousedown, discardContact"><div data-contacts="bind:setAvatar, userid"></div><p class="contact-name" data-contacts="bind:innerHTML, username"></p><div class="remove-contact"></div><p class="contact-intro" data-contacts="bind:innerHTML, intro"></p></li></ul></div><div class="addgroupbtns"><span class="errormsg" data-error="bind:innerHTML, error"></span><div class="addct" data-addgrpevent="listen:mousedown, press; listen:mouseup, add"></div><div class="cancelct" data-addgrpevent="listen:mousedown, press; listen:mouseup, cancel"></div></div><div class="addgrpcontacts"><legend name="add" data-label="bind:innerHTML, addgrpcontacts" data-addgrpevent="listen: mousedown, toggleHide"></legend><div class="addgrpcontactdetails"><input class="search" data-addgrpevent="listen:keyup, updateAutoContact" data-labels="bind:placeholder, tocontactlbl"><div class = "autocontact"><ul data-auto="foreach"><li data-auto="bind:innerHTML, contact.username; bind:highlight, selected" data-addgrpevent="listen:mouseup, select"></li></ul></div></div></div></div>',a.init=function(){m.get("connections").forEach(function(e){e.type==="user"&&p.alter("push",{contact:e,selected:!1})})},a.selectColor=function(e,t){var n=t.getAttribute("data-color_id");c.loop(function(e,t){c.update(t,"selected",!1)}),c.update(n,"selected",!0),f.set("color",c.get(n).icon)},a.toggleHide=function(e,t){var n=t.getAttribute("name");t.classList.contains("hide")?(t.classList.remove("hide"),n==="add"?document.querySelector(".addgrpcontactdetails").classList.remove("invisible"):document.querySelector(".contactlistdetail").classList.remove("invisible")):(t.classList.add("hide"),n==="add"?document.querySelector(".addgrpcontactdetails").classList.add("invisible"):document.querySelector(".contactlistdetail").classList.add("invisible"))},a.select=function(e,t){var n=t.getAttribute("data-auto_id");p.get(n).selected?(a.removeContact(n),setTimeout(function(){p.update(n,"selected",!1)},200)):(a.addContact(n),setTimeout(function(){p.update(n,"selected",!0)},200))},a.addContact=function(t){var n=JSON.parse(h.toJSON()),r=p.get(t).contact,s=0;if(h.toJSON().search(r.userid)<0){for(i=0,l=n.length;i<l;i++)r.lastname>n[i].lastname?s++:r.lastname===n[i].lastname&&r.username>n[i].username&&s++;n.splice(s,0,r),h.reset(n),f.set("contacts",n)}},a.removeContact=function(t){var n=JSON.parse(h.toJSON());for(i=n.length-1;i>=0;i--)n[i].userid===p.get(t).contact.userid&&n.splice(i,1);h.reset(n)},a.updateAutoContact=function(e,t){var n=JSON.parse(p.toJSON()),r=m.get("connections"),s,o=t.value.toLowerCase();if(t.value===""){n=[];for(i=0,l=r.length;i<l;i++)r[i].type==="user"&&n.push({contact:r[i],selected:!1})}else if(e.keyCode===8||e.keyCode===46){n=[];for(i=0,l=r.length;i<l;i++)r[i].type==="user"&&n.push({contact:r[i],selected:!1});for(i=n.length-1;i>=0;i--)n[i].contact.username.toLowerCase().search(o)!==0&&n.splice(i,1)}else for(i=n.length-1;i>=0;i--)s=n[i].contact.username.toLowerCase(),s.search(o)!==0&&n.splice(i,1);p.reset(n),p.loop(function(e,t){h.toJSON().search(e.contact.userid)>-1&&p.update(t,"selected",!0)})},a.discardContact=function(e,t){var n=t.getAttribute("data-contacts_id"),r=h.get(n).userid;h.alter("splice",n,1),p.loop(function(e,t){e.contact.userid===r&&setTimeout(function(){p.update(t,"selected",!1)},200)})},a.reset=function(){f.reset({username:"",intro:"",type:"group",color:"graygroup.png",contacts:[]}),h.reset([]),p.reset([]),d.reset({error:""}),m.get("connections").forEach(function(e){e.type==="user"&&p.alter("push",{contact:e,selected:!1})})},a.press=function(e,t){t.classList.add("pushed")},a.cancel=function(e,t){t.classList.remove("pushed"),a.reset(),document.querySelector("#addgroup input.search").value=""},a.add=function(e,t){var n=m.get("connections"),r=0,s=JSON.parse(f.toJSON());t.classList.remove("pushed"),d.set("error","");if(s.username==="")d.set("error",g.get("nogrpname"));else if(s.intro==="")d.set("error",g.get("nogrpintro"));else if(!s.contacts.length)d.set("error",g.get("nocontactselected"));else{for(i=0,l=n.length;i<l;i++)n[i].type==="user"?s.username>n[i].lastname&&r++:(s.username===n[i].username&&d.set("error",g.get("grpnameexists")),s.username>n[i].username&&r++);d.get("error")||(n.splice(r,0,s),m.set("connections",n),m.upload().then(function(){a.reset()}))}},a}});