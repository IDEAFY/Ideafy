/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Bind.plugin","Event.plugin","Amy/Stack-plugin","service/config","Store","CouchDBDocument","./editchar","./editcard","./importcard","Promise"],function(e,t,n,r,i,s,o,u,a,f,l){return function(h){var p=new e,d=new r,v=new s;return cardCDB=new o,labels=i.get("labels"),user=i.get("user"),close=function(){document.getElementById("card_creation").classList.add("invisible")},updateDeck=function(e,t){var n=new l,r=v.get("deckId"),s=new o,u="characters";console.log("deck update function in newcard : ",e,t,r);switch(e){case 1:u="characters";break;case 2:u="contexts";break;case 3:u="problems";break;case 4:u="techno";break;default:console.log("no type detected")}return s.setTransport(i.get("transport")),s.sync(i.get("db"),r).then(function(){var e=new Date,n=s.get("content"),r=n[u];return r.indexOf(t)<0&&(r.push(t),n[u]=r,s.set("content",n)),s.set("last_updated",[e.getFullYear(),e.getMonth(),e.getDate()]),s.upload()}).then(function(){s.unsync(),h("updated",r,e),n.fulfill()}),n},editCard=new a(updateDeck,close),editChar=new u(updateDeck,close),importCard=new f(updateDeck,close),p.template='<div id="card_creation" class="invisible"><div class="header blue-dark" data-label="bind: innerHTML, cardeditor"></div><div class="create_header"><label data-label="bind:innerHTML, createnew"></label><select class="changetype" data-setup="bind: selectedIndex, type" data-newcardevent="listen: change, changeType"><option data-label="bind:innerHTML, char"></option><option data-label="bind:innerHTML, context"></option><option data-label="bind:innerHTML, problem"></option><option data-label="bind:innerHTML, techno"></option></select></div><div class="createcontentstack" data-newcardcontentstack="destination"></div></div>',p.plugins.addAll({label:new t(labels),setup:new t(v),newcardcontentstack:d,newcardevent:new n(p)}),p.close=close,p.reset=function(t,n,r,i){document.getElementById("card_creation").classList.remove("invisible"),console.log(t,n,r,i),v.reset({deckId:r,title:i,type:["characters","contexts","problems","techno"].indexOf(n)}),n==="characters"?(editChar.reset(r,t),d.getStack().show("editchar")):(editCard.reset(r,t,n),d.getStack().show("editcard"))},p.press=function(e,t){t.classList.add("pressed")},p.import=function(e,t){t.classList.remove("pressed"),d.getStack().show("importcard")},p.changeType=function(e,t){var n=t.selectedIndex;d.getStack().getCurrentName()==="importcard"?importCard.changeType(n):n===0?(editChar.reset(v.get("deckId"),"newcard"),d.getStack().show("editchar")):(editCard.reset(v.get("deckId"),"newcard",v.get("type")),d.getStack().show("editcard"),editCard.changeType(n))},p.init=function(){d.getStack().add("editchar",editChar),d.getStack().add("editcard",editCard),d.getStack().add("importcard",importCard)},p.init(),CSTACK=d,p}});