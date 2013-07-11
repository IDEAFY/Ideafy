/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Amy/Stack-plugin","Bind.plugin","Event.plugin","./quickstart","./quicksetup","./quickscenario","./quicktech","./quickidea","./quickwrapup","CouchDBDocument","CouchDBView","service/config","Promise","Store","lib/spin.min"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m){return function(y,b){var w=new e,E=new e,S=document.createDocumentFragment(),x=new n,T=p.get("labels"),N=new v([{name:"quickstart",label:T.get("quickstepstart"),currentStep:!0,status:"ongoing"},{name:"quicksetup",label:T.get("quickstepsetup"),currentStep:!1,status:null},{name:"quickscenario",label:T.get("quickstepscenario"),currentStep:!1,status:null},{name:"quicktech",label:T.get("quicksteptech"),currentStep:!1,status:null},{name:"quickidea",label:T.get("quickstepidea"),currentStep:!1,status:null},{name:"quickwrapup",label:T.get("quickstepwrapup"),currentStep:!1,status:null}]),C=p.get("user"),k=new c,L=new v,A=(new m({color:"#9AC9CD",lines:10,length:20,width:8,radius:15})).spin();return w.plugins.add("quickstack",x),w.template='<div id="ideafy-quick"><div class="stack" data-quickstack="destination"></div></div>',w.place(t.get("ideafy-quick")),E.plugins.addAll({labels:new r(T),step:new r(N,{setCurrent:function(e){e?this.classList.add("pressed"):this.classList.remove("pressed")},setActive:function(e){e?this.classList.remove("inactive"):this.classList.add("inactive")}}),progressevent:new i(E)}),E.template='<div class = "progressbar invisible"><ul id = "quicksteplist" class="steplist" data-step="foreach"><li class="step inactive" data-step="bind: innerHTML, label; bind:setCurrent, currentStep; bind:setActive, status" data-progressevent="listen: touchstart, highlightStep; listen:touchend, changeStep"></li></ul><div class="exit-brainstorm" data-progressevent="listen: touchstart, press; listen:touchend, exit"></div></div>',E.place(w.dom),E.highlightStep=function(e,t){t.classList.toggle("inactive")},E.changeStep=function(e,t){var n=t.getAttribute("data-step_id");N.get(n).status?(N.loop(function(e,t){n==t?N.update(t,"currentStep",!0):N.update(t,"currentStep",!1)}),x.getStack().show(N.get(n).name)):e.stopImmediatePropagation(),E.dom.classList.add("invisible")},E.press=function(e,t){t.classList.add("pressed")},E.exit=function(e,t){t.classList.remove("pressed"),E.dom.classList.add("invisible"),b()},w.retrieveSession=function(t){console.log(t),A.spin(document.getElementById("brainstorm")),L.reset(),k.unsync(),k.reset(),w.sessionExists(t.id).then(function(){return k.sync(p.get("db"),t.id)}).then(function(){console.log(k.toJSON());var e=k.get("step"),n=1e4,r=N.getNbItems();x.getStack().get("quickstart").reset(t),x.getStack().get("quicksetup").reset(t),x.getStack().get("quickscenario").reset(t),x.getStack().get("quicktech").reset(t),x.getStack().get("quickidea").reset(t),x.getStack().get("quickwrapup").reset(t),N.loop(function(t,r){r<n&&(t.name===e?(n=r,N.update(r,"currentStep",!0),t.name==="quickwrapup"?N.update(r,"status","done"):N.update(r,"status","ongoing")):N.update(r,"status","done"))}),e==="quickwrapup"?(A.stop(),x.getStack().show("quickwrapup"),N.update(0,"currentStep",!1)):(N.update(0,"currentStep",!0),N.update(n,"currentStep",!1),A.stop(),x.getStack().show("quickstart"),k.get("status")!=="completed"&&(C.set("sessionInProgress",t),C.upload()))},function(e){A.stop(),alert("session could not be retrieved")})},w.startNewSession=function(){k.unsync(),k.reset(p.get("sessionTemplate")),L.reset({}),k.set("initiator",{id:C.get("_id"),username:C.get("username"),picture_file:C.get("picture_file")}),k.set("mode","quick"),k.set("step","quickstart"),k.set("deck",C.get("active_deck")),x.getStack().get("quickstart").reset(),x.getStack().get("quicksetup").reset(),x.getStack().get("quickscenario").reset(),x.getStack().get("quicktech").reset(),x.getStack().get("quickidea").reset(),x.getStack().get("quickwrapup").reset(),x.getStack().show("quickstart")},w.sessionExists=function(t){var n=new d,r=new h;return r.setTransport(p.get("transport")),r.sync(p.get("db"),"library","_view/sessioncount",{key:'"'+t+'"'}).then(function(){r.getNbItems()?n.fulfill():n.reject("not found")}),n},w.reset=function(t){N.reset([{name:"quickstart",label:T.get("quickstepstart"),currentStep:!0,status:"ongoing"},{name:"quicksetup",label:T.get("quickstepsetup"),currentStep:!1,status:null},{name:"quickscenario",label:T.get("quickstepscenario"),currentStep:!1,status:null},{name:"quicktech",label:T.get("quicksteptech"),currentStep:!1,status:null},{name:"quickidea",label:T.get("quickstepidea"),currentStep:!1,status:null},{name:"quickwrapup",label:T.get("quickstepwrapup"),currentStep:!1,status:null}]),t?w.retrieveSession(t):w.startNewSession()},w.prev=function(t){var n;N.loop(function(e,r){e.name===t&&(n=r)}),n>0?(N.update(n,"currentStep",!1),N.update(n-1,"currentStep",!0),x.getStack().show(N.get(n-1).name)):(alert("Exiting session"),b())},w.next=function(t){var n,r,i=x.getStack().get(t),s=new d;return N.loop(function(e,r){e.name===t&&(n=r)}),n<N.getNbItems()-1&&(N.update(n,"currentStep",!1),N.update(n+1,"currentStep",!0),N.get(n).status!=="done"?(N.update(n,"status","done"),N.update(n+1,"status","ongoing"),k.set("step",N.get(n+1).name),k.upload().then(function(){r=x.getStack().get(N.get(n+1).name),r.initTimer&&r.initTimer(),i.stopSpinner(),x.getStack().show(N.get(n+1).name),s.fulfill()})):(i.stopSpinner(),x.getStack().show(N.get(n+1).name),s.fulfill())),s},w.toggleProgress=function(){E.dom.classList.toggle("invisible")},w.init=function(t){k.setTransport(p.get("transport")),x.getStack().add("quickstart",new s(k,w.prev,w.next,w.toggleProgress)),x.getStack().add("quicksetup",new o(k,L,w.prev,w.next,w.toggleProgress)),x.getStack().add("quickscenario",new u(k,L,w.prev,w.next,w.toggleProgress)),x.getStack().add("quicktech",new a(k,L,w.prev,w.next,w.toggleProgress)),x.getStack().add("quickidea",new f(k,L,w.prev,w.next,w.toggleProgress)),x.getStack().add("quickwrapup",new l(k,L,w.prev,w.next,w.toggleProgress)),w.reset(t)},w.init(y),p.get("observer").watch("reconnect",function(){k.get("_id")&&(k.unsync(),k.sync(p.get("db"),k.get("_id")))}),QSESSION=k,w}});