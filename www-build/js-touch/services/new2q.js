/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","service/config","CouchDBDocument","Promise","lib/spin.min"],function(e,t,n,r,i,s,o,u){return function(){var a=new e,f=new s(i.get("TQTemplate")),l=i.get("user"),c=i.get("labels"),h=140,p=new s({error:""}),d=(new u({color:"#8cab68",lines:10,length:8,width:4,radius:8,top:-8,left:340})).spin();return f.setTransport(i.get("transport")),a.plugins.addAll({new2q:new n(f,{setLength:function(e){e===10&&this.setAttribute("maxlength",h)}}),labels:new n(c),errormsg:new n(p,{setError:function(e){switch(e){case"noquestion":this.innerHTML=c.get("noquestion");break;case"lengthexceeded":this.innerHTML=c.get("lengthexceeded")+" ("+h+c.get("characters")+")";break;default:this.innerHTML=e}}}),new2qevent:new r(a)}),a.template='<div><div class = "header blue-dark"><span data-labels="bind: innerHTML, createquestion"></span><div class="close-popup" data-new2qevent="listen:touchstart, cancel"></div></div><form class="form"><p><textarea class="description input" data-labels="bind:placeholder, questionplaceholder" data-new2q="bind: value, question; bind: setLength, type" data-new2qevent="listen:input, checkLength"></textarea></p><div><span class="errormsg" data-errormsg="bind:setError, error"></span><div class="sendmail" data-new2qevent="listen:touchstart, press; listen:touchend, upload" data-labels="bind:innerHTML, publishlbl">Publish</div></div></form></div>',a.render(),a.place(t.get("new2q-popup")),a.press=function(e,t){t.classList.add("pressed")},a.closePopup=function(){document.getElementById("new2q-popup").classList.remove("appear"),document.getElementById("cache").classList.remove("appear"),f.unsync(),f.reset(i.get("TQTemplate")),p.reset({error:""})},a.cancel=function(e,t){a.closePopup()},a.upload=function(e,t){var n=new Date,r,s="Q:"+n.getTime();t.classList.remove("pressed"),f.get("question")||p.set("error","noquestion"),!p.get("error")&&!f.get("_id")&&(t.classList.add("invisible"),d.spin(t.parentNode),r=setInterval(function(){p.get("error")===c.get("uploadinprogress")?p.set("error",c.get("uploadinprogress")+"..."):p.set("error",c.get("uploadinprogress"))},150),f.set("author",l.get("_id")),f.set("username",l.get("username")),f.set("creation_date",[n.getFullYear(),n.getMonth(),n.getDate(),n.getHours(),n.getMinutes(),n.getSeconds()]),f.set("lang",l.get("lang")),f.sync(i.get("db"),s).then(function(){return f.upload()}).then(function(){i.get("transport").request("UpdateUIP",{userid:l.get("_id"),type:f.get("type"),docId:s,question:f.get("question")},function(e){var o,u=l.get("connections"),h=u.length,v=[],m={type:"2Q+",docId:s,status:"unread",date:[n.getFullYear(),n.getMonth(),n.getDate(),n.getHours(),n.getMinutes(),n.getSeconds()],author:l.get("_id"),username:l.get("username"),firstname:l.get("firstname"),toList:"",ccList:"",object:l.get("username")+c.get("askednew"),body:f.get("question"),signature:""};e!=="ok"&&console.log(e),clearInterval(r),r=setInterval(function(){p.get("error")===c.get("notifyingcontacts")?p.set("error",c.get("notifyingcontacts")+"..."):p.set("error",c.get("notifyingcontacts"))},150);for(o=0;o<h;o++)u[o].type==="user"&&v.push(u[o].userid);m.dest=v,i.get("transport").request("Notify",m,function(e){var e=JSON.parse(e);console.log(e)}),d.stop(),t.classList.remove("invisible"),a.closePopup()})}))},a.checkLength=function(e,t){t.value.length>=h?p.set("error","lengthexceeded"):p.set("error","")},a}});