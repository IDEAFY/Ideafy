/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","Place.plugin","service/config","service/cardpopup","../../whiteboard/whiteboard","Store","CouchDBDocument","Promise","service/utils","lib/spin.min","./mubchat","./muvote"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d){return function(m,g,y,b,w){var E=new e,S,x,T=new p,N=new d,C="step",k,L=0,A,O,M=new a({timer:null,display:!1}),_=new a({title:"",description:"",solution:"",visibility:"private"}),D=new a,P=new a([]),H=[],B={cardpopup:{scenario:!1,techs:[!1,!1,!1]},postit:"inactive","import":"inactive",drawing:"inactive",ready:!1,showidea:!1,shownext:!1,readonly:!1},j=new a(B),F=new a([]),I=new u("idea",F,j,"mu"),q=s.get("transport"),R=s.get("user"),U=s.get("db"),z=s.get("labels"),W=!1,X=(new h({color:"#657B99",lines:10,length:8,width:4,radius:8,top:695,left:670})).spin();return E.isLeader=function(){return m.get("initiator")&&m.get("initiator").id===R.get("_id")},E.plugins.addAll({labels:new n(z,{setPlaceholder:function(e){this.setAttribute("placeholder",e)}}),scenario:new n(D),techs:new n(P,{setPic:function(e){e&&this.setAttribute("style","background-image:url('"+e+"');")}}),wbtools:new n(j,{setActive:function(e){e==="active"?this.classList.add("pushed"):this.classList.remove("pushed")},setReady:function(e){E.isLeader()?e?this.classList.remove("invisible"):this.classList.add("invisible"):this.classList.add("invisible")},showIdea:function(e){e?this.classList.remove("invisible"):this.classList.add("invisible")},toggleToolbox:function(e){e?this.classList.add("invisible"):this.classList.remove("invisible")},setReadonly:function(e){e?this.setAttribute("readonly","readonly"):this.removeAttribute("readonly")},popup:function(e){var t;this.getAttribute("name")==="scenario"?e?this.classList.add("highlighted"):this.classList.remove("highlighted"):(t=this.getAttribute("data-techs_id"),e[t]?this.classList.add("highlighted"):this.classList.remove("highlighted"))}}),muideatimer:new n(M,{setTime:function(e){this.innerHTML=c.formatDuration(e)},displayTimer:function(e){e?this.classList.add("showtimer"):this.classList.remove("showtimer")}}),idea:new n(_),wbstack:I,place:new i({chat:T,vote:N}),muideaevent:new r(E)}),E.template='<div id = "muidea"><div class="previousbutton" data-muideaevent="listen: mousedown, press; listen: mousedown, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, muidea" data-muideaevent="listen:mousedown, toggleProgress"></div><div class="timer" data-muideatimer="bind:setTime, timer; bind: displayTimer, display" data-muideaevent="listen:mousedown,toggleTimer"></div><div id="muidea-left"><div class="idea-cards leftarea folded" data-muideaevent="listen:mousedown, fold"><div class="card defaultscenario" name="scenario" data-muideaevent="listen: mousedown, zoom" data-wbtools="bind: popup,cardpopup.scenario"><div class="cardpicture"></div><div class="cardtitle" data-scenario="bind:innerHTML, title"></div></div><ul class="cardlist" data-techs="foreach"><li><div class="card tech" data-muideaevent="listen: mousedown, zoom" data-wbtools="bind: popup,cardpopup.techs"><div class="cardpicture" data-techs="bind:setPic, pic"></div><div class="cardtitle" data-techs="bind:innerHTML,title"></div></div></li></ul><div class="caret"></div></div><div id="muidea-popup"></div><div class ="toolbox" data-wbtools="bind:toggleToolbox, showidea"><div class="toolbox-button"><div class="postit-button" name="postit" data-wbtools="bind:setActive, postit" data-muideaevent="listen: mousedown, push; listen:mouseup, post"></div><legend data-labels="bind:innerHTML, post">Post-it</legend></div><div class="toolbox-button"><div class="importpic-button" name="import" data-wbtools="bind:setActive, import" data-muideaevent="listen: mousedown, push; listen:mouseup, importpic"></div><legend data-labels="bind:innerHTML, import">Import pictures</legend></div><div class="toolbox-button"><div class="drawingtool-button" name="drawing" data-wbtools="bind:setActive, drawing" data-muideaevent="listen: mousedown, push; listen:mouseup, draw"></div><legend data-labels="bind:innerHTML, draw">Drawing tool</legend></div><div class="finish-button invisible" data-wbtools="bind:setReady, ready" data-labels="bind:innerHTML, finishbutton" data-muideaevent="listen: mousedown, press; listen:mouseup, finish"></div></div></div><div id="muidea-right" class="workarea"><div id="idea-whiteboard" class="whiteboard"><div class="stack" data-wbstack="destination"></div><div class="caret descending invisible" data-muideaevent="listen:mousedown, toggleCaret"></div></div><div id = "muidea-writeup" class="writeup invisible" data-wbtools="bind: showIdea,showidea"><textarea class = "enterTitle" maxlength="30" data-labels="bind:setPlaceholder, ideatitleplaceholder" data-idea="bind:value, title" data-wbtools="bind:setReadonly, readonly" data-muideaevent="listen:input, updateField"></textarea><textarea class = "enterDesc" data-labels="bind:setPlaceholder, ideadescplaceholder" data-idea="bind:value, description" data-wbtools="bind:setReadonly, readonly" data-muideaevent="listen:input, updateField"></textarea><textarea class = "enterSol" data-labels="bind:setPlaceholder, ideasolplaceholder" data-idea="bind:value, solution" data-wbtools="bind:setReadonly, readonly" data-muideaevent="listen:input, updateField"></textarea></div><div class="next-button invisible" data-wbtools="bind:setReady, shownext" data-labels="bind:innerHTML, nextbutton" data-muideaevent="listen: mousedown, press; listen:mouseup, next"></div></div><div class="sessionvote" data-place="place:vote"></div><div class="sessionchat" data-place="place:chat"></div></div>',E.place(t.get("muidea")),E.press=function(e,t){t.classList.add("pressed")},E.next=function(e,t){var n=new Date,r,i,s,o,u=new l;t.classList.add("invisible"),t.classList.remove("pressed"),C==="step"?(C="screen",j.set("readonly",!0),clearInterval(A),M.set("display",!0),clearInterval(O),i=E.getSessionDuration(),N.reset(m,function(e){W=!0,s=e.visibility,o=e.replay,_.set("visibility",s),_.set("sessionReplay",o),u.fulfill(),N.close()}),u.then(function(){return X.spin(t.parentNode),g.set("idea",JSON.parse(_.toJSON())),E.createIdeaDoc()}).then(function(){return m.unsync(),m.sync(U,m.get("_id"))}).then(function(){var e=m.get("elapsedTimers");return T.conclude("next"),e.muidea=M.get("timer"),m.set("idea",[JSON.parse(_.toJSON())]),o&&m.set("replayIdeas",[]),m.set("elapsedTimers",e),m.set("duration",i),m.set("status","completed"),m.set("idea",[g.get("idea")]),m.upload()}).then(function(){return E.updateSessionScore(M.get("timer"))}).then(function(){b("muidea")})):b("muidea")},E.stopSpinner=function(){X.stop()},E.prev=function(e,t){t.classList.remove("pressed"),y("muidea")},E.toggleProgress=function(e,t){w()},E.toggleTimer=function(e,t){E.isLeader()&&M.set("display",!M.get("display"))},E.toggleVisibility=function(e,t){C==="step"&&E.isLeader()&&(_.get("visibility")==="public"?_.set("visibility","private"):_.set("visibility","public"))},E.push=function(e,t){var n=t.getAttribute("name");j.set(n,"active")},E.zoom=function(e,t){var n,r;t.getAttribute("name")==="scenario"?n="scenario":(n="techno",r=t.getAttribute("data-techs_id")),E.setPopup(n,r)},E.fold=function(e,t){m.get("ideaReady")||(t.classList.toggle("folded"),t.querySelector(".caret").classList.toggle("folding"),x&&S.close())},E.setPopup=function(t,n){var r={x:240,y:30},i="left",o=j.get("cardpopup"),u=new a,l="",c,h;x&&(x.type==="scenario"?o.scenario=!1:o.techs[x.id]=!1,j.set("cardpopup",o)),t==="scenario"?o.scenario=!0:o.techs[n]=!0,j.set("cardpopup",o),x={type:t,id:n},t==="scenario"?(r.y=55,u.reset(g.get("scenario")),u.set("type",5),l=u.toJSON(),S.reset(l,r,i,document.getElementById("muidea-popup"))):(n==0&&(r.y=200),n==1&&(r.y=260),n==2&&(r.y=350),H[n]?(l=H[n],S.reset(l,r,i,document.getElementById("muidea-popup"))):(h=new f,h.setTransport(q),h.sync(s.get("db"),g.get("techno").get(n).id).then(function(){l=h.toJSON(),S.reset(l,r,i,document.getElementById("muidea-popup")),H[n]=l})))},E.closePopup=function(){var t=j.get("cardpopup");t[x]=!1,j.set("cardpopup",t),x=""},S=new o(E.closePopup),E.getChatUI=function(){return T},E.post=function(e,t){I.selectScreen("postit"),j.set("import","inactive"),j.set("drawing","inactive")},E.importpic=function(e,t){I.selectScreen("import"),j.set("postit","inactive"),j.set("drawing","inactive")},E.draw=function(e,t){I.selectScreen("drawing"),j.set("import","inactive"),j.set("postit","inactive")},E.exitTool=function(t){j.set(t,"inactive")},E.finish=function(e,t){var n=(new h({color:"#657B99",lines:10,length:8,width:4,radius:8,top:550,left:50})).spin();n.spin(t.parentNode),t.classList.add("invisible"),m.unsync(),m.sync(U,m.get("_id")).then(function(){return m.set("ideaReady",!0),m.upload()}).then(function(){n.stop(),t.classList.remove("pressed"),j.set("ready",!1),E.displayIdea(),E.updateIdea()})},E.updateField=function(t,n){n.classList.contains("enterTitle")&&_.set("title",n.value),n.classList.contains("enterDesc")&&_.set("description",n.value),n.classList.contains("enterSol")&&_.set("solution",n.value)},E.displayIdea=function(){I.setReadonly(!0),j.set("showidea",!0),E.dom.querySelector(".idea-cards").classList.remove("folded"),E.dom.querySelector(".idea-cards .caret").classList.add("invisible"),E.dom.querySelector(".writeup").scrollIntoView(),E.dom.querySelector(".whiteboard .caret").classList.remove("invisible")},E.hideIdea=function(){E.dom.querySelector(".idea-cards").classList.add("folded"),E.dom.querySelector(".idea-cards .caret").classList.remove("invisible"),E.dom.querySelector(".whiteboard .caret").classList.add("invisible")},E.toggleCaret=function(e,t){e.stopPropagation();var n=E.dom.querySelector(".writeup"),r=E.dom.querySelector(".whiteboard");t.classList.toggle("descending"),t.classList.contains("descending")?n.scrollIntoView():r.scrollIntoView()},E.toggleView=function(e,t){var n=t.querySelector(".caret"),r=E.dom.querySelector(".writeup"),i=E.dom.querySelector(".whiteboard");n.classList.contains("descending")?(n.classList.remove("descending"),i.scrollIntoView()):e.pageY-t.scrollHeight>0&&(n.classList.add("descending"),r.scrollIntoView())},E.updateIdea=function(t,n){O=setInterval(function(){var e=m.get("idea")[0]||{title:"",description:"",solution:""},t=e.title,n=e.description,r=e.solution,i={};if(_.get("title")!==t||_.get("description")!==n||_.get("solution")!==r)i.title=_.get("title"),i.description=_.get("description"),i.solution=_.get("solution"),m.set("idea",[i]),m.upload().then(function(e){return console.log("idea updated in CouchDB"),!0},function(e){console.log("failed to update idea",e)})},8e3)},E.updateSessionScore=function(e){var t=new l,n={sid:m.get("_id"),step:"muidea",time:e,wbcontent:F.toJSON(),idea:_.toJSON()};return q.request("UpdateSessionScore",n,function(e){e.res==="ok"?(m.unsync(),m.sync(U,m.get("_id")).then(function(){t.fulfill()})):t.reject()}),t},E.getSessionDuration=function(){var t=m.get("elapsedTime"),n=m.get("resumeTime")||m.get("startTime");return now=new Date,now.getTime()-n+t},E.createIdeaDoc=function(){var t=new f(s.get("ideaTemplate")),n=new Date,r="I:"+n.getTime(),i=[],o=[],u=new l;return i.push(m.get("initiator").id),o.push(m.get("initiator").username),m.get("participants").forEach(function(e){i.push(e.id),o.push(e.username)}),t.setTransport(q),t.set("title",_.get("title")),t.set("sessionId",m.get("_id")),t.set("authors",i),t.set("description",_.get("description")),t.set("solution",_.get("solution")),t.set("creation_date",[n.getFullYear(),n.getMonth(),n.getDate(),n.getHours(),n.getMinutes(),n.getSeconds()]),t.set("character",m.get("characters")[0]),t.set("problem",m.get("problems")[0]),t.set("context",m.get("contexts")[0]),t.set("techno",m.get("techno")[0]),t.set("visibility",_.get("visibility")),t.set("sessionReplay",_.get("sessionReplay")),t.set("authornames",o.join(", ")),t.set("lang",m.get("lang")),t.set("_id",r),t.sync(s.get("db"),r).then(function(){return t.upload()}).then(function(){t.get("visibility")==="public"&&(q.request("UpdateUIP",{userid:R.get("_id"),type:t.get("type"),docId:t.get("_id"),docTitle:t.get("title")},function(e){e!=="ok"&&console.log(e)}),m.get("participants").forEach(function(e){q.request("UpdateUIP",{userid:e.id,type:t.get("type"),docId:t.get("_id"),docTitle:t.get("title")},function(t){t!=="ok"&&console.log(e.id," "+t)})})),u.fulfill(),t.unsync()}),u},E.reset=function(t){T.clear(),m.get("chat")[4]&&T.reset(m.get("chat")[4]),j.reset({cardpopup:{scenario:!1,techs:[!1,!1,!1]},postit:"inactive","import":"inactive",drawing:"inactive",ready:!1,showidea:!1,shownext:!1,readonly:!1}),P.reset(),I.setSessionId(m.get("_id")),F.reset(m.get("ideaWB")),F.getNbItems()?I.selectScreen("main"):I.selectScreen("default"),clearInterval(A),t||m.get("idea").length?(C="screen",T.dom.querySelector(".chatread").classList.add("extended"),j.set("ready",!1),E.displayIdea(),_.reset(m.get("idea")[0]),g.set("idea",m.get("idea")[0]),j.set("readonly",!0),j.set("shownext",!1)):(_.reset({title:"",description:"",solution:"",visibility:"private"}),F.getNbItems()?j.set("ready",!0):j.set("ready",!1),I.setReadonly(!1),C="step",W=!1),m.get("elapsedTimers").muidea&&(L=m.get("elapsedTimers").muidea,M.set("timer",L),C==="screen"?M.set("display",!0):E.isLeader()&&E.initTimer(L))},E.initTimer=function(e){var t=new Date,n=t.getTime(),r=e||0;M.set("display",!1),M.set("timer",r),m.get("step")==="muidea"&&(A=setInterval(function(){var e=new Date;M.set("timer",r+e.getTime()-n)},1e3))},m.watchValue("_id",function(e){I.setSessionId(e)}),m.watchValue("chat",function(e){e.length===5&&T.getModel().get("_id")!==e[4]&&T.reset(e[4])}),g.watchValue("scenario",function(e){D.reset(g.get("scenario"))}),g.watchValue("techno",function(e){P.reset(JSON.parse(g.get("techno").toJSON()))}),["added","deleted","updated"].forEach(function(e){F.watch(e,function(e){if(!j.get("showidea")){if(m.get("ideaWB").length!==F.getNbItems()||JSON.stringify(m.get("ideaWB"))!==F.toJSON())m.set("ideaWB",JSON.parse(F.toJSON())),m.upload().then(function(e){console.log("success : ",e)},function(e){console.log("failure : ",e)});F.getNbItems()?j.set("ready",!0):j.set("ready",!1)}})}),m.watchValue("ideaWB",function(e){m.get("step")==="muidea"&&!j.get("showidea")&&(e.length&&I.getStack().getCurrentName()==="default"&&I.selectScreen("main"),e.length||I.selectScreen("default"),(e.length!==F.getNbItems()||JSON.stringify(e)!==F.toJSON())&&F.reset(e))}),m.watchValue("ideaReady",function(e){m.get("step")==="muidea"&&e&&!E.isLeader()&&(j.set("readonly",!0),E.displayIdea())}),m.watchValue("idea",function(e){E.isLeader()||(_.reset(e[0]),g.set("idea",JSON.parse(_.toJSON())))}),_.watch("updated",function(){E.isLeader()&&_.get("title")&&_.get("description")&&_.get("solution")?j.set("shownext",!0):j.set("shownext",!1)}),m.watchValue("vote",function(e){e&&!W&&!E.isLeader()&&!N.isActive()&&(N.reset(m,function(e){e&&N.close()}),W=!0)}),E}});