/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Amy/Stack-plugin","Bind.plugin","Event.plugin","./mustart","./musetup","./muscenario","./mutech","./muidea","./muwrapup","CouchDBDocument","service/config","Promise","Store","lib/spin.min","Place.plugin","service/confirm"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g){return function(y){var b=new e,w=new e,E=document.createDocumentFragment(),S=new n,x=h.get("labels"),T=[{name:"mustart",label:x.get("quickstepstart"),currentStep:!1,status:"done"},{name:"musetup",label:x.get("quickstepsetup"),currentStep:!1,status:null},{name:"muscenario",label:x.get("quickstepscenario"),currentStep:!1,status:null},{name:"mutech",label:x.get("quicksteptech"),currentStep:!1,status:null},{name:"muidea",label:x.get("quickstepidea"),currentStep:!1,status:null},{name:"muwrapup",label:x.get("quickstepwrapup"),currentStep:!1,status:null}],N,C,k,L,A,O,M=new d(T),_=h.get("user"),D=h.get("db"),P=new c,H=new d,B=new d({msg:""}),j,F,I=(new v({color:"#9AC9CD",lines:10,length:20,width:8,radius:15})).spin();return w.plugins.addAll({labels:new r(x),step:new r(M,{setCurrent:function(e){e?this.classList.add("pressed"):this.classList.remove("pressed")},setActive:function(e){e?this.classList.remove("inactive"):this.classList.add("inactive")}}),progressevent:new i(w)}),w.template='<div class = "progressbar invisible"><ul id = "musteplist" class="steplist" data-step="foreach"><li class="step inactive" data-step="bind: innerHTML, label; bind:setCurrent, currentStep; bind:setActive, status" data-progressevent="listen: touchstart, changeStep"></li></ul><div class="exit-brainstorm" data-progressevent="listen: touchstart, press; listen:touchend, exit"></div></div>',w.changeStep=function(e,t){var n=t.getAttribute("data-step_id");M.get(n).status?(M.loop(function(e,t){n==t?M.update(t,"currentStep",!0):M.update(t,"currentStep",!1)}),S.getStack().show(M.get(n).name)):e.stopImmediatePropagation()},w.press=function(e,t){t.classList.add("pressed")},w.exit=function(e,t){t.classList.remove("pressed"),P.get("step")==="muwrapup"?(O.getChatUI().leave(),P.get("initiator").id===_.get("_id")&&O.getChatUI().setReadonly(),_.set("sessionInProgress",""),_.upload().then(function(){y()})):j.show()},b.template='<div id="musession"><div data-place="place:progress"></div><div class="sessionmsg invisible"> <span data-info="bind:innerHTML, msg"></div><div class="stack" data-musessionstack="destination"></div></div>',b.plugins.addAll({musessionstack:S,place:new m({progress:w}),info:new r(B)}),b.toggleProgress=function(t){t?w.exit():w.dom.classList.toggle("invisible")},b.leaveSession=function(){var t=P.get("participants"),n,r=S.getStack().get(P.get("step"));for(n=t.length-1;n>=0;n--)if(t[n].id===_.get("_id")){t.splice(n,1);break}P.set("participants",t),P.upload().then(function(){r.getChatUI().leave(),P.unsync(),j.hide()}),_.set("sessionInProgress",""),_.upload().then(function(){y()})},b.cancelSession=function(){var t=5e3;b.displayInfo("deleting",t).then(function(){y()})},b.displayInfo=function(t,n){var r,i=document.querySelector(".sessionmsg"),s=new p,o=function(){i.classList.add("invisible"),clearInterval(r),B.set("msg",""),s.fulfill()};j.hide(),i.classList.remove("invisible"),r=setInterval(function(){switch(t){case"deleting":B.set("msg",x.get("deletingsession")+n/1e3+"s");break;case"participantsleft":B.set("msg",x.get("participantsleft")+" "+n/1e3+"s");break;default:t!==B.get("msg")&&B.set("msg",t)}n<=0&&o(),n-=1e3},1e3);if(t==="deleting"||t==="participantsleft")P.set("status","deleted"),P.upload().then(function(){return _.set("sessionInProgress",""),_.upload()}).then(function(){var e=P.get("chat"),t=e.length,n=new p;return t?e.forEach(function(e){var r=new c;r.setTransport(h.get("transport")),r.sync(D,e).then(function(){return r.remove()}).then(function(){t--,t<=0&&n.fulfill})}):n.fulfill(),n}).then(function(){P.remove()});return s},b.createChat=function(t){var n=new c,r=(new Date).getTime(),i=[],s,o,u=new p;i.push({username:P.get("initiator").username,userid:P.get("initiator").id}),P.get("participants").forEach(function(e){i.push({username:e.username,userid:e.id})}),n.set("users",i);switch(t){case 1:s="quicksetup";break;case 2:s="quickscenario";break;case 3:s="quicktech";break;case 4:s="quickidea";break;case 5:s="quickwrapup";break;default:s="quickstart"}return n.set("msg",[{user:"SYS",type:5,arg:s,time:r}]),n.set("sid",P.get("_id")),n.set("lang",P.get("lang")),n.set("readonly",!1),n.set("step",t),n.set("type",17),o=n.get("sid")+"_"+t,n.setTransport(h.get("transport")),n.sync(D,o).then(function(){return n.upload()}).then(function(){var e=P.get("chat").concat();n.unsync(),e.push(o),P.set("chat",e),u.fulfill()}),u},b.retrieveSession=function(t,n){I.spin(document.getElementById("brainstorm")),P.reset({}),P.sync(D,t).then(function(){var e=P.get("step"),t=1e4,r=M.getNbItems();j=new g(b.dom),F=function(e){e?P.get("initiator").id===_.get("_id")?b.cancelSession():b.leaveSession():j.hide()},P.get("initiator").id===_.get("_id")?j.reset(x.get("leaderleave"),F):j.reset(x.get("participantleave"),F),M.loop(function(r,i){i<t&&(S.getStack().get(r.name).reset(n),M.update(i,"status","done"),r.name===e&&(t=i,M.update(i,"currentStep",!0),r.name==="muwrapup"?M.update(i,"status","done"):M.update(i,"status","ongoing")))}),n?(I.stop(),S.getStack().show("muwrapup")):(I.stop(),S.getStack().show(e))})},b.reset=function(t,n){P.unsync(),H.reset(),M.reset([{name:"mustart",label:x.get("quickstepstart"),currentStep:!1,status:"done"},{name:"musetup",label:x.get("quickstepsetup"),currentStep:!1,status:null},{name:"muscenario",label:x.get("quickstepscenario"),currentStep:!1,status:null},{name:"mutech",label:x.get("quicksteptech"),currentStep:!1,status:null},{name:"muidea",label:x.get("quickstepidea"),currentStep:!1,status:null},{name:"muwrapup",label:x.get("quickstepwrapup"),currentStep:!1,status:null}]),t&&b.retrieveSession(t,n)},b.prev=function(t){var n;M.loop(function(e,r){e.name===t&&(n=r)}),n>0?(M.update(n,"currentStep",!1),M.update(n-1,"currentStep",!0),S.getStack().show(M.get(n-1).name)):(alert("Exiting session"),y())},b.next=function(t){var n,r=S.getStack().get(t),i,s="",o=new p;return M.loop(function(e,r){e.name===t&&(n=r)}),n<M.getNbItems()&&(s=M.get(n+1).name,i=S.getStack().get(s),M.update(n,"currentStep",!1),M.update(n+1,"currentStep",!0),M.get(n).status!=="done"?(M.update(n,"status","done"),M.update(n+1,"status","ongoing"),M.get(n+1).name==="muwrapup"&&M.update(n+1,"status","done"),i.reset(),b.createChat(n+1).then(function(){return P.set("step",s),P.upload()}).then(function(){i.initTimer&&i.initTimer(),r.stopSpinner(),S.getStack().show(s),s==="muwrapup"?(_.unsync(),_.sync(h.get("db"),_.get("_id")).then(function(){return _.set("sessionInProgress",""),_.upload()}).then(function(){o.fulfill()})):o.fulfill()})):(r.stopSpinner(),S.getStack().show(s),o.fulfill())),o},b.init=function(){N=new s(P,b.prev,b.next,b.toggleProgress),C=new o(P,H,b.prev,b.next,b.toggleProgress),k=new u(P,H,b.prev,b.next,b.toggleProgress),L=new a(P,H,b.prev,b.next,b.toggleProgress),A=new f(P,H,b.prev,b.next,b.toggleProgress),O=new l(P,H,b.prev,b.next,b.toggleProgress),P.setTransport(h.get("transport")),S.getStack().add("mustart",N),S.getStack().add("musetup",C),S.getStack().add("muscenario",k),S.getStack().add("mutech",L),S.getStack().add("muidea",A),S.getStack().add("muwrapup",O)},b.init(),P.watchValue("status",function(e){e==="deleted"&&P.get("initiator").id!==_.get("_id")&&(_.set("sessionInProgress",""),_.upload(),b.displayInfo(x.get("canceledbyleader"),2e3).then(function(){P.unsync(),y()}))}),P.watchValue("step",function(e){var t,n=P.get("step");P.get("initiator")&&P.get("initiator").id!==_.get("_id")&&(M.loop(function(e,r){e.name===n&&(t=r)}),M.update(t-1,"status","done"),M.update(t,"status","ongoing"),M.update(t-1,"currentStep",!1),M.update(t,"currentStep",!0),S.getStack().get(e).reset(),S.getStack().show(e)),step==="muwrapup"&&(_.unsync(),_.sync(h.get("db"),_.get("_id")).then(function(){return _.set("sessionInProgress",""),_.upload()}))}),P.watchValue("participants",function(e){e.length===0&&P.get("step")!=="muwrapup"&&b.displayInfo("participantsleft",1e4).then(function(){return _.set("sessionInProgress",""),_.upload()}).then(function(){y()})}),b}});