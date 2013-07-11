/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/map","Olives/Model-plugin","Olives/Event-plugin","service/config","Store","CouchDBStore"],function(e,t,n,r,i,s,o){return function(a){var f=new e,l=i.get("labels"),c=new o([]),h=i.get("user"),p=[],d=new s([]),v=new s({});return c.setTransport(i.get("transport")),f.plugins.addAll({labels:new n(l),tip:new n(v,{setTitle:function(e){e==="TIP:0"?this.innerHTML=l.get("signupwelcomeobject"):this.innerHTML=l.get("dyknow")}}),tipevent:new r(f)}),f.template='<div><div class="help-doctor"></div><div class="close-tip" data-tipevent="listen:mousedown, close"></div><div class="tip-screen"><legend data-tip="bind:setTitle, id"></legend><p data-tip = "bind: innerHTML, body"></p><div class="next-button" data-labels = "bind: innerHTML, nextbutton" data-tipevent="listen: mousedown, press; listen:mouseup, next"></div></div><div class="tip-footer"><input type="checkbox" data-tipevent="listen: change, doNotShow"><label data-labels="bind: innerHTML, notips"></label></div></div>',f.init=function(n){c.sync(i.get("db"),"about","_view/tip").then(function(){var e=h.get("lang");c.loop(function(t,n){var r=t.value;r.default_lang===e||!r.translations[e]?d.alter("push",{id:r._id,title:r.title,body:r.body}):d.alter("push",{id:r._id,title:r.translations[e].title,body:r.translations[e].body})}),n?v.reset(d.get(0)):(d.alter("splice",0,1),f.getRandomTip()),f.place(t.get("tip-popup")),document.getElementById("tip-popup").classList.add("visible"),document.getElementById("cache").classList.add("visible")})},f.getRandomTip=function(){var t=d.getNbItems(),n=Math.floor(Math.random()*t);t===0?f.close():(v.reset(d.get(n)),d.alter("splice",n,1))},f.press=function(e,t){t.classList.add("pressed")},f.next=function(e,t){t.classList.remove("pressed"),f.getRandomTip()},f.close=function(e,t){document.getElementById("tip-popup").classList.remove("visible"),document.getElementById("cache").classList.remove("visible")},f.doNotShow=function(e,t){var n;t.setAttribute("readonly","readonly"),t.checked===h.get("settings").showTips&&(n=h.get("settings"),n.showTips=!t.checked,h.set("settings",n),h.upload().then(function(){t.removeAttribute("readonly")}))},f}});