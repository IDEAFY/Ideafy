/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","service/config","service/help","Store","CouchDBDocument","Promise","service/cardpopup","service/utils","lib/spin.min"],function(e,t,n,r,i,s,o,u,a,f,l,c){return function(p,d,v,m,g){var y=new e,b=null,w=null,E,S=new o({timer:null,display:!1}),x=i.get("transport"),T=i.get("user"),N=i.get("labels"),C,k,L={left:"",scenario:{popup:!1},tech1:{popup:!1,selected:!1},tech2:{popup:!1,selected:!1},tech3:{popup:!1,selected:!1}},A=new o(L),O=[],M=!0,_=new o,D=new o,P=new o,H={tech1:_,tech2:D,tech3:P},B=0,j=new o([{id:"",title:"",pic:""},{id:"",title:"",pic:""},{id:"",title:"",pic:""}]),F="step",I=(new c({color:"#657B99",lines:10,length:8,width:4,radius:8,top:373,left:373})).spin();return y.plugins.addAll({labels:new n(N),display:new n(A,{setReload:function(e){!e&&B>0?this.classList.add("reload"):this.classList.remove("reload")},updateNext:function(e){A.get("tech1").selected&&A.get("tech2").selected&&A.get("tech3").selected?this.classList.remove("invisible"):this.classList.add("invisible")},setSelected:function(e){e?this.classList.add("pushed"):this.classList.remove("pushed")},popup:function(e){e?this.classList.add("highlighted"):this.classList.remove("highlighted")}}),techcards:new n(j,{removeDefault:function(e){e?this.classList.remove("defaultcard"):this.classList.add("defaultcard")},formatTitle:function(e){e?this.innerHTML=e.toUpperCase():this.innerHTML=N.get(this.parentNode.getAttribute("name")+"lbl")},setPic:function(e){e?this.setAttribute("style","background-image:url('"+e+"');"):this.setAttribute("style","background-image: none;")}}),quicktechtimer:new n(S,{setTime:function(e){this.innerHTML=l.formatDuration(e)},displayTimer:function(e){e?this.classList.add("showtimer"):this.classList.remove("showtimer")}}),quicktechevent:new r(y)}),y.template='<div id = "quicktech"><div class="previousbutton" data-quicktechevent="listen: touchstart, press; listen: touchstart, prev"></div><div id="quicktech-popup" class="invisible"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, quicktech" data-quicktechevent="listen:touchstart, toggleProgress"></div><div class="timer" data-quicktechtimer="bind:setTime, timer; bind: displayTimer, display" data-quicktechevent="listen:touchstart,toggleTimer"></div><div class="help-brainstorm" data-quicktechevent="listen:touchstart, help"></div><div id="quicktech-left" class="leftarea"><div class="card defaultscenario" name="scenario" data-quicktechevent="listen: touchstart, select; listen:touchstart, zoom" data-display="bind: popup, scenario.popup"><div class="cardpicture"></div><div class="cardtitle" data-labels="bind:innerHTML, scenariolbl"></div></div></div><div class="drawarea"><div class="decks"><div class="drawbutton drawtech" "name"="tech" data-quicktechevent="listen: touchstart, push; listen:touchend, draw" data-display="bind: setReload, left"></div></div><div class="cards"><div class="card tech defaultcard" name="tech1" data-quicktechevent="listen: touchstart, select; listen:touchend, zoom" data-techcards="bind:removeDefault, 0.pic" data-display="bind: popup, tech1.popup"><div class="cardpicture" data-techcards="bind:setPic, 0.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, 0.title" data-labels="bind:innerHTML, tech1lbl"></div></div><div class="card tech defaultcard" name="tech2" data-quicktechevent="listen: touchstart, select; listen:touchend, zoom" data-techcards="bind:removeDefault, 1.pic" data-display="bind: popup, tech2.popup"><div class="cardpicture" data-techcards="bind:setPic, 1.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, 1.title" data-labels="bind:innerHTML,tech2lbl"></div></div><div class="card tech defaultcard" name="tech3" data-quicktechevent="listen: touchstart, select; listen:touchend, zoom" data-techcards="bind:removeDefault, 2.pic" data-display="bind: popup, tech3.popup"><div class="cardpicture" data-techcards="bind:setPic, 2.pic"></div><div class="cardtitle" data-techcards="bind:formatTitle, 2.title" data-labels="bind:innerHTML, tech3lbl"></div></div></div><div class="confirmdraw"><div class="drawok" name="tech1" data-display="bind:setSelected, tech1.selected" data-quicktechevent="listen: touchstart,  accept"></div><div class="drawok" name="tech2" data-display="bind:setSelected, tech2.selected" data-quicktechevent="listen: touchstart, accept"></div><div class="drawok" name="tech3" data-display="bind:setSelected, tech3.selected" data-quicktechevent="listen: touchstart, accept"></div></div><div class="next-button" data-labels="bind:innerHTML, nextbutton" data-quicktechevent="listen: touchstart, press; listen:touchend, next" data-display="bind:updateNext, tech1.selected;bind:updateNext, tech2.selected;bind:updateNext, tech3.selected"></div></div></div>',y.place(t.get("quicktech")),y.press=function(e,t){t.classList.add("pressed")},y.next=function(e,t){var n=new Date,r=n.getTime()-b;I.spin(t.parentNode),t.classList.add("invisible"),t.classList.remove("pressed"),F==="step"?(F="screen",d.set("techno",j),clearInterval(E),S.set("display",!0),y.updateSessionScore(S.get("timer")).then(function(){return p.unsync(),p.sync(i.get("db"),p.get("_id"))}).then(function(){var e=p.get("elapsedTimers");e.quicktech=S.get("timer"),p.set("elapsedTimers",e),p.set("techno",[[j.get(0).id,j.get(1).id,j.get(2).id]]),m("quicktech")})):m("quicktech")},y.stopSpinner=function(){I.stop(),y.dom.querySelector(".next-button").classList.remove("invisible")},y.help=function(e,t){s.setContent("quicktechhelp"),document.getElementById("cache").classList.add("appear"),document.getElementById("help-popup").classList.add("appear")},y.prev=function(e,t){t.classList.remove("pressed"),v("quicktech")},y.toggleProgress=function(e,t){g()},y.toggleTimer=function(e,t){S.set("display",!S.get("display"))},y.select=function(e,t){var n=t.getAttribute("name");(n.search("tech")<0||B>0||F==="screen")&&t.classList.add("highlighted")},y.zoom=function(e,t){var n=t.getAttribute("name");(n.search("tech")<0||B>0||F==="screen")&&y.setPopup(n)},y.setPopup=function(t){var n={x:0,y:337},r="left",i=A.get(k)||"",s=new o,u,a=A.get(t);i&&(i.popup=!1,A.set(k,i)),a.popup=!0,A.set(t,a),k=t,t==="scenario"?(n.x=240,n.y=275,s.reset(p.get("scenario")[0]),s.set("type",5),u=s.toJSON()):(t==="tech1"&&(n.x=560),t==="tech2"&&(n.x=279,r="right"),t==="tech3"&&(n.x=426,r="right"),H[t].get("_id")&&(u=H[t].toJSON())),u&&C.reset(u,n,r,document.getElementById("quicktech-popup"))},y.closePopup=function(){var t=A.get(k);t.popup=!1,A.set(k,t),k=""},y.push=function(e,t){var n=t.getAttribute("name");t.classList.contains("drawok")?H[n].get("_id")&&F==="step"&&t.classList.add("pushed"):t.classList.add("pushed")},y.draw=function(e,t){var n=[];F==="step"&&M&&(M=!1,["tech1","tech2","tech3"].forEach(function(e){A.get(e).selected||n.push(e)}),y.drawTech(n).then(function(){t.classList.remove("pushed"),M=!0}))},y.drawTech=function(t){var n,r=[],i=new a;return t.forEach(function(e){O.length<=0&&(O=d.get("deck").techno.concat(),["tech1","tech2","tech3"].forEach(function(e,t){A.get(e).selected&&r.push(j.get(t).id)}),O.filter(function(e){return!(r.indexOf(e)>-1)})),n=Math.floor(Math.random()*O.length),y.getCardDetails(O[n],e),A.set("left",O.length),B++,O.splice(n,1)}),i.fulfill(),i},y.getCardDetails=function(t,n){var r=new u,s=["tech1","tech2","tech3"].indexOf(n),o=new a;return r.setTransport(x),r.sync(i.get("db"),t).then(function(){H[n].reset(JSON.parse(r.toJSON())),j.update(s,"id",t),j.update(s,"title",r.get("title")),j.update(s,"pic",r.get("picture_file")),o.fulfill(),r.unsync()}),o},y.accept=function(e,t){var n=t.getAttribute("name"),r=["tech1","tech2","tech3"].indexOf(n),i=A.get(n);F==="step"&&(j.get(r).id?(i.selected=!i.selected,A.set(n,i)):alert("please draw a card first"))},y.reset=function(e){var t=p.get("techno")[0];A.reset({left:"",scenario:{popup:!1},tech1:{popup:!1,selected:!1},tech2:{popup:!1,selected:!1},tech3:{popup:!1,selected:!1}}),j.reset([{id:"",title:"",pic:""},{id:"",title:"",pic:""},{id:"",title:"",pic:""}]),F="step",e&&t&&t.length?(F="screen",y.getCardDetails(t[0],"tech1").then(function(){return y.getCardDetails(t[1],"tech2")}).then(function(){return y.getCardDetails(t[2],"tech3")}).then(function(){["tech1","tech2","tech3"].forEach(function(e){A.set(e,{popup:!1,selected:!0})}),d.set("techno",j)})):(O=[],B=0,_.reset(),D.reset(),P.reset(),j.reset([{id:"",title:"",pic:""},{id:"",title:"",pic:""},{id:"",title:"",pic:""}])),p.get("elapsedTimers").quicktech?w=p.get("elapsedTimers").quicktech:w=0,S.set("timer",w),F==="screen"?S.set("display",!0):y.initTimer(w)},y.updateSessionScore=function(t){var n=new a,r={sid:p.get("_id"),step:"quicktech",time:t,cards:B};return x.request("UpdateSessionScore",r,function(e){e.res==="ok"?n.fulfill():n.reject()}),n},y.initTimer=function(e){var t=new Date,n=t.getTime(),r=e||0;S.set("display",!1),S.set("timer",r),p.get("step")==="quicktech"&&(E=setInterval(function(){var e=new Date;S.set("timer",r+e.getTime()-n)},1e3))},C=new f(y.closePopup),d.watchValue("deck",function(e){O=e.techno.concat(),A.set("left",O.length)}),y}});