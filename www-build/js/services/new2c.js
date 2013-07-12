/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/map","Olives/Model-plugin","Olives/Event-plugin","service/config","Store"],function(e,t,n,r,i,s){return new function(){var u=new e,a=new s({userid:"",username:""}),f=i.get("user"),l=new s,c=i.get("labels"),h=i.get("transport"),p,d=!1,v=new s({error:""});return u.plugins.addAll({new2c:new n(l),dest:new n(a,{setHeader:function(e){this.innerHTML=c.get("sendtcprefix")+e+c.get("sendtcsuffix")}}),labels:new n(c),errormsg:new n(v),new2cevent:new r(u)}),u.template='<div><div class = "header blue-dark"><span data-dest="bind: setHeader, username"></span><div class="close-popup" data-new2cevent="listen:mousedown, cancel"></div></div><form class="form"><p><textarea class="description input" data-labels="bind:placeholder, twocentplaceholder" data-new2c="bind: value, message"></textarea></p><div><span class="errormsg" data-errormsg="bind:innerHTML, error"></span><div class="sendmail" data-new2cevent="listen:mousedown, press; listen:mouseup, upload" data-labels="bind:innerHTML, sendlbl"></div></div></form></div>',u.render(),u.place(t.get("new2c-popup")),u.press=function(e,t){t.classList.add("pressed")},u.closePopup=function(){document.getElementById("new2c-popup").classList.remove("appear"),document.getElementById("cache").classList.remove("appear"),l.reset(),a.reset(),v.reset({error:""})},u.reset=function(n){p=n,t.get("new2c-popup").classList.add("appear"),t.get("cache").classList.add("appear"),a.set("userid",p.userid),a.set("username",p.username),l.reset({author:f.get("_id"),message:"",firstname:f.get("firstname"),username:f.get("username"),date:[],datemod:"",plusones:0,replies:[]}),d=!1},u.cancel=function(e,t){u.closePopup()},u.upload=function(e,t){var n=new Date,r={},i;l.get("message")?(d=!0,i=setInterval(function(){v.get("error")===c.get("sendinginprogress")?v.set("error",c.get("sendinginprogress")+" ..."):v.set("error",c.get("sendinginprogress"))},150),l.set("date",[n.getFullYear(),n.getMonth(),n.getDate()]),r.tc=JSON.parse(l.toJSON()),r.userid=a.get("userid"),r.username=a.get("username"),h.request("SendTwocent",r,function(e){var n=p.twocents||[],s,o=f.get("connections");if(e==="ok"){n.unshift(r.tc),p.twocents=n;for(s=o.length-1;s>=0;s--)o[s].type==="user"&&o[s].userid===p.userid&&o.splice(s,1,p);f.set("connections",o),f.upload().then(function(){clearInterval(i),t.classList.remove("pressed"),u.closePopup()})}else v.set("error","something went wrong - try again later"),clearInterval(i),t.classList.remove("pressed")})):(v.set("error",c.get("nomessage")),t.classList.remove("pressed"))},u}});