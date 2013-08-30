/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Bind.plugin","Event.plugin","service/config","lib/spin.min"],function(e,t,n,r,i){return function(o,u,a){var f=new e,l,c=!0,h=!1,p=r.get("transport");return f.plugins.addAll({wbmain:new t(o,{displayPost:function(e){var t=this,n=t.getAttribute("data-wbmain_id"),r=o.get(n).content,s=o.get(n).style,u=o.get(n).background,a,f,c;switch(e){case"postit":t.classList.remove("photo"),t.classList.remove("drawing"),t.innerHTML='<div class="inner-postit">'+r.replace(/\n/g,"<br>")+"</div>",t.setAttribute("style","background:url('img/brainstorm/"+s.img+"') no-repeat center center; background-size: contain; color:"+s.marker+";");break;case"import":t.classList.add("photo"),t.classList.remove("drawing"),c=(new i).spin(t),this.innerHTML="",a="sessions/"+l,f={dir:a,filename:r},p.request("GetFile",f,function(e){t.setAttribute("style","background:white; background-image: url('"+e+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;"),c.stop()});break;case"drawing":t.classList.remove("photo"),t.classList.add("drawing"),c=(new i).spin(t),this.innerHTML="",a="sessions/"+l,f={dir:a,filename:r},p.request("GetFile",f,function(e){t.setAttribute("style","background:"+u+"; background-image: url('"+e+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;"),c.stop()});break;default:}}}),wbevent:new n(f)}),f.template='<div class="wbmain"><ul class="wblist" data-wbmain="foreach"><li class="wb-item postit" data-wbmain="bind: displayPost, type" data-wbevent="listen: touchend, edit; listen:touchmove, cancelEdit"></li><ul><div>',f.edit=function(e,t){var n=t.getAttribute("data-wbmain_id"),r=o.get(n).type;c?h?o.get(n).type!=="postit"&&(t.classList.contains("enlarge")?t.classList.remove("enlarge"):t.classList.add("enlarge")):(u.set(r,"active"),a(r,n)):c=!0},f.cancelEdit=function(e,t){c=!1},f.setSessionId=function(e){l=e},f.setReadonly=function(e){h=e},f}});