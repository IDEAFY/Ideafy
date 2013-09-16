/* 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Event.plugin","Store","CouchDBBulkDocuments","CouchDBView","Promise","lib/spin.min","service/confirm","service/map"],function(e,t,n,r,i,s,o,u,a,f,l){return function(h,p){var d=new e,v=t.get("labels"),m=t.get("user"),g=t.get("transport"),y=t.get("db"),b=new i([]),w=new i([]),E=[],S,x=new i,T;return d.template='<div class="importcard"><div class="importfrom"><label data-label="bind:innerHTML, importfrom"></label><select data-model="bind:setDecks, decks" data-importevent="listen: change, updateSelect"></select></div><div class="importlist"><legend data-label="bind:innerHTML, seldeck"></legend><ul name="selected" data-selected="foreach"><li name="selected" data-selected="bind: setType, type; bind: innerHTML, title; bind: setSelected, selected" data-importevent="listen: mouseup , toggleSelect"></li></ul></div><div class="importarea"><button class="addremove invisible" data-model="bind: setVisible, sel; bind: setDirection, direction" data-importevent="listen: mouseup , addRemoveSelected">Add/remove</button><button class="invisible" data-label="bind:innerHTML, selall" data-model="bind:setVisible, sel" data-importevent="listen: mouseup , selectAll"></button><button class="invisible" data-label="bind:innerHTML, clearsel" data-model="bind: setVisible, sel" data-importevent="listen: mouseup , clearSelected">Clear selection</button></div><div class="importlist"><legend data-label="bind:innerHTML, workdeck"></legend><ul data-current="foreach"><li name="current" data-current="bind: setType, type; bind: innerHTML, title; bind: setSelected, selected" data-importevent="listen: mouseup , toggleSelect"></li></ul></div><div class="cancelmail" data-importevent="listen:mousedown, press; listen:mouseup , cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-importevent="listen:mousedown, press; listen:mouseup , upload" data-label="bind:innerHTML, savelbl">Save</div></div>',d.plugins.addAll({label:new n(v),model:new n(x,{setDecks:function(e){var t,n,r="",i,s;if(e)for(t=0,n=e.length;t<n;t++)e[t]._id!==S&&(r+="<option>"+e[t].title+"</option>");this.innerHTML=r},setDirection:function(e){e?node.classList.remove("invisible"):node.classList.add("invisible"),e==="remove"?this.innerHTML=v.get("remsel"):this.innerHTML=v.get("impsel")},setVisible:function(e){e?this.classList.remove("invisible"):this.classList.add("invisible")}}),current:new n(b,{setType:function(e){switch(e){case 1:this.setAttribute("style","background-image:url('../img/decks/characters.png'); color: #657b99;");break;case 2:this.setAttribute("style","background-image:url('../img/decks/context.png');color:#5f8f28;");break;case 3:this.setAttribute("style","background-image:url('../img/decks/problem.png');color: #bd262c");break;case 4:this.setAttribute("style","background-image:url('../img/decks/technology.png');color: #f27b3d;");break;default:}},setSelected:function(e){e?this.classList.add("selected"):this.classList.remove("selected")}}),selected:new n(w,{setType:function(e){switch(e){case 1:this.setAttribute("style","background-image:url('../img/decks/characters.png'); color: #657b99;");break;case 2:this.setAttribute("style","background-image:url('../img/decks/context.png');color:#5f8f28;");break;case 3:this.setAttribute("style","background-image:url('../img/decks/problem.png');color: #bd262c");break;case 4:this.setAttribute("style","background-image:url('../img/decks/technology.png');color: #f27b3d;");break;default:}},setSelected:function(e){e?this.classList.add("selected"):this.classList.remove("selected")}}),importevent:new r(d)}),d.cancel=function(e,t){t.classList.remove("pressed"),p()},d.upload=function(e,t){var n=(new a({color:"#8cab68",lines:10,length:8,width:4,radius:8,top:-7,left:28})).spin(t),r=["newcard"],i=["newcard"],s=["newcard"],o=["newcard"];E.length&&g.request("DeleteCards",{idList:E},function(e){return e}),b.loop(function(e,t){switch(e.type){case 1:r.push(e.id);break;case 2:i.push(e.id);break;case 3:s.push(e.id);break;case 4:o.push(e.id);break;default:r.push(e.id)}}),h({characters:r,contexts:i,problems:s,techno:o}).then(function(){n.stop(),t.classList.remove("pressed"),p()})},d.press=function(e,t){t.classList.add("pressed")},d.updateSelect=function(e,t){var n=t.selectedIndex;w.reset([]),d.getDeckCards(x.get("decks")[n]._id,w)},d.toggleSelect=function(e,t){var n=t.getAttribute("name"),r=t.getAttribute("data-"+n+"_id"),i,s=x.get("sel")||0;n==="current"?(i=b,x.get("direction")!=="remove"&&(d.clearSelection("selected"),x.set("direction","remove"),s=0)):(i=w,x.get("direction")!=="add"&&(d.clearSelection("current"),x.set("direction","add"),s=0)),i.get(r).selected?(i.update(r,"selected",!1),x.set("sel",s-1)):(i.update(r,"selected",!0),x.set("sel",s+1))},d.selectAll=function(e,t){var n;x.get("direction")==="add"?n=w:n=b,n.loop(function(e,t){n.update(t,"selected",!0)})},d.clearSelected=function(e,t){var n;x.get("direction")==="add"?n=w:n=b,n.loop(function(e,t){n.update(t,"selected",!1)}),x.set("sel",0)},d.addRemoveSelected=function(e,t){var n=x.get("direction");n==="add"?d.addSelected():d.removeSelected()},d.addSelected=function(){var t=b.toJSON(),n=JSON.parse(t),r=d.dom.querySelector("ul[name='current']"),i=(new a).spin(r);b.reset([]),w.loop(function(e,r){e.selected&&t.search(e.id)===-1&&n.push({id:e.id,type:e.type,title:e.title,deck:e.deck.concat(),selected:e.selected})}),n.sort(function(e,t){var n=e.title,r=t.title;if(n<r)return-1;if(n>r)return 1;if(n===r)return 0}),b.reset(n),i.stop(),d.clearSelection("selected"),x.set("direction","remove")},d.removeSelected=function(){var t=[],n=[],r="";b.loop(function(e,r){e.selected&&(t.push(r),e.deck.length===1&&e.deck[0]===S&&n.push({title:e.title.toUpperCase(),id:e.id}))}),n.length?(l.get("cache").classList.add("appear"),n.forEach(function(e){r+=e.title+", "}),r=r.slice(0,-2),T=new f(document.body,v.get("delcardwarning")+r,function(e){e&&(b.delAll(t),d.clearSelection("current"),x.set("sel",0),n.forEach(function(e){E.push(e.id)})),document.body.removeChild(document.querySelector(".confirm")),l.get("cache").classList.remove("appear")},"importcard-confirm")):(b.delAll(t),d.clearSelection("current"),x.set("sel",0))},d.clearSelection=function(e){var t;e==="current"?t=b:t=w,t.loop(function(e,n){e.selected&&e.selected===!0&&t.update(n,"selected",!1)})},d.getDecks=function(t){var n=new s,r=m.get("taiaut_decks").concat(m.get("custom_decks")),i=new u;return n.setTransport(g),n.sync(y,{keys:r}).then(function(){var e=m.get("lang"),r=[],s;n.loop(function(t,n){if(t.doc.public||t.doc.created_by===m.get("_id")||t.doc.sharedwith&&t.doc.sharedwith.indexOf(m.get("_id")))!t.doc.default_lang||t.doc.default_lang===e?r.push(t.doc):t.doc.translations&&t.doc.translations[e]?r.push(t.doc.translations[e]):r.push(t.doc)});for(s=r.length-1;s>=0;s--)r[s]._id===t&&r.splice(s,1);r.sort(function(e,t){var n=e.title,r=t.title;if(n<r)return-1;if(n>r)return 1;if(n===r)return 0}),x.set("decks",r.concat()),i.fulfill(),n.unsync()}),i},d.getDeckCards=function(t,n){var r=new o,i=new u,s=d.dom.querySelector("ul[name='selected']"),f=(new a).spin(s);return r.setTransport(g),r.sync(y,"library","_view/cards",{key:'"'+t+'"'}).then(function(){var e=[];r.loop(function(t,n){e.push({id:t.value._id,type:t.value.type,title:t.value.title,deck:t.value.deck})}),e.sort(function(e,t){var n=e.title,r=t.title;if(n<r)return-1;if(n>r)return 1;if(n===r)return 0}),f.stop(),n.reset(e),i.fulfill()}),i},d.reset=function(t){x.reset({}),b.reset([]),w.reset([]),E=[],d.dom.querySelector("select").selectedIndex=0,S=t,d.getDecks(S).then(function(){d.getDeckCards(S,b),d.getDeckCards(x.get("decks")[0]._id,w)})},m.watchValue("taiaut_decks",function(){d.getDecks()}),m.watchValue("custom_decks",function(){d.getDecks()}),m.watchValue("lang",function(){d.getDecks()}),d}});