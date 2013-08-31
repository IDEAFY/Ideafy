/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/map","Olives/Model-plugin","Olives/Event-plugin","service/config","service/help"],function(e,t,n,r,i,s){return function(u,a,f,l){var c=new e,h=i.get("user"),p=i.get("db"),d=i.get("labels"),v="step";return c.plugins.addAll({labels:new n(d),model:new n(u,{setTitle:function(e){var t=new Date;e&&e.username&&this.setAttribute("placeholder",d.get("quickstarttitleplaceholderpre")+e.username+d.get("quickstarttitleplaceholderpost"))}}),quickstartevent:new r(c)}),c.template='<div id = "quickstart"><div class="previousbutton" data-quickstartevent="listen: touchstart, press; listen: mousedown, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quickstart" data-quickstartevent="listen:mousedown, toggleProgress"></div><div class="help-brainstorm" data-quickstartevent="listen:mousedown, help"></div><form class="quickstart-form"><label data-labels="bind:innerHTML, quickstarttitle"></label><hr/><textarea class="quickstart-title" autofocus="" name="title" data-model="bind:value, title; bind: setTitle, initiator"></textarea><label data-labels="bind:innerHTML, quickstartdesc"></label><hr/><textarea class="quickstart-desc" name="description" data-model="bind:value, description" data-labels="bind: placeholder, quickstartdescplaceholder"></textarea><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quickstartevent="listen: mousedown, press; listen:mouseup, next"></div></form><div>',c.place(t.get("quickstart")),c.press=function(e,t){t.classList.add("pressed")},c.next=function(e,t){v==="step"?(v="screen",u.get("title")===""&&u.set("title",d.get("quickstarttitleplaceholderpre")+u.get("initiator").username+d.get("quickstarttitleplaceholderpost")),u.set("lang",h.get("lang")),u.set("_id","S:QUICK:"+u.get("startTime")),u.sync(p,u.get("_id")),h.set("sessionInProgress",{id:u.get("_id"),type:"quick"}),h.upload().then(function(){console.log("move to next screen",u.toJSON()),t.classList.remove("pressed"),f("quickstart")})):(t.classList.remove("pressed"),f("quickstart"))},c.prev=function(e,t){t.classList.remove("pressed"),a("quickstart")},c.toggleProgress=function(e,t){l(t)},c.reset=function(t){var n=new Date,r=u.get("step");t?(r==="quickstart"?v="step":next="screen",r!=="quickwrapup"&&u.set("resumeTime",n.getTime())):(u.set("startTime",n.getTime()),u.set("date",[n.getFullYear(),n.getMonth(),n.getDate()]),v="step")},c.help=function(e,t){s.setContent("quickstarthelp"),document.getElementById("cache").classList.add("appear"),document.getElementById("help-popup").classList.add("appear")},c}});