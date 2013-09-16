/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","Olives/Model-plugin","Olives/Event-plugin","service/config"],function(e,t,n,r){return function(s,o,u){var a=new e,f,l=!0,c=!1,h=r.get("transport");return a.plugins.addAll({wbmain:new t(s,{displayPost:function(e){var t=this,n=t.getAttribute("data-wbmain_id"),r=s.get(n).content,i=s.get(n).style,o=s.get(n).background,u;switch(e){case"postit":t.classList.remove("photo"),t.classList.remove("drawing"),t.innerHTML='<div class="inner-postit">'+r+"</div>",t.setAttribute("style","background:url('img/brainstorm/"+i.img+"') no-repeat center center; background-size: contain; color:"+i.marker+";");break;case"import":t.classList.add("photo"),t.classList.remove("drawing"),this.innerHTML="",u={sid:f,filename:r},h.request("GetFile",u,function(e){t.setAttribute("style","background:white; background-image: url('"+e+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;")});break;case"drawing":t.classList.remove("photo"),t.classList.add("drawing"),this.innerHTML="",u={sid:f,filename:r},h.request("GetFile",u,function(e){t.setAttribute("style","background:"+o+"; background-image: url('"+e+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;")});break;default:}}}),wbevent:new n(a)}),a.template='<div class="wbmain"><ul class="wblist" data-wbmain="foreach"><li class="wb-item postit" data-wbmain="bind: displayPost, type" data-wbevent="listen: mouseup, edit; listen:mousemove, cancelEdit"></li><ul><div>',a.edit=function(e,t){var n=t.getAttribute("data-wbmain_id"),r=s.get(n).type;l?c?s.get(n).type!=="postit"&&(t.classList.contains("enlarge")?t.classList.remove("enlarge"):t.classList.add("enlarge")):(o.set(r,"active"),u(r,n)):l=!0},a.cancelEdit=function(e,t){l=!1},a.setSessionId=function(e){f=e},a.setReadonly=function(e){c=e},a}});