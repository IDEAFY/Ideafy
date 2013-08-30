/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Place.plugin","Event.plugin","service/config","CouchDBDocument","Store","Promise","service/cardpopup","service/help","service/utils","lib/spin.min","./mubchat"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p){return function(d,v,m,g,y){var b=new e,w,E=new p,S=s.get("labels"),x=s.get("transport"),T=s.get("db"),N=s.get("user"),C={},k=new u({timer:null,display:!1}),L,A=new u({"char":{selected:!1,left:null,popup:!1},context:{selected:!1,left:null,popup:!1},problem:{selected:!1,left:null,popup:!1}}),O=new u({"char":{id:"",title:S.get("char"),pic:""},context:{id:"",title:S.get("context"),pic:""},problem:{id:"",title:S.get("problem"),pic:""}}),M={"char":0,context:0,problem:0},_=!0,D={"char":new u,context:new u,problem:new u},P="",H=null,B=0,j="step",F=(new h({color:"#657B99",lines:10,length:8,width:4,radius:8,top:337,left:490})).spin(),I={};return b.plugins.addAll({labels:new n(S),musetup:new n(A,{setReload:function(e){e===0?this.classList.add("reload"):this.classList.remove("reload")},updateNext:function(e){j==="step"&&A.get("char").selected&&A.get("context").selected&&A.get("problem").selected&&N.get("_id")===d.get("initiator").id?this.classList.remove("invisible"):this.classList.add("invisible")},popup:function(e){e?this.classList.add("highlighted"):this.classList.remove("highlighted")},setSelected:function(e){e?this.classList.add("pushed"):this.classList.remove("pushed")}}),musetuptimer:new n(k,{setTime:function(e){e&&(this.innerHTML=c.formatDuration(e))},displayTimer:function(e){e?this.classList.add("showtimer"):this.classList.remove("showtimer")}}),musetupcards:new n(O,{removeDefault:function(e){e?this.classList.remove("defaultcard"):this.classList.add("defaultcard")},formatTitle:function(e){e?this.innerHTML=e.substring(0,1).toUpperCase()+e.substring(1).toLowerCase():this.innerHTML=e},setPic:function(e){var t=this;e?e.search("img/decks")>-1?this.setAttribute("style","background-image:url('"+e+"');"):(json={dir:"cards",filename:e},s.get("transport").request("GetFile",json,function(e){t.setAttribute("style","background:white; background-image: url('"+e+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;")})):this.setAttribute("style","background-image: none;")}}),place:new r({chat:E}),musetupevent:new i(b)}),b.template='<div id = "musetup"><div class="previousbutton" data-musetupevent="listen: touchstart, press; listen: touchstart, prev"></div><div id="musetup-popup" class="invisible"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, musetup" data-musetupevent="listen:touchstart, toggleProgress"></div><div class="timer" data-musetuptimer="bind:setTime, timer; bind: displayTimer, display" data-musetupevent="listen:touchstart,toggleTimer"></div><div class="help-brainstorm" data-musetupevent="listen:touchstart, help"></div><div class="drawarea"><div class="decks"><div class="drawbutton drawchar" name="char" data-musetupevent="listen: touchstart, push; listen:touchend, draw" data-musetup="bind: setReload, char.left"></div><div class="drawbutton drawcontext" name="context" data-musetupevent="listen: touchstart, push; listen:touchend, draw" data-musetup="bind:setReload, context.left"></div><div class="drawbutton drawproblem" name="problem" data-musetupevent="listen: touchstart, push; listen:touchend, draw" data-musetup="bind:setReload, problem.left"></div></div><div class="cards"><div class="card char defaultcard" name="char" data-musetupevent="listen:touchstart, zoom" data-musetupcards="bind:removeDefault, char.pic" data-musetup="bind: popup, char.popup"><div class="cardpicture" data-musetupcards="bind: setPic, char.pic"></div><div class="cardtitle" data-musetupcards="bind:formatTitle, char.title">Character</div></div><div class="card context defaultcard" name="context" data-musetupevent="listen:touchstart, zoom" data-musetupcards="bind:removeDefault, context.pic" data-musetup="bind: popup, context.popup"><div class="cardpicture" data-musetupcards="bind: setPic, context.pic"></div><div class="cardtitle" data-musetupcards="bind:formatTitle, context.title">Context</div></div><div class="card problem defaultcard" name="problem" data-musetupevent="listen:touchstart, zoom" data-musetupcards="bind:removeDefault, problem.pic" data-musetup="bind: popup, problem.popup"><div class="cardpicture" data-musetupcards="bind: setPic, problem.pic"></div><div class="cardtitle" data-musetupcards="bind:formatTitle, problem.title">Problem</div></div></div><div class="confirmdraw"><div class="drawok" name="char" data-musetup="bind:setSelected, char.selected" data-musetupevent="listen: touchstart, pushOk; listen:touchend, accept"></div><div class="drawok" name="context" data-musetup="bind:setSelected, context.selected" data-musetupevent="listen: touchstart, pushOk; listen:touchend, accept"></div><div class="drawok" name="problem" data-musetup="bind:setSelected, problem.selected" data-musetupevent="listen: touchstart, pushOk; listen:touchend, accept"></div></div><div class="next-button invisible" data-labels="bind:innerHTML, nextbutton" data-musetupevent="listen: touchstart, press; listen:touchend, next" data-musetup="bind:updateNext, char.selected;bind:updateNext, context.selected;bind:updateNext, problem.selected"></div></div><div class="sessionchat" data-place="place:chat"></div></div>',b.press=function(e,t){t.classList.add("pressed")},b.next=function(e,t){F.spin(t.parentNode),t.classList.add("invisible"),t.classList.remove("pressed"),j==="step"?(j="screen",v.set("characters",O.get("char")),v.set("contexts",O.get("context")),v.set("problems",O.get("problem")),clearInterval(L),k.set("display",!0),b.updateSessionScore(k.get("timer")).then(function(){return d.unsync(),d.sync(s.get("db"),d.get("_id"))}).then(function(){E.conclude("next"),d.set("elapsedTimers",{musetup:k.get("timer")}),d.set("characters",[O.get("char").id]),d.set("contexts",[O.get("context").id]),d.set("problems",[O.get("problem").id]),g("musetup")})):g("musetup")},b.stopSpinner=function(){F.stop()},b.help=function(e,t){l.setContent("musetuphelp"),document.getElementById("cache").classList.add("appear"),document.getElementById("help-popup").classList.add("appear")},b.prev=function(e,t){t.classList.remove("pressed"),m("musetup")},b.toggleProgress=function(e,t){y()},b.toggleTimer=function(e,t){d.get("initiator").id===N.get("_id")&&k.set("display",!k.get("display"))},b.push=function(e,t){j!=="screen"&&N.get("_id")===d.get("initiator").id&&t.classList.add("pushed")},b.draw=function(e,t){var n=t.getAttribute("name"),r=A.get(n);_now=new Date,N.get("_id")===d.get("initiator").id&&j==="step"&&_&&(_=!1,r.left===0&&(C[n]=v.get("deck")[n].concat(),r.left=C[n].length,A.set(n,r)),r.selected?(_=!0,alert("please unlock selected card first")):r.selected===!1?b.drawCard(n).then(function(){var e=!1;t.classList.remove("pushed"),_=!0,A.loop(function(t,n){t.popup===!0&&(e=!0)}),e&&b.setPopup(n)}):(t.classList.remove("pushed"),_=!0))},b.pushOk=function(e,t){var n=I[t.getAttribute("name")]||null;N.get("_id")===d.get("initiator").id&&j==="step"&&(n?I[t.getAttribute("name")].spin(t):I[t.getAttribute("name")]=(new h).spin(t))},b.accept=function(e,t){var n=t.getAttribute("name"),r=A.get(n);j==="step"&&d.get("initiator").id===N.get("_id")&&(O.get(n).id?r.selected=!r.selected:r.selected=!1,d.unsync(),d.sync(s.get("db"),d.get("_id")).then(function(){return d.set("selected_"+n,r.selected),d.upload()}).then(function(){I[t.getAttribute("name")].stop(),selection.set(n,r)}))},b.zoom=function(e,t){var n=t.getAttribute("name");b.setPopup(n)},b.setPopup=function(t){var n={x:0,y:257},r="left",i=A.get(P)||"",s=A.get(t);i&&(i.popup=!1,A.set(P,i)),s.popup=!0,A.set(t,s),P=t,t==="char"&&(n.x=382),t==="context"&&(n.x=102,r="right"),t==="problem"&&(n.x=249,r="right"),D[t].getNbItems()&&w.reset(D[t].toJSON(),n,r,document.getElementById("musetup-popup"))},b.closePopup=function(){var t=A.get(P);t.popup=!1,A.set(P,t),P=""},w=new f(b.closePopup),b.getChatUI=function(){return E},b.initTimer=function(e){var t=new Date,n=t.getTime(),r=e||0;k.set("timer",r),d.get("step")==="musetup"&&(clearInterval(L),L=setInterval(function(){var e=new Date;k.set("timer",r+e.getTime()-n)},1e3))},b.reset=function(t){E.clear(),d.get("chat")[1]&&E.reset(d.get("chat")[1]),t?(j="screen",E.dom.querySelector(".chatread").classList.add("extended"),B=d.get("elapsedTimers").musetup||0,A.reset({"char":{selected:!0,left:1,popup:!1},context:{selected:!0,left:1,popup:!1},problem:{selected:!0,left:1,popup:!1}}),P="",k.set("timer",B),k.set("display",!0),d.get("characters").length&&b.getDeck(d.get("deck")).then(function(){return b.getCard(d.get("characters")[0],D.char)}).then(function(){var e=D.char;return O.set("char",{id:e.get("_id"),title:e.get("title"),pic:e.get("picture_file")}),v.set("characters",O.get("char")),b.getCard(d.get("contexts")[0],D.context)}).then(function(){var e=D.context;return O.set("context",{id:e.get("_id"),title:e.get("title"),pic:e.get("picture_file")}),v.set("contexts",O.get("context")),b.getCard(d.get("problems")[0],D.problem)}).then(function(){var e=D.problem;O.set("problem",{id:e.get("_id"),title:e.get("title"),pic:e.get("picture_file")}),v.set("problems",O.get("problem"))})):b.init()},b.getDeck=function(t){var n=new a,r=new o;return r.setTransport(x),r.sync(T,t).then(function(){var e,t={},i=s.get("user").get("lang");!r.get("default_lang")||r.get("default_lang")===i?e=JSON.parse(r.toJSON()):r.get("translations")&&r.get("translations")[i]?e=r.get("translations")[i]:e=JSON.parse(r.toJSON()),t.char=e.content.characters,t.context=e.content.contexts,t.problem=e.content.problems,t.techno=e.content.techno,["char","context","problem","techno"].forEach(function(e){t[e][0]==="newcard"&&t[e].shift()}),v.set("deck",t),n.fulfill(),r.unsync()}),n},b.getCard=function(t,n){var r=new a,i=new o;return i.setTransport(x),i.sync(T,t).then(function(){n.reset(JSON.parse(i.toJSON())),r.fulfill(),i.unsync()}),r},b.drawCard=function(t){var n=new a,r=Math.floor(Math.random()*C[t].length),i=C[t][r];return d.set("drawn_"+t,i),d.upload().then(function(){M[t]++,C[t].splice(r,1),n.fulfill()}),n},b.updateDrawnCard=function(t,n){var r,i,s=new a;return t&&n&&(r=A.get(t),i=O.get(t),b.getCard(n,D[t]).then(function(){var e=D[t];i.id=n,i.title=e.get("title"),i.pic=e.get("picture_file"),O.set(t,i),r.left=C[t].length,A.set(t,r),s.fulfill()})),s},b.updateSessionScore=function(t){var n=new a,r={sid:d.get("_id"),step:"musetup",time:t,cards:M.char+M.context+M.problem};return x.request("UpdateSessionScore",r,function(e){e.res==="ok"?n.fulfill():n.reject()}),n},b.init=function(){O.reset({"char":{id:"",title:S.get("char"),pic:""},context:{id:"",title:S.get("context"),pic:""},problem:{id:"",title:S.get("problem"),pic:""}}),A.reset({"char":{selected:!1,left:null,popup:!1},context:{selected:!1,left:null,popup:!1},problem:{selected:!1,left:null,popup:!1}}),M.char=0,M.context=0,M.problem=0,D={"char":new u,context:new u,problem:new u},P="",N.get("_id")===d.get("initiator").id?b.getDeck(d.get("deck")).then(function(){var e=v.get("deck");C.char=e.char.concat(),C.context=e.context.concat(),C.problem=e.problem.concat(),_=!0,b.initTimer()}):k.set("display",!1),j="step"},d.watchValue("drawn_char",function(e){e&&b.updateDrawnCard("char",e)}),d.watchValue("drawn_context",function(e){e&&b.updateDrawnCard("context",e)}),d.watchValue("drawn_problem",function(e){e&&b.updateDrawnCard("problem",e)}),d.watchValue("selected_char",function(e){var t;t=A.get("char"),t.selected=e,A.set("char",t),e&&v.set("characters",O.get("char"))}),d.watchValue("selected_context",function(e){var t;t=A.get("context"),t.selected=e,A.set("context",t),e&&v.set("contexts",O.get("context"))}),d.watchValue("selected_problem",function(e){var t;t=A.get("problem"),t.selected=e,A.set("problem",t),e&&v.set("problems",O.get("problem"))}),d.watchValue("elapsedTimers",function(e){e.musetup&&(k.set("timer",e.musetup),k.set("display",!0))}),b}});