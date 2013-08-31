/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Place.plugin","Bind.plugin","Event.plugin","service/config","service/help","Store","CouchDBDocument","Promise","service/cardpopup","service/utils","lib/spin.min","./mubchat"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p){return function(v,m,g,y,b){var w=new e,E=null,S=null,x,T=new u({timer:null,display:!1}),N=s.get("transport"),C=s.get("user"),k=s.get("db"),L=s.get("labels"),A,O,M=new p,_=new u({left:"",scenario:{popup:!1},tech1:{popup:!1,selected:!1},tech2:{popup:!1,selected:!1},tech3:{popup:!1,selected:!1}}),D=[],P=!0,H=new u,B=new u,j=new u,F={tech1:H,tech2:B,tech3:j},I=0,q=new u([{id:"",title:"",pic:""},{id:"",title:"",pic:""},{id:"",title:"",pic:""}]),R="step",U=(new h({color:"#657B99",lines:10,length:8,width:4,radius:8,top:336,left:481})).spin(),z={};return w.isLeader=function(){return v.get("initiator")&&v.get("initiator").id===C.get("_id")},w.plugins.addAll({labels:new r(L),display:new r(_,{setReload:function(e){!e&&I>0?this.classList.add("reload"):this.classList.remove("reload")},updateNext:function(e){w.isLeader()&&_.get("tech1").selected&&_.get("tech2").selected&&_.get("tech3").selected&&R==="step"?this.classList.remove("invisible"):this.classList.add("invisible")},setSelected:function(e){e?this.classList.add("pushed"):this.classList.remove("pushed")},popup:function(e){e?this.classList.add("highlighted"):this.classList.remove("highlighted")}}),techcards:new r(q,{removeDefault:function(e){e?this.classList.remove("defaultcard"):this.classList.add("defaultcard")},formatTitle:function(e){e?this.innerHTML=e.toUpperCase():this.innerHTML=L.get(this.parentNode.getAttribute("name")+"lbl")},setPic:function(e){var t=this;e?e.search("img/decks")>-1?this.setAttribute("style","background-image:url('"+e+"');"):(json={dir:"cards",filename:e},s.get("transport").request("GetFile",json,function(e){t.setAttribute("style","background:white; background-image: url('"+e+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;")})):this.setAttribute("style","background-image: none;")}}),mutechtimer:new r(T,{setTime:function(e){this.innerHTML=c.formatDuration(e)},displayTimer:function(e){e?this.classList.add("showtimer"):this.classList.remove("showtimer")}}),place:new n({chat:M}),mutechevent:new i(w)}),w.template='<div id = "mutech"><div class="previousbutton" data-mutechevent="listen: touchstart, press; listen: touchstart, prev"></div><div id="mutech-popup" class="invisible"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, mutech" data-mutechevent="listen:touchstart, toggleProgress"></div><div class="timer" data-mutechtimer="bind:setTime, timer; bind: displayTimer, display" data-mutechevent="listen:touchstart,toggleTimer"></div><div class="help-brainstorm" data-mutechevent="listen:touchstart, help"></div><div id="mutech-left" class="leftarea"><div class="card defaultscenario" name="scenario" data-mutechevent="listen: touchstart, select; listen:touchstart, zoom" data-display="bind: popup, scenario.popup"><div class="cardpicture"></div><div class="cardtitle" data-labels="bind:innerHTML, scenariolbl"></div></div></div><div class="drawarea"><div class="decks"><div class="drawbutton drawtech" "name"="tech" data-mutechevent="listen: touchstart, push; listen:touchend, draw" data-display="bind: setReload, left"></div></div><div class="cards"><div class="card tech defaultcard" name="tech1" data-mutechevent="listen: touchstart, select; listen:touchend, zoom" data-techcards="bind:removeDefault, 0.pic" data-display="bind: popup, tech1.popup"><div class="cardpicture" data-techcards="bind:setPic, 0.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, 0.title" data-labels="bind:innerHTML, tech1lbl"></div></div><div class="card tech defaultcard" name="tech2" data-mutechevent="listen: touchstart, select; listen:touchend, zoom" data-techcards="bind:removeDefault, 1.pic" data-display="bind: popup, tech2.popup"><div class="cardpicture" data-techcards="bind:setPic, 1.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, 1.title" data-labels="bind:innerHTML,tech2lbl"></div></div><div class="card tech defaultcard" name="tech3" data-mutechevent="listen: touchstart, select; listen:touchend, zoom" data-techcards="bind:removeDefault, 2.pic" data-display="bind: popup, tech3.popup"><div class="cardpicture" data-techcards="bind:setPic, 2.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, 2.title" data-labels="bind:innerHTML, tech3lbl"></div></div></div><div class="confirmdraw"><div class="drawok" name="tech1" data-display="bind:setSelected, tech1.selected" data-mutechevent="listen: touchstart, pushOk; listen:touchend, accept"></div><div class="drawok" name="tech2" data-display="bind:setSelected, tech2.selected" data-mutechevent="listen: touchstart, pushOk; listen:touchend, accept"></div><div class="drawok" name="tech3" data-display="bind:setSelected, tech3.selected" data-mutechevent="listen: touchstart, pushOk; listen:touchend, accept"></div></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-mutechevent="listen: touchstart, press; listen:touchend, next" data-display="bind:updateNext, tech1.selected;bind:updateNext, tech2.selected;bind:updateNext, tech3.selected"></div></div><div class="sessionchat" data-place="place:chat"></div></div>',w.place(t.get("mutech")),w.press=function(e,t){t.classList.add("pressed")},w.next=function(e,t){var n=new Date,r=n.getTime()-E;U.spin(t.parentNode),t.classList.add("invisible"),t.classList.remove("pressed"),R==="step"?(R="screen",m.set("techno",q),clearInterval(x),T.set("display",!0),w.updateSessionScore(T.get("timer")).then(function(){v.unsync(),v.sync(k,v.get("_id")).then(function(){var e=v.get("elapsedTimers");M.conclude("next"),e.mutech=T.get("timer"),v.set("elapsedTimers",e),v.set("techno",[[q.get(0).id,q.get(1).id,q.get(2).id]]),y("mutech")})})):y("mutech")},w.stopSpinner=function(){U.stop()},w.help=function(e,t){o.setContent("mutechhelp"),document.getElementById("cache").classList.add("appear"),document.getElementById("help-popup").classList.add("appear")},w.prev=function(e,t){t.classList.remove("pressed"),g("mutech")},w.toggleProgress=function(e,t){b()},w.toggleTimer=function(e,t){w.isLeader()&&T.set("display",!T.get("display"))},w.select=function(e,t){var n=t.getAttribute("name");(n.search("tech")<0||I>0||R==="screen")&&t.classList.add("highlighted")},w.zoom=function(e,t){var n=t.getAttribute("name");(n.search("tech")<0||I>0||R==="screen")&&w.setPopup(n)},w.setPopup=function(t){var n={x:0,y:257},r="left",i=_.get(O)||"",s=new u,o,a=_.get(t);i&&(i.popup=!1,_.set(O,i)),a.popup=!0,_.set(t,a),O=t,t==="scenario"?(n.x=147,n.y=275,s.reset(v.get("scenario")[0]),s.set("type",5),o=s.toJSON()):(t==="tech1"&&(n.x=467),t==="tech2"&&(n.x=186,r="right"),t==="tech3"&&(n.x=333,r="right"),F[t].get("_id")&&(o=F[t].toJSON())),o&&A.reset(o,n,r,document.getElementById("mutech-popup"))},w.closePopup=function(){var t=_.get(O);t.popup=!1,_.set(O,t),O=""},w.push=function(e,t){var n=t.getAttribute("name");t.classList.contains("drawok")?F[n].get("_id")&&R==="step"&&w.isLeader()&&t.classList.add("pushed"):t.classList.add("pushed")},w.draw=function(e,t){var n=[];w.isLeader()&&R==="step"&&P?(P=!1,["tech1","tech2","tech3"].forEach(function(e){_.get(e).selected||n.push(e)}),w.drawTech(n).then(function(){t.classList.remove("pushed"),P=!0})):t.classList.remove("pushed")},w.drawTech=function(t){var n,r=[],i=new f,s=new u({count:t.length});return t.length?(t.forEach(function(e){D.length<=0&&(D=m.get("deck").techno.concat(),["tech1","tech2","tech3"].forEach(function(e,t){_.get(e).selected&&r.push(q.get(t).id)}),D.filter(function(e){return!(r.indexOf(e)>-1)})),n=Math.floor(Math.random()*D.length),w.getCardDetails(D[n],e).then(function(){var e=s.get("count");e--,s.set("count",e)}),_.set("left",D.length),I++,D.splice(n,1)}),s.watchValue("count",function(e){e||(v.unsync(),v.sync(k,v.get("_id")).then(function(){return["tech1","tech2","tech3"].forEach(function(e,t){v.set("drawn"+e,q.get(t).id)}),v.upload()}).then(function(){i.fulfill()}))})):i.fulfill(),DRS=s,i},w.getCardDetails=function(t,n){var r=new a,i=["tech1","tech2","tech3"],s=i.indexOf(n),o=new f;return r.setTransport(N),r.sync(k,t).then(function(){F[n].reset(JSON.parse(r.toJSON())),q.update(s,"id",t),q.update(s,"title",r.get("title")),q.update(s,"pic",r.get("picture_file")),o.fulfill(),r.unsync()}),o},w.pushOk=function(e,t){var n=z[t.getAttribute("name")]||null;w.isLeader()&&R==="step"&&(n?z[t.getAttribute("name")].spin(t):z[t.getAttribute("name")]=(new h).spin(t))},w.accept=function(e,t){var n=t.getAttribute("name"),r=["tech1","tech2","tech3"],i=r.indexOf(n),s=_.get(n);R==="step"&&w.isLeader()&&(q.get(i)&&q.get(i).id?s.selected=!s.selected:s.selected=!1,v.unsync(),v.sync(k,v.get("_id")).then(function(){return v.set("selected_"+n,s.selected),v.upload()}).then(function(){z[t.getAttribute("name")].stop(),_.set(n,s)}))},w.reset=function(t){var n=v.get("techno")[0];M.clear(),v.get("chat")[3]&&M.reset(v.get("chat")[3]),_.reset({left:"",scenario:{popup:!1},tech1:{popup:!1,selected:!1},tech2:{popup:!1,selected:!1},tech3:{popup:!1,selected:!1}}),t||n.length?(R="screen",M.dom.querySelector(".chatread").classList.add("extended"),w.getCardDetails(n[0],"tech1").then(function(){return w.getCardDetails(n[1],"tech2")}).then(function(){return w.getCardDetails(n[2],"tech3")}).then(function(){["tech1","tech2","tech3"].forEach(function(e){_.set(e,{popup:!1,selected:!0})}),m.set("techno",q)})):(D=[],I=0,R="step",H.reset(),B.reset(),j.reset(),q.reset([{id:"",title:"",pic:""},{id:"",title:"",pic:""},{id:"",title:"",pic:""}])),v.get("elapsedTimers").mutech&&(S=v.get("elapsedTimers").mutech,T.set("timer",S),R==="screen"?T.set("display",!0):w.isLeader()&&w.initTimer(S))},w.updateSessionScore=function(t){var n=new f,r={sid:v.get("_id"),step:"mutech",time:t,cards:I};return N.request("UpdateSessionScore",r,function(e){e.res==="ok"?n.fulfill():n.reject()}),n},w.initTimer=function(e){var t=new Date,n=t.getTime(),r=e||0;T.set("display",!1),T.set("timer",r),v.get("step")==="mutech"&&(clearInterval(x),x=setInterval(function(){var e=new Date;T.set("timer",r+e.getTime()-n)},1e3))},A=new l(w.closePopup),w.getChatUI=function(){return M},v.watchValue("chat",function(e){e.length===4&&M.getModel().get("_id")!==e[3]&&M.reset(e[3])}),m.watchValue("deck",function(e){D=e.techno.concat(),_.set("left",D.length)}),["tech1","tech2","tech3"].forEach(function(e){v.watchValue("drawn"+e,function(t){w.isLeader()||w.getCardDetails(t,e)}),v.watchValue("selected_"+e,function(t){var n;w.isLeader()||(n=_.get(e),n.selected=t,_.set(e,n),t&&m.set("techno",q))})}),w}});