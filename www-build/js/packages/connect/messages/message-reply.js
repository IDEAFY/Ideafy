/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","Store","Olives/Model-plugin","Olives/Event-plugin","service/config","service/utils","Promise","service/autocontact"],function(e,t,n,r,s,o,u,a){return function(){var c=new e,h=new t,p,d={},v=new t({errormsg:""}),m=s.get("labels"),g=s.get("user"),y=s.get("transport"),b=!1,w=function(e){var t=/<(.|\n)*?>/g;return e.replace(t,"")},E=function(e){var t=h.get("toList").toLowerCase().split(/,|;/),n=h.get("ccList").toLowerCase().split(/,|;/),r=JSON.stringify(g.get("connections")).toLowerCase(),s=[],o={},a=new u;arr=[];for(i=0,l=t.length;i<l;i++){if(!(r.search(t[i].trim())>-1||p.toList.search(t[i].trim())>-1||p.ccList.search(t[i].trim())>-1)){v.set("errormsg",m.get("tolbl")+" : "+t[i].trim()+m.get("notavalidcontact")),b=!1,a.reject();break}s.push(t[i].trim())}if(!v.get("errormsg")&&n[0]!=="")for(i=0,l=n.length;i<l;i++){if(!(r.search(n[i].trim())>-1||p.toList.search(n[i].trim())>-1||p.ccList.search(n[i].trim())>-1)){v.set("errormsg",m.get("tolbl")+" : "+n[i].trim()+m.get("notavalidcontact")),b=!1,a.reject();break}s.push(n[i].trim())}return v.get("errormsg")||(o.list=s,y.request("CheckRecipientList",o,function(t){var n=[];if(!t.error){for(i=0,l=t.length;i<l;i++)n.push(t[i].value);e(n),a.resolve()}else v.set("errormsg",t.error),a.reject()})),a};return c.plugins.addAll({labels:new n(m),errormsg:new n(v),reply:new n(h,{setAvatar:function(e){this.setAttribute("style","background: url('"+s.get("avatar")+"') no-repeat center center;background-size:cover;")},setCC:function(e){switch(e){case"replyall":break;case"forward":break;default:this.innerHTML=h.get("message").username}},setSubject:function(e){switch(e){case"replyall":break;case"forward":break;default:this.innerHTML="  Re : "+h.get("message").object}}}),replyevent:new r(c)}),c.template='<div><div class="avatar" data-reply="bind: setAvatar, message.author"></div><form class="form"><p><textarea name="toList" class="mail-header" data-labels="bind:placeholder, tocontactlbl" data-reply="bind: value, toList" data-replyevent="listen: mousedown, displayAutoContact; listen:keypress, updateAutoContact"></textarea></p><div id="tolistauto" class="invisible"></div><p><textarea name="ccList" class="mail-header" data-labels="bind:placeholder, cclbl" data-reply="bind: value, ccList" data-replyevent="listen: mousedown, displayAutoContact; listen:keypress, updateAutoContact"></textarea></p><div id="cclistauto" class="invisible"></div><p><span class="subject" data-labels="bind:innerHTML, subjectlbl"></span><span data-reply="bind:innerHTML, object"></span></p><p><textarea class="input" data-reply="bind:value, body"></textarea></p><blockquote class="original" data-reply="bind:innerHTML, original"></blockquote><p><legend>Signature</legend><textarea class="signature" data-reply="bind:value, signature"></textarea></p><div class="sendmail-footer"><p class="send"><label class="cancelmail" data-labels="bind:innerHTML, cancellbl" data-replyevent="listen: mousedown, press; listen:mouseup, cancel">Cancel</label><label class="sendmail" data-labels="bind:innerHTML, sendlbl" data-replyevent="listen:mousedown, press; listen:mouseup, send">Send</label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p></div></div>',c.reset=function(t,n){p=t,h.reset({signature:"",original:"",author:g.get("_id"),username:g.get("username"),firstname:g.get("firstname"),toList:"",ccList:"",object:"",body:""}),h.set("type",n),g.get("signature")?h.set("signature",g.get("signature")):h.set("signature",g.get("username")),h.set("original",m.get("on")+o.formatDate(t.date)+"</p><p>"+t.username+m.get("ideawrotelbl")+"</p><p>"+m.get("subjectlbl")+t.object+"</p><hr><p>"+t.body+"</p>");switch(n){case"replyall":t.ccList?h.set("toList",t.username.concat(", "+t.ccList)):h.set("toList",t.username),t.object.search("Re :")!==0?h.set("object","Re : "+t.object):h.set("object",t.object);break;case"forward":h.set("toList",""),t.object.search("Fwd :")!==0?h.set("object","Fwd : "+t.object):h.set("object",t.object);break;default:h.set("toList",t.username),t.object.search("Re :")!==0?h.set("object","Re : "+t.object):h.set("object",t.object)}h.set("message",t),c.place(document.getElementById("msgreply"))},c.displayAutoContact=function(e,t){var n=t.getAttribute("name"),r,i,s=function(e){h.set(n,e)};n==="toList"?r=document.getElementById("tolistauto"):r=document.getElementById("cclistauto"),i=new a(r,t,s),d.name=i,r.classList.remove("invisible")},c.updateAutoContact=function(e,t){var n=t.getAttribute("name");e.keyCode===13?t.removeChild(t.firstChild):e.keyCode===186||e.keyCode===188?d.name.init():d.name.updateList()},c.press=function(e,t){t.classList.add("pressed")},c.cancel=function(e,t){t.classList.remove("pressed"),b=!1,document.getElementById("msgreply").classList.add("invisible")},c.send=function(e,t){var n=new Date,r={};t.classList.remove("pressed"),b||(b=!0,v.set("errormsg",""),r=JSON.parse(h.toJSON()),r.type="MSG",r.body=r.body.concat("<br><br>"+r.original),r.dest=[],E(function(e){r.dest=e}).then(function(){v.get("errormsg")?(console.log(result),b=!1):(r.date=[n.getFullYear(),n.getMonth(),n.getDate(),n.getHours(),n.getMinutes(),n.getSeconds()],y.request("Notify",r,function(e){b=!1,v.set("errormsg",m.get("messagesentok")),setTimeout(function(){v.set("errormsg",""),b=!1,document.getElementById("msgreply").classList.add("invisible")},2e3)}))}))},c}});