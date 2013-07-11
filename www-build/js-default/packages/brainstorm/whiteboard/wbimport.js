/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","service/config","Bind.plugin","Event.plugin","service/utils","Store","Promise"],function(e,t,n,r,i,s,o,u){return function(a,f){var l=new e,c=n.get("labels"),h=new FileReader,p=new o({status:null}),d=null,v=new o({type:"import",content:""}),m,g=400,y=300,b=function(e){var t,n,r=document.getElementById("preview"),i=r.getContext("2d");t=e.width,n=e.height,t>n?t>g&&(n*=g/t,t=g):n>y&&(t*=y/n,n=y),r.width=t,r.height=n,i.drawImage(e,0,0,t,n)},w=function(e){var t=new u,r="/upload",i=new FormData,o="postit",a="sessions/"+m,f=document.getElementById("preview"),l=f.toDataURL("image/png"),c=new Date,h=e||n.get("user").get("_id")+"_"+c.getTime();return i.append("type",o),i.append("dir",a),i.append("filename",h),i.append("dataString",l),s.uploadFile(r,i,p,function(e){v.set("content",h),t.fulfill()}),t},E=function(){var e=document.getElementById("preview"),t=e.getContext("2d");t.clearRect(0,0,e.width,e.height)};return l.template='<div class="import"><ul id="importbuttons"><li><div class="importbutton choosepic" data-importevent="listen: mousedown, press; listen:mouseup, picturePreview"></div><label data-labels="bind:innerHTML, importpiclbl"></label></li><li><div class="importbutton takepic" data-importevent="listen: mousedown, press; listen:mouseup, cameraPreview"></div><label data-labels="bind:innerHTML, importcameralbl"></label></li></ul><div id="postpic" class="wbpostit invisible" data-importmodel="bind:setVisibility, content"><div class="postit-cancel postit-close" data-importevent="listen:mousedown,cancel"></div><div class="picframe"><canvas id="preview" data-importmodel="bind:showPreview, content"></canvas></div><div name="post" class = "postpostit" data-importevent="listen: mousedown, press; listen:mouseup, post"></div><div class = "delpostit" name="del" data-importevent="listen:mousedown, press;listen:mouseup, del"></div><div class="uploadprogress" data-importprogress="bind:showProgress, status"></div></div>',l.plugins.addAll({labels:new r(c),importmodel:new r(v,{setVisibility:function(e){e?this.classList.remove("invisible"):this.classList.add("invisible")},showPreview:function(e){var t,r=this,i=n.get("transport");e?(t={dir:m,filename:e},i.request("GetFile",t,function(e){var t=new Image,n=r.getContext("2d");t.src=e,r.width=t.width,r.height=t.height,n.drawImage(t,0,0)})):this.innerHTML=""}}),importprogress:new r(p,{showProgress:function(e){e?this.innerHTML=e+"%":this.innerHTML=""}}),importevent:new i(l)}),l.cancel=function(e,t){t.parentNode.classList.add("invisible"),f("import")},l.check=function(e,t){t.classList.remove("pressed"),t.files.length&&l.preview("change",t)},l.cameraPreview=function(e,t){function s(e){n.src=e,setTimeout(function(){b(n),t.classList.remove("pressed"),i.classList.add("invisible"),document.getElementById("postpic").classList.remove("invisible")},750)}function o(e){alert("error: "+e),t.classList.remove("pressed")}var n=new Image,r={quality:50,correctOrientation:!0},i=document.getElementById("importbuttons");navigator.camera.getPicture(s,o,r)},l.picturePreview=function(e,t){function o(e){r.src=e,setTimeout(function(){b(r),t.classList.remove("pressed"),s.classList.add("invisible"),document.getElementById("postpic").classList.remove("invisible")},1e3)}function u(e){alert("error: "+e),t.classList.remove("pressed")}var n=navigator.camera.PictureSourceType.PHOTOLIBRARY,r=new Image,i={quality:50,correctOrientation:!0,sourceType:n},s=document.getElementById("importbuttons");navigator.camera.getPicture(o,u,i)},l.press=function(e,t){t.classList.add("pressed")},l.post=function(e,t){w(v.get("content")).then(function(){!d&&d!==0?a.alter("push",JSON.parse(v.toJSON())):a.alter("splice",d,1,JSON.parse(v.toJSON())),t.classList.remove("pressed"),l.reset(),p.reset({status:""}),E(),document.getElementById("importbuttons").classList.remove("invisible"),f("import")})},l.reset=function(t){d=t,!d&&d!==0?v.reset({type:"import",content:""}):(v.reset(a.get(t)),l.dom.querySelector("#postpic").scrollIntoView())},l.setSessionId=function(e){m=e},l.del=function(e,t){(d||d===0)&&a.del(d),t.classList.remove("pressed"),t.parentNode.classList.add("invisible"),l.reset(),E(),document.getElementById("importbuttons").classList.remove("invisible"),f("import")},l}});