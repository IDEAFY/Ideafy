/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/map","service/config","Olives/Model-plugin","Olives/UI-plugin","Amy/Delegate-plugin","Amy/Stack-plugin","Amy/Control-plugin","./mtc-stack","./twoqlist","Store"],function(e,t,n,r,s,o,u,a,f,c,h){return function(){var d=new e,v=new u,m=new a(d),g=new f,y,b,w=[{name:"#mytwoq",active:!0},{name:"#contacttwoq",active:!1},{name:"#mytwoc",active:!1}],E=new h(w),S=new h,x=new h([]),T=n.get("user"),N=T.get("connections"),C=n.get("labels"),k=n.get("db");d.plugins.addAll({labels:new r(C),twoqbuttons:new r(E,{setBg:function(e){switch(e){case"#mytwoq":this.classList.add("mytwoq");break;case"#contacttwoq":this.classList.add("contacttwoq");break;case"#mytwoc":this.classList.add("mytwoc");break;default:}},setActive:function(e){e?this.classList.add("pushed"):this.classList.remove("pushed")}}),mtctools:new r(S,{setVisible:function(e){this.getAttribute("name")===e?this.classList.remove("invisible"):this.classList.add("invisible")},setLegend:function(e){switch(e){case"#mytwoq":this.innerHTML=C.get("mytwoquestions");break;case"#contacttwoq":this.classList.add("contacttwoq");break;case"#mytwoc":this.innerHTML=C.get("mytwocents");break;default:}},updateLegend:function(e){e&&S.get("view")==="#contacttwoq"&&(this.innerHTML=C.get("twoqprefix")+e+C.get("twoqsuffix"))}}),auto:new r(x),mtcliststack:v,mtcdetails:new s({mtcDetails:g}),mtccontrol:m,mtcevent:new o(d)}),d.template='<div id="connect-tc"><div id="mtc-list"><div class="header blue-light"><span data-labels="bind: innerHTML, mtcheadertitle"></span><div class="option right" data-mtcevent="listen: mousedown, plus"></div></div><ul class="twoqbuttons" data-twoqbuttons="foreach"><li data-twoqbuttons="bind: setBg,name; bind:setActive, active" data-mtcevent="listen:mousedown, selectView; listen: mouseup, showView"></li></ul><div class="selectcontact" name = "#contacttwoq" data-mtctools="bind:setVisible, view"><legend>Select a contact</legend><input class="search" data-mtcevent="listen:mousedown, updateAutoContact; listen:keyup, updateAutoContact" data-labels="bind:placeholder, tocontactlbl" data-mtctools = "bind:value, contact"><div class="rightcaret" data-mtcevent="listen: mousedown, updateAutoContact"></div><div class = "autocontact invisible"><ul data-auto="foreach"><li data-auto="bind:innerHTML, contact.username; bind:highlight, selected" data-mtcevent="listen:mousedown, highlightContact; listen:mouseup, selectContact"></li></ul></div></div><legend data-mtctools="bind:setLegend, view; bind: updateLegend, contact"></legend><input name="#mytwoq" class="search" type="text" data-mtctools="bind:setVisible, view" data-labels="bind: placeholder, searchmsgplaceholder" data-mtcevent="listen: input, search"><input name="#contacttwoq" class="search" type="text" data-mtctools="bind:setVisible, view" data-labels="bind: placeholder, searchmsgplaceholder" data-mtcevent="listen: keypress, search"><input name="#mytwoc" class="search" type="text" data-mtctools="bind:setVisible, view" data-labels="bind: placeholder, searchmsgplaceholder" data-mtcevent="listen: keypress, search"><div data-mtcliststack="destination" data-mtccontrol="radio:li,selected,mousedown,selectStart"></div></div><div id="mtc-detail" data-mtcdetails="place:mtcDetails" class="details"></div></div>',d.place(t.get("connect-twocents")),d.plus=function(){t.get("new2q-popup").classList.add("appear"),t.get("cache").classList.add("appear")},d.selectView=function(e,t){var n=t.getAttribute("data-twoqbuttons_id");E.loop(function(e,t){t===parseInt(n)?E.update(t,"active",!0):E.update(t,"active",!1)}),S.set("view",E.get(n).name)},d.showView=function(e,t){var n=t.getAttribute("data-twoqbuttons_id");switch(E.get(n).name){case"#mytwoq":v.getStack().show("#mytwoq"),g.setView("#defaultPage");break;case"#contacttwoq":v.getStack().show("#contacttwoq"),g.setView("#defaultPage");break;case"#mytwoc":v.getStack().show("#blank"),g.setView("2C")}},d.updateAutoContact=function(e,t){var n=JSON.parse(x.toJSON()),r,s,o=document.getElementById("mtc-list"),u=o.querySelector(".autocontact");u.classList.contains("invisible")&&u.classList.remove("invisible");if(!t.value||t.value===""){n=[];for(i=0,l=N.length;i<l;i++)N[i].type==="user"&&n.push({contact:N[i]});x.reset(n)}else{s=t.value.toLowerCase();for(i=n.length-1;i>=0;i--)r=n[i].contact.username.toLowerCase(),r.search(s)!==0&&n.splice(i,1);x.reset(n)}},d.highlightContact=function(e,t){t.classList.add("highlighted")},d.selectContact=function(e,t){var n=t.getAttribute("data-auto_id"),r=document.getElementById("mtc-list"),i=r.querySelector(".autocontact");t.classList.remove("highlighted"),S.set("contact",x.get(n).contact.username),i.classList.add("invisible"),b.resetQuery({key:'"'+x.get(n).contact.userid+'"',descending:!0})},d.selectStart=function(e,t){var n=v.getStack().getCurrentScreen().getModel(),r;if(S.get("view")==="#mytwoq"||S.get("view")==="#contacttwoq")r=e.target.getAttribute("data-twoqlist_id"),g.reset("2Q",n.get(r))},d.search=function(e,t){v.getStack().getCurrentScreen().search(t.value)},n.get("observer").watch("display-twoq",function(e,t){b.resetQuery({key:'"'+t+'"',descending:!0}).then(function(){v.getStack().show("#contacttwoq"),S.set("view","#contacttwoq"),E.loop(function(e,t){e.name==="#contacttwoq"?E.update(t,"active",!0):E.update(t,"active",!1)}),b.search(e),m.init(0),g.reset("2Q",b.getModel().get(0))})}),n.get("observer").watch("display-twoc",function(){v.getStack().show("#blank"),S.set("view","#mytwoc"),E.loop(function(e,t){e.name==="#mytwoc"?E.update(t,"active",!0):E.update(t,"active",!1)}),g.setView("2C")});for(i=0,l=N.length;i<l;i++)N[i].type==="user"&&x.alter("push",{contact:N[i],selected:!1});return y=new c("user",k,"questions","_view/questionsbyauthor",{key:'"'+T.get("_id")+'"',descending:!0}),b=new c("contact",k,"questions","_view/questionsbyauthor",{key:'"Blank_List"',descending:!0}),blank=new c("contact",k,"questions","_view/questionsbyauthor",{key:'"Blank_List"',descending:!0}),v.getStack().add("#mytwoq",y),v.getStack().add("#contacttwoq",b),v.getStack().add("#blank",blank),y.init().then(function(){v.getStack().show("#mytwoq"),S.set("view","#mytwoq"),m.init(0),g.init("default")}),d}});