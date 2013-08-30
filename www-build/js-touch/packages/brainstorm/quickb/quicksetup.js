/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","service/config","CouchDBDocument","Store","Promise","service/cardpopup","service/help","service/utils","lib/spin.min"],function(e,t,n,r,i,s,o,u,a,f,l,c){return function(p,d,v,m,g){var y=new e,b,w=t.get("quicksetup"),E=i.get("labels"),S=i.get("transport"),x=i.get("db"),T=i.get("user"),N={},C=new o({timer:null,display:!1}),k,L=new o({"char":{selected:!1,left:null,popup:!1},context:{selected:!1,left:null,popup:!1},problem:{selected:!1,left:null,popup:!1}}),A=new o({"char":{id:"",title:E.get("char"),pic:""},context:{id:"",title:E.get("context"),pic:""},problem:{id:"",title:E.get("problem"),pic:""}}),O={"char":0,context:0,problem:0},M=!0,_={"char":new o,context:new o,problem:new o},D="",P=null,H=0,B="step",j=(new c({color:"#657B99",lines:10,length:8,width:4,radius:8,top:373,left:373})).spin();return y.plugins.addAll({labels:new n(E),quicksetup:new n(L,{setReload:function(e){e===0?this.classList.add("reload"):this.classList.remove("reload")},updateNext:function(e){L.get("char").selected&&L.get("context").selected&&L.get("problem").selected?this.classList.remove("invisible"):this.classList.add("invisible")},popup:function(e){e?this.classList.add("highlighted"):this.classList.remove("highlighted")},setSelected:function(e){e?this.classList.add("pushed"):this.classList.remove("pushed")}}),quicksetuptimer:new n(C,{setTime:function(e){this.innerHTML=l.formatDuration(e)},displayTimer:function(e){e?this.classList.add("showtimer"):this.classList.remove("showtimer")}}),quicksetupcards:new n(A,{removeDefault:function(e){e?this.classList.remove("defaultcard"):this.classList.add("defaultcard")},formatTitle:function(e){e?this.innerHTML=e.substring(0,1).toUpperCase()+e.substring(1).toLowerCase():this.innerHTML=e},setPic:function(e){var t=this;e?e.search("img/decks")>-1?this.setAttribute("style","background-image:url('"+e+"');"):(json={dir:"cards",filename:e},i.get("transport").request("GetFile",json,function(e){t.setAttribute("style","background:white; background-image: url('"+e+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;")})):this.setAttribute("style","background-image: none;")}}),quicksetupevent:new r(y)}),y.template='<div id = "quicksetup"><div class="previousbutton" data-quicksetupevent="listen: touchstart, press; listen: touchstart, prev"></div><div id="quicksetup-popup" class="invisible"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicksetup" data-quicksetupevent="listen:touchstart, toggleProgress"></div><div class="timer" data-quicksetuptimer="bind:setTime, timer; bind: displayTimer, display" data-quicksetupevent="listen:touchstart,toggleTimer"></div><div class="help-brainstorm" data-quicksetupevent="listen:touchstart, help"></div><div class="drawarea"><div class="decks"><div class="drawbutton drawchar" name="char" data-quicksetupevent="listen: touchstart, push; listen:touchend, draw" data-quicksetup="bind: setReload, char.left"></div><div class="drawbutton drawcontext" name="context" data-quicksetupevent="listen: touchstart, push; listen:touchend, draw" data-quicksetup="bind:setReload, context.left"></div><div class="drawbutton drawproblem" name="problem" data-quicksetupevent="listen: touchstart, push; listen:touchend, draw" data-quicksetup="bind:setReload, problem.left"></div></div><div class="cards"><div class="card char defaultcard" name="char" data-quicksetupevent="listen:touchstart, zoom" data-quicksetupcards="bind:removeDefault, char.pic" data-quicksetup="bind: popup, char.popup"><div class="cardpicture" data-quicksetupcards="bind: setPic, char.pic"></div><div class="cardtitle" data-quicksetupcards="bind:formatTitle, char.title">Character</div></div><div class="card context defaultcard" name="context" data-quicksetupevent="listen:touchstart, zoom" data-quicksetupcards="bind:removeDefault, context.pic" data-quicksetup="bind: popup, context.popup"><div class="cardpicture" data-quicksetupcards="bind: setPic, context.pic"></div><div class="cardtitle" data-quicksetupcards="bind:formatTitle, context.title">Context</div></div><div class="card problem defaultcard" name="problem" data-quicksetupevent="listen:touchstart, zoom" data-quicksetupcards="bind:removeDefault, problem.pic" data-quicksetup="bind: popup, problem.popup"><div class="cardpicture" data-quicksetupcards="bind: setPic, problem.pic"></div><div class="cardtitle" data-quicksetupcards="bind:formatTitle, problem.title">Problem</div></div></div><div class="confirmdraw"><div class="drawok" name="char" data-quicksetup="bind:setSelected, char.selected" data-quicksetupevent="listen: touchstart, push; listen:touchend, accept"></div><div class="drawok" name="context" data-quicksetup="bind:setSelected, context.selected" data-quicksetupevent="listen: touchstart, push; listen:touchend, accept"></div><div class="drawok" name="problem" data-quicksetup="bind:setSelected, problem.selected" data-quicksetupevent="listen: touchstart, push; listen:touchend, accept"></div></div><div class="next-button invisible" data-labels="bind:innerHTML, nextbutton" data-quicksetupevent="listen: touchstart, press; listen:touchend, next" data-quicksetup="bind:updateNext, char.selected;bind:updateNext, context.selected;bind:updateNext, problem.selected"></div></div></div>',y.place(w),y.press=function(e,t){t.classList.add("pressed")},y.next=function(e,t){j.spin(t.parentNode),t.classList.add("invisible"),t.classList.remove("pressed"),B==="step"?(B="screen",d.set("characters",A.get("char")),d.set("contexts",A.get("context")),d.set("problems",A.get("problem")),clearInterval(k),C.set("display",!0),y.updateSessionScore(C.get("timer")).then(function(){return p.unsync(),p.sync(i.get("db"),p.get("_id"))}).then(function(){p.set("elapsedTimers",{quicksetup:C.get("timer")}),p.set("characters",[A.get("char").id]),p.set("contexts",[A.get("context").id]),p.set("problems",[A.get("problem").id]),m("quicksetup")})):m("quicksetup")},y.stopSpinner=function(){j.stop(),y.dom.querySelector(".next-button").classList.remove("invisible")},y.help=function(e,t){f.setContent("quicksetuphelp"),document.getElementById("cache").classList.add("appear"),document.getElementById("help-popup").classList.add("appear")},y.prev=function(e,t){t.classList.remove("pressed"),v("quicksetup")},y.toggleProgress=function(e,t){g()},y.toggleTimer=function(e,t){C.set("display",!C.get("display"))},y.push=function(e,t){B!=="screen"&&t.classList.add("pushed")},y.draw=function(e,t){var n=t.getAttribute("name"),r=L.get(n);_now=new Date,B==="step"&&M&&(r.left===0&&(N[n]=d.get("deck")[n].concat(),r.left=N[n].length,L.set(n,r)),r.selected&&alert("please unlock selected card first"),M&&!r.selected&&(M=!1,r.selected===!1?y.drawCard(n).then(function(){var e=!1;t.classList.remove("pushed"),M=!0,L.loop(function(t,n){t.popup===!0&&(e=!0)}),e&&y.setPopup(n)}):(t.classList.remove("pushed"),M=!0)))},y.accept=function(e,t){var n=t.getAttribute("name"),r=L.get(n);B==="step"&&(A.get(n).id?r.selected?(r.selected=!1,L.set(n,r)):(r.selected=!0,L.set(n,r)):(r.selected=!1,L.set(n,r)))},y.zoom=function(e,t){var n=t.getAttribute("name");y.setPopup(n)},y.setPopup=function(t){var n={x:0,y:337},r="left",i=L.get(D)||"",s=L.get(t);i&&(i.popup=!1,L.set(D,i)),s.popup=!0,L.set(t,s),D=t,t==="char"&&(n.x=382),t==="context"&&(n.x=102,r="right"),t==="problem"&&(n.x=249,r="right"),_[t].getNbItems()&&b.reset(_[t].toJSON(),n,r,document.getElementById("quicksetup-popup"))},y.closePopup=function(){var t=L.get(D);t.popup=!1,L.set(D,t),D=""},b=new a(y.closePopup),y.initTimer=function(e){var t=new Date,n=t.getTime(),r=e||0;C.set("display",!1),C.set("timer",r),p.get("step")==="quicksetup"&&(k=setInterval(function(){var e=new Date;C.set("timer",r+e.getTime()-n)},1e3))},y.reset=function(t){B="step",t?(H=p.get("elapsedTimers").quicksetup||0,p.get("characters").length?(B="screen",L.reset({"char":{selected:!0,left:1,popup:!1},context:{selected:!0,left:1,popup:!1},problem:{selected:!0,left:1,popup:!1}}),D="",C.set("timer",H),C.set("display",!0),y.getDeck(p.get("deck")).then(function(){return y.getCard(p.get("characters")[0],_.char)}).then(function(){var e=_.char;return A.set("char",{id:e.get("_id"),title:e.get("title"),pic:e.get("picture_file")}),d.set("characters",A.get("char")),y.getCard(p.get("contexts")[0],_.context)}).then(function(){var e=_.context;return A.set("context",{id:e.get("_id"),title:e.get("title"),pic:e.get("picture_file")}),d.set("contexts",A.get("context")),y.getCard(p.get("problems")[0],_.problem)}).then(function(){var e=_.problem;A.set("problem",{id:e.get("_id"),title:e.get("title"),pic:e.get("picture_file")}),d.set("problems",A.get("problem"))})):(y.init(),y.initTimer(H))):y.init()},y.getDeck=function(t){var n=new u,r=new s;return r.setTransport(S),r.sync(x,t).then(function(){var e,t={},s=i.get("user").get("lang");!r.get("default_lang")||r.get("default_lang")===s?e=JSON.parse(r.toJSON()):r.get("translations")&&r.get("translations")[s]?e=r.get("translations")[s]:e=JSON.parse(r.toJSON()),t.char=e.content.characters,t.context=e.content.contexts,t.problem=e.content.problems,t.techno=e.content.techno,["char","context","problem","techno"].forEach(function(e){t[e][0]==="newcard"&&t[e].shift()}),d.set("deck",t),n.fulfill(),setTimeout(function(){r.unsync()},2e3)}),n},y.getCard=function(t,n){var r=new u,i=new s;return i.setTransport(S),i.sync(x,t).then(function(){n.reset(JSON.parse(i.toJSON())),r.fulfill(),i.unsync()}),r},y.drawCard=function(t){var n=new u,r=L.get(t),i=A.get(t),s=Math.floor(Math.random()*N[t].length),o=N[t][s];return y.getCard(o,_[t]).then(function(){var e=_[t];O[t]++,N[t].splice(s,1),i.id=o,i.title=e.get("title"),i.pic=e.get("picture_file"),A.set(t,i),r.left=N[t].length,L.set(t,r),n.fulfill()}),n},y.updateSessionScore=function(t){var n=new u,r={sid:p.get("_id"),step:"quicksetup",time:t,cards:O.char+O.context+O.problem};return S.request("UpdateSessionScore",r,function(e){e.res==="ok"?n.fulfill():n.reject()}),n},y.init=function(){y.getDeck(i.get("user").get("active_deck")).then(function(){var e=d.get("deck");N.char=e.char.concat(),N.context=e.context.concat(),N.problem=e.problem.concat(),O.char=0,O.context=0,O.problem=0,_={"char":new o,context:new o,problem:new o},D="",M=!0,P=null,A.reset({"char":{id:"",title:E.get("char"),pic:""},context:{id:"",title:E.get("context"),pic:""},problem:{id:"",title:E.get("problem"),pic:""}}),L.reset({"char":{selected:!1,left:null,popup:!1},context:{selected:!1,left:null,popup:!1},problem:{selected:!1,left:null,popup:!1}})})},y}});