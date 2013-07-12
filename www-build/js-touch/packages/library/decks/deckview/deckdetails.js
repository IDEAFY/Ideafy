/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Event.plugin","Store","service/utils","CouchDBDocument","CouchDBView","lib/spin.min"],function(e,t,n,r,i,s,o,u,a){return function(l){var c=new e,h=new i,p=new i({max:0}),d=new i([]),v=new u,m=t.get("user"),g=t.get("labels"),y,b=60,w=60,E=function(e){var t,n,r=document.createElement("canvas"),i=r.getContext("2d");return t=e.width,n=e.height,t<n?(n*=b/t,t=b):(t*=w/n,n=w),r.width=t,r.height=n,i.drawImage(e,0,0,t,n),r.toDataURL("image/png")},S=function(e,t){var n=new Image,r=document.createElement("canvas"),i=r.getContext("2d"),s=b,o=w,u,a;n.src=e,setTimeout(function(){r.width=s,r.height=o,u=Math.floor(Math.max(0,(n.width-s)/2)),a=Math.floor(Math.max(0,(n.height-o)/2)),i.drawImage(n,u,a,s,o,0,0,s,o),t(r.toDataURL("image/png"))},300)},x=function(){var e="/upload",t=new FormData,n="deckpic",r=y;t.append("type",n),t.append("dir",h.get("_id")),t.append("filename","decklogo"),t.append("dataString",r),s.uploadFile(e,t,null,function(e){console.log(e)})};return v.setTransport(t.get("transport")),c.plugins.addAll({labels:new n(g),range:new n(p,{setCursorWidth:function(e){}}),cards:new n(d,{setStyle:function(e){e&&e==="null"?this.classList.add("invisible"):this.classList.remove("invisible")},formatTitle:function(e){var t,n=this;e&&(t=n.getAttribute("data-cards_id"),d.get(t).type&&d.get(t).type!==4?this.innerHTML=e.substring(0,1).toUpperCase()+e.substring(1).toLowerCase():(this.innerHTML=e.toUpperCase(),this.setAttribute("style","font-family:Helvetica;")))},setPic:function(e){var n;e&&e.search("img/decks/")>-1?this.setAttribute("style","background-image:url('"+e+"');"):e?(n={dir:"cards",filename:e},t.get("transport").request("GetFile",n,function(e){node.setAttribute("style","background-image: url('"+e+"');")})):this.setAttribute("style","background-image: none;")}}),deckdetails:new n(h,{formatDate:function(e){e?this.innerHTML=s.formatDate(e):this.innerHTML=""},setPic:function(e){var n,r,i=this;e===""?this.setAttribute("style","background-image:url('img/connect/graygroup.png');"):e==="img/logo.png"?this.setAttribute("style","background-image:url('img/logo.png');"):e==="decklogo"&&(dir="decks",json={dir:dir,filename:h.get("_id")},t.get("transport").request("GetFile",json,function(e){i.setAttribute("style","background-image: url('"+e+"');")}))},edit:function(e){e===m.get("_id")?(this.setAttribute("contenteditable",!0),this.classList.add("editable")):(this.setAttribute("contenteditable",!1),this.classList.remove("editable"))}}),carouselevent:new r(c),editevent:new r(c)}),c.template='<div class="deckdetails"><div class="deckinfo"><div class="deckheader"><div class="decklogo" data-deckdetails="bind: setPic, picture_file" data-editevent="listen: touchstart, editPic; listen: touchend, changePic"></div><p><h2 data-deckdetails="bind:innerHTML, title; bind: edit, created_by" data-editevent="listen:input, displayButtons"></h2><span data-labels="bind:innerHTML, designedby"></span><span data-deckdetails="bind: innerHTML, author"></span></p><span class="date" ></span></div><div class="deckbody"><p class="deckdescription" data-deckdetails="bind: innerHTML, description; bind: edit, created_by" data-editevent="listen:input, displayButtons"></p><div class="cancelmail invisible" data-editevent="listen:touchstart, press; listen:touchend, cancel" data-labels="bind:innerHTML, cancellbl"></div><div class="sendmail invisible" data-editevent="listen:touchstart, press; listen:touchend, upload" data-labels="bind:innerHTML, savelbl">Save</div></div></div><div class="deckcarousel"><div class="innercarousel"></div><ul data-cards="foreach"><li data-cards="bind: setStyle,style"><div class="card"><div class="cardpicture" data-cards="bind:setPic,picture_file"></div><div class="cardtitle" data-cards="bind: formatTitle, title"></div></div></li></ul><input class="deckslider" type="range" value=0 min=0 data-range="bind: max, max; bind: setCursorWidth, max" data-carouselevent="listen: input, updateCards"></div></div>',c.displayCards=function(t){var n,r=[];d.reset([]);for(n=0;n<5;n++)v.get(t-2+n)?r[n]=v.get(t-2+n).value:r[n]={style:"null"};d.reset(r)},c.updateCards=function(e,t){c.displayCards(t.value)},c.displayButtons=function(e,t){c.dom.querySelector(".cancelmail").classList.remove("invisible"),c.dom.querySelector(".sendmail").classList.remove("invisible")},c.hideButtons=function(){c.dom.querySelector(".cancelmail").classList.add("invisible"),c.dom.querySelector(".sendmail").classList.add("invisible")},c.editPic=function(e,t){h.get("created_by")===m.get("_id")&&t.setAttribute("style","background-image: url('img/brainstorm/reload.png')")},c.changePic=function(e,t){var n=navigator.camera.PictureSourceType.PHOTOLIBRARY,r=new Image,i={quality:50,correctOrientation:!0,sourceType:n},s,o,u=(new a({color:"#4d4d4d",lines:12,length:12,width:6,radius:10})).spin();s=function(e){r.src=e,t.setAttribute("style","background-image: none"),u.spin(t),setTimeout(function(){S(E(r),function(e){t.setAttribute("style","background-image: url('"+e+"')"),u.stop(),y=e,c.displayButtons()})},750)},o=function(e){alert("error: "+e)},navigator.camera.getPicture(s,o,i)},c.press=function(e,t){t.classList.add("pressed")},c.cancel=function(e,t){var n=JSON.parse(h.toJSON());h.reset({}),h.reset(n),c.hideButtons(),t.classList.remove("pressed")},c.upload=function(e,n){var r=new o,i=c.dom.querySelector(".deckheader h2").innerHTML,s=c.dom.querySelector(".deckdescription").innerHTML,u=(new a({color:"#8cab68",lines:10,length:8,width:4,radius:8,top:-6,left:30})).spin(n);n.classList.add("invisible"),r.setTransport(t.get("transport")),r.sync(t.get("db"),h.get("_id")).then(function(){var e=new Date;return y&&(x(),r.set("picture_file","decklogo")),r.set("title",i),r.set("description",s),r.set("last_updated",[e.getFullYear(),e.getMonth(),e.getDate()]),r.upload()}).then(function(){l("updated",r.get("_id")),c.hideButtons(),n.classList.remove("pressed"),u.stop()}),y&&x()},c.reset=function(n){c.dom.querySelector(".cancelmail").classList.add("invisible"),c.dom.querySelector(".sendmail").classList.add("invisible"),y=null,h.reset(n),p.set("max",0),v.unsync(),v.sync(t.get("db"),"library","_view/cards",{key:'"'+h.get("_id")+'"'}).then(function(){p.set("max",v.getNbItems()-1),c.displayCards(0)})},c}});