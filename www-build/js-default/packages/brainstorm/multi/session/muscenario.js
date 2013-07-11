/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","Place.plugin","service/config","Store","CouchDBDocument","service/cardpopup","../../whiteboard/whiteboard","Promise","service/utils","lib/spin.min","./mubchat"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p){return function(v,m,g,y,b){var w=new e,E,S,x=new p,T=s.get("labels"),N=s.get("user"),C=s.get("db"),k=new o,L=new o,A=new o,O=new o({"char":{id:"",title:"",pic:""},context:{id:"",title:"",pic:""},problem:{id:"",title:"",pic:""}}),M={cardpopup:{"char":!1,context:!1,problem:!1},postit:"inactive","import":"inactive",drawing:"inactive",ready:!1,showstory:!1,shownext:!1,readonly:!1},_=new o(M),D=new o({timer:null,display:!1}),P,H,B=new o({title:"",story:"",solution:""}),j=new o([]),F=new f("scenario",j,_,"mu"),I,q=0,R="step",U=s.get("transport"),z=(new h({color:"#657B99",lines:10,length:8,width:4,radius:8,top:695,left:670})).spin();return w.isLeader=function(){return v.get("initiator")&&v.get("initiator").id===N.get("_id")},w.plugins.addAll({labels:new n(T,{setPlaceholder:function(e){this.setAttribute("placeholder",e)}}),cards:new n(O,{formatTitle:function(e){e&&(this.innerHTML=e.substring(0,1).toUpperCase()+e.substring(1).toLowerCase())},setPic:function(e){e&&this.setAttribute("style","background-image:url('"+e+"');")}}),wbtools:new n(_,{setActive:function(e){e==="active"?this.classList.add("pushed"):this.classList.remove("pushed")},setReady:function(e){w.isLeader()?e?this.classList.remove("invisible"):this.classList.add("invisible"):this.classList.add("invisible")},showStory:function(e){e?this.classList.remove("invisible"):this.classList.add("invisible")},toggleToolbox:function(e){e?this.classList.add("invisible"):this.classList.remove("invisible")},setReadonly:function(e){e?this.setAttribute("readonly","readonly"):this.removeAttribute("readonly")},popup:function(e){e?this.classList.add("highlighted"):this.classList.remove("highlighted")}}),muscenariotimer:new n(D,{setTime:function(e){this.innerHTML=c.formatDuration(e)},displayTimer:function(e){e?this.classList.add("showtimer"):this.classList.remove("showtimer")}}),scenario:new n(B),wbstack:F,place:new i({chat:x}),muscenarioevent:new r(w)}),w.template='<div id = "muscenario"><div class="previousbutton" data-muscenarioevent="listen: mousedown, press; listen: mousedown, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, muscenario" data-muscenarioevent="listen:mousedown, toggleProgress"></div><div class="timer" data-muscenariotimer="bind:setTime, timer; bind: displayTimer, display" data-muscenarioevent="listen:mousedown,toggleTimer"></div><div id="muscenario-left"><div class="scenario-cards leftarea folded" data-muscenarioevent="listen:mousedown, fold"><div class = "card char" data-wbtools="bind:popup,cardpopup.char" name="char" data-muscenarioevent="listen:mousedown, zoom"><div class="cardpicture" data-cards="bind:setPic,char.pic"></div><div class="cardtitle" data-cards="bind:formatTitle,char.title">Character</div></div><div class="card context" name="context" data-wbtools="bind: popup,cardpopup.context" data-muscenarioevent="listen:mousedown, zoom"><div class="cardpicture" data-cards="bind:setPic,context.pic"></div><div class="cardtitle" data-cards="bind: formatTitle,context.title">Context</div></div><div class="card problem" name="problem" data-wbtools="bind:popup, cardpopup.problem" data-muscenarioevent="listen:mousedown, zoom"><div class="cardpicture" data-cards="bind:setPic,problem.pic"></div><div class="cardtitle" data-cards="bind:formatTitle,problem.title">Problem</div></div><div class="caret"></div></div><div id="muscenario-popup"></div><div class ="toolbox" data-wbtools="bind:toggleToolbox, showstory"><div class="toolbox-button"><div class="postit-button" name="postit" data-wbtools="bind:setActive, postit" data-muscenarioevent="listen: mousedown, push; listen:mouseup, post"></div><legend data-labels="bind:innerHTML, post">Post-it</legend></div><div class="toolbox-button"><div class="importpic-button" name="import" data-wbtools="bind:setActive, import" data-muscenarioevent="listen: mousedown, push; listen:mouseup, importpic"></div><legend data-labels="bind:innerHTML, import">Import pictures</legend></div><div class="toolbox-button"><div class="drawingtool-button" name="drawing" data-wbtools="bind:setActive, drawing" data-muscenarioevent="listen: mousedown, push; listen:mouseup, draw"></div><legend data-labels="bind:innerHTML, draw">Drawing tool</legend></div><div class="finish-button invisible" data-wbtools="bind:setReady, ready" data-labels="bind:innerHTML, finishbutton" data-muscenarioevent="listen: mousedown, press; listen:mouseup, finish"></div></div></div><div id="muscenario-right" class="workarea"><div id="scenario-whiteboard" class="whiteboard" data-muscenarioevent = "listen:mousedown, toggleView"><div class="stack" data-wbstack="destination"></div><div class="caret descending invisible" data-muscenarioevent="listen:mousedown, toggleCaret"></div></div><div id = "muscenario-writeup" class="writeup invisible" data-wbtools="bind: showStory,showstory"><textarea class = "enterTitle" maxlength="30" data-labels="bind:setPlaceholder, storytitleplaceholder" data-scenario="bind:value, title" data-wbtools="bind:setReadonly, readonly" data-muscenarioevent="listen:input, updateField"></textarea><div class="setPrivate"></div><div class="setPublic"></div><textarea class = "enterDesc" data-labels="bind:setPlaceholder, storydescplaceholder" data-scenario="bind:value, story" data-wbtools="bind:setReadonly, readonly" data-muscenarioevent="listen:input, updateField"></textarea><textarea class = "enterSol" data-labels="bind:setPlaceholder, storysolplaceholder" data-scenario="bind:value, solution" data-wbtools="bind:setReadonly, readonly" data-muscenarioevent="listen:input, updateField"></textarea></div><div class="next-button invisible" data-wbtools="bind:setReady, shownext" data-labels="bind:innerHTML, nextbutton" data-muscenarioevent="listen: mousedown, press; listen:mouseup, next"></div></div><div class="sessionchat" data-place="place:chat"></div></div>',w.place(t.get("muscenario")),w.press=function(e,t){t.classList.add("pressed")},w.isLeader=function(){return v.get("initiator")&&v.get("initiator").id===N.get("_id")},w.next=function(e,t){z.spin(t.parentNode),t.classList.add("invisible"),t.classList.remove("pressed"),R==="step"?(R="screen",_.set("readonly",!0),clearInterval(P),D.set("display",!0),clearInterval(H),m.set("scenario",JSON.parse(B.toJSON())),v.unsync(),v.sync(C,v.get("_id")).then(function(){var e;return x.conclude("next"),e=v.get("elapsedTimers"),e.muscenario=D.get("timer"),v.set("elapsedTimers",e),v.set("scenario",[m.get("scenario")]),v.upload()}).then(function(){return w.updateSessionScore(D.get("timer"))}).then(function(){y("muscenario")})):y("muscenario")},w.stopSpinner=function(){z.stop()},w.prev=function(e,t){t.classList.remove("pressed"),g("muscenario")},w.toggleProgress=function(e,t){b()},w.toggleTimer=function(e,t){w.isLeader()&&D.set("display",!D.get("display"))},w.push=function(e,t){var n=t.getAttribute("name");_.set(n,"active")},w.zoom=function(e,t){e.stopPropagation();var n=t.getAttribute("name");w.setPopup(n)},w.fold=function(e,t){v.get("scReady")||(t.classList.toggle("folded"),t.querySelector(".caret").classList.toggle("folding"),S&&E.close())},w.setPopup=function(t){var n={x:240,y:130},r="left",i=O.get(t),s=_.get("cardpopup"),o="",a;S&&(s[S]=!1),s[t]=!0,_.set("cardpopup",s),S=t,t==="char"&&(n.y=120,i.id===k.get("_id")&&(o=k.toJSON())),t==="context"&&(n.y=290,i.id===L.get("_id")&&(o=L.toJSON())),t==="problem"&&(n.y=350,i.id===A.get("_id")&&(o=A.toJSON())),o?E.reset(o,n,r,document.getElementById("muscenario-popup")):(a=new u,a.setTransport(U),a.sync(C,i.id).then(function(){o=a.toJSON(),E.reset(o,n,r,document.getElementById("muscenario-popup")),t==="char"&&k.reset(JSON.parse(a.toJSON())),t==="context"&&L.reset(JSON.parse(a.toJSON())),t==="problem"&&A.reset(JSON.parse(a.toJSON()))}))},w.closePopup=function(){var t=_.get("cardpopup");t[S]=!1,_.set("cardpopup",t),S=""},E=new a(w.closePopup),w.getChatUI=function(){return x},w.post=function(e,t){F.selectScreen("postit"),_.set("import","inactive"),_.set("drawing","inactive")},w.importpic=function(e,t){F.selectScreen("import"),_.set("postit","inactive"),_.set("drawing","inactive")},w.draw=function(e,t){F.selectScreen("drawing"),_.set("import","inactive"),_.set("postit","inactive")},w.exitTool=function(t){_.set(t,"inactive")},w.finish=function(e,t){var n=(new h({color:"#657B99",lines:10,length:8,width:4,radius:8,top:550,left:50})).spin();n.spin(t.parentNode),t.classList.add("invisible"),v.unsync(),v.sync(C,v.get("_id")).then(function(){return v.set("scReady",!0),v.upload()}).then(function(){n.stop(),t.classList.remove("pressed"),_.set("ready",!1),w.displayStory(),w.updateScenario()})},w.updateField=function(t,n){n.classList.contains("enterTitle")&&B.set("title",n.value),n.classList.contains("enterDesc")&&B.set("story",n.value),n.classList.contains("enterSol")&&B.set("solution",n.value)},w.displayStory=function(){F.setReadonly(!0),_.set("showstory",!0),w.dom.querySelector(".scenario-cards").classList.remove("folded"),w.dom.querySelector(".scenario-cards .caret").classList.add("invisible"),w.dom.querySelector(".writeup").scrollIntoView(),w.dom.querySelector(".whiteboard .caret").classList.remove("invisible")},w.hideStory=function(){w.dom.querySelector(".scenario-cards").classList.add("folded"),w.dom.querySelector(".scenario-cards .caret").classList.remove("invisible"),w.dom.querySelector(".whiteboard .caret").classList.add("invisible")},w.toggleCaret=function(e,t){e.stopPropagation();var n=w.dom.querySelector(".writeup"),r=w.dom.querySelector(".whiteboard");t.classList.toggle("descending"),t.classList.contains("descending")?n.scrollIntoView():r.scrollIntoView()},w.toggleView=function(e,t){var n=t.querySelector(".caret"),r=w.dom.querySelector(".writeup"),i=w.dom.querySelector(".whiteboard");n.classList.contains("descending")?(n.classList.remove("descending"),i.scrollIntoView()):e.pageY-t.scrollHeight>0&&(n.classList.add("descending"),r.scrollIntoView())},w.updateScenario=function(){H=setInterval(function(){var e=v.get("scenario")[0]||{title:"",story:"",solution:""},t=e.title,n=e.story,r=e.solution,i={};if(B.get("title")!==t||B.get("story")!==n||B.get("solution")!==r)i.title=B.get("title"),i.story=B.get("story"),i.solution=B.get("solution"),v.set("scenario",[i]),v.upload().then(function(e){return console.log("scenario updated in CouchDB"),!0},function(e){console.log("failed to update scenario",e)})},8e3)},w.updateSessionScore=function(e){var t=new l,n={sid:v.get("_id"),step:"muscenario",time:e,wbcontent:j.toJSON(),scenario:B.toJSON()};return U.request("UpdateSessionScore",n,function(e){console.log(e),e.res==="ok"?(v.unsync(),v.sync(C,v.get("_id")).then(function(){t.fulfill()})):t.reject()}),t},w.reset=function(t){x.clear(),v.get("chat")[2]&&x.reset(v.get("chat")[2]),_.reset({cardpopup:{"char":!1,context:!1,problem:!1},postit:"inactive","import":"inactive",drawing:"inactive",ready:!1,showstory:!1,shownext:!1,readonly:!1}),F.setSessionId(v.get("_id")),j.reset(v.get("scenarioWB")),j.getNbItems()?F.selectScreen("main"):F.selectScreen("default"),t||v.get("scenario").length?(R="screen",x.dom.querySelector(".chatread").classList.add("extended"),_.set("ready",!1),w.displayStory(),_.set("readonly",!0),_.set("shownext",!1),B.reset(v.get("scenario")[0]),m.set("scenario",v.get("scenario")[0])):(B.reset({title:"",story:"",solution:""}),j.getNbItems()?_.set("ready",!0):_.set("ready",!1),F.setReadonly(!1),w.hideStory(),R="step"),v.get("elapsedTimers").muscenario&&(q=v.get("elapsedTimers").muscenario,D.set("timer",q),R==="screen"?D.set("display",!0):w.isLeader()&&w.initTimer(q))},w.initTimer=function(e){var t=new Date,n=t.getTime(),r=e||0;D.set("display",!1),D.set("timer",r),v.get("step")==="muscenario"&&(clearInterval(P),P=setInterval(function(){var e=new Date;D.set("timer",r+e.getTime()-n)},1e3))},m.watchValue("characters",function(e){O.set("char",e)}),m.watchValue("contexts",function(e){O.set("context",e)}),m.watchValue("problems",function(e){O.set("problem",e)}),v.watchValue("_id",function(e){F.setSessionId(e)}),v.watchValue("chat",function(e){e.length===3&&x.getModel().get("_id")!==e[2]&&x.reset(e[2])}),["added","deleted","updated"].forEach(function(e){j.watch(e,function(e){if(!_.get("showstory")){if(v.get("scenarioWB").length!==j.getNbItems()||JSON.stringify(v.get("scenarioWB"))!==j.toJSON())v.set("scenarioWB",JSON.parse(j.toJSON())),v.upload().then(function(e){console.log("success : ",e)},function(e){console.log("failure : ",e)});j.getNbItems()&&R==="step"?_.set("ready",!0):_.set("ready",!1)}})}),v.watchValue("scenarioWB",function(e){v.get("step")==="muscenario"&&!_.get("showstory")&&(e.length&&F.getStack().getCurrentName()==="default"&&F.selectScreen("main"),e.length||F.selectScreen("default"),(e.length!==j.getNbItems()||JSON.stringify(e)!==j.toJSON())&&j.reset(e))}),v.watchValue("scReady",function(e){v.get("step")==="muscenario"&&e&&!w.isLeader()&&(_.set("readonly",!0),w.displayStory())}),v.watchValue("scenario",function(e){w.isLeader()||(B.reset(e[0]),m.set("scenario",JSON.parse(B.toJSON())))}),B.watch("updated",function(){w.isLeader()&&B.get("title")&&B.get("story")&&B.get("solution")?_.set("shownext",!0):_.set("shownext",!1)}),SCWHITEB=F,SCCONTENT=j,SC=B,w}});