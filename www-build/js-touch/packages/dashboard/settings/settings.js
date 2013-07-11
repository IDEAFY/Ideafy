/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","service/config","Store","service/utils","CouchDBBulkDocuments"],function(e,t,n,r,i,s,o,u){return function(){var f=new e,l=i.get("labels"),c=[{name:l.get("public"),dest:"#public"},{name:l.get("library"),dest:"#library"},{name:l.get("brainstorm"),dest:"#brainstorm"},{name:l.get("connect"),dest:"#connect"},{name:l.get("dashboard"),dest:"#dashboard"}],h=[{name:l.get("everymin"),value:6e4},{name:l.get("everyfive"),value:3e5},{name:l.get("everyfifteen"),value:9e5},{name:l.get("never"),value:864e5}],p=new s({screens:c,timers:h,pwd:"",pwdbis:"",lang:[],pwdchange:""}),d=new s,v=i.get("transport"),m=i.get("user");return f.plugins.addAll({label:new n(l),options:new n(p,{setLang:function(e){var t,n,r="";for(t=0,n=e.length;t<n;t++)r+="<option>"+e[t]+"</option>";this.innerHTML=r,this.selectedIndex=e.indexOf(m.get("lang"))},setStartupScreen:function(e){var t,n,r="",i,s;for(t=0,n=e.length;t<n;t++)r+="<option>"+e[t].name+"</option>",e[t].dest===m.get("settings").startupScreen&&(s=t);this.innerHTML=r,this.selectedIndex=s},setPollingInterval:function(e){var t,n,r="",i,s;for(t=0,n=e.length;t<n;t++)r+="<option>"+e[t].name+"</option>",e[t].value===m.get("settings").polling_interval&&(s=t);this.innerHTML=r,this.selectedIndex=s},setDecks:function(e){var t,n,r="",i,s;for(t=0,n=e.length;t<n;t++)r+="<option>"+e[t].title+"</option>",e[t].id===m.get("active_deck")&&(s=t);this.innerHTML=r,this.selectedIndex=s}}),settings:new n(d),settingsevent:new r(f)}),f.template='<div id="dashboard-settings"><div class="header blue-dark"><span data-label="bind:innerHTML, settingslbl"></span></div><div class="settingscontent"><div class="settingmodule"><legend data-label="bind:innerHTML, userpref"></legend><ul><li><span data-label="bind:innerHTML, setlang"></span><select data-options="bind:setLang, lang" data-settingsevent="listen: change, updateLang"></select></li><li class="startupscreen"><span data-label="bind: innerHTML, choosestartup"></span><select data-options="bind:setStartupScreen, screens" data-settingsevent="listen: change, updateStartup"></select></li><li class="startupscreen"><span data-label="bind: innerHTML, choosepolling"></span><select data-options="bind:setPollingInterval, timers" data-settingsevent="listen: change, updatePollingInterval"></select></li><li class="setting-input"><input type="checkbox" data-settings="bind: checked, showTips" data-settingsevent="listen: change, showTips"><label data-label="bind:innerHTML, showtips"></label></li><li class="setting-input"><input type="checkbox" data-settings="bind: checked, notifyPopup" data-settingsevent="listen: change, showNotif"><label data-label="bind:innerHTML, shownotif"></label></li><li class="setting-input"><input type="checkbox" data-settings="bind: checked, useascharacter" data-settingsevent="listen: change, useAsChar"><label data-label="bind:innerHTML, usechar"></label></li><li><span data-label="bind: innerHTML, changepwd"></span><input class="input" type="password" data-label="bind:placeholder, passwordplaceholder" data-options="bind: value, pwd" data-settingsevent="listen: input, clearOK"><input class="input" type="password" data-label="bind:placeholder, repeatpasswordplaceholder" data-options="bind: value, pwdbis" data-settingsevent="listen: input, clearOK"><span class="changeok" data-options="bind: innerHTML, pwdchange"></span><div class="next-button" data-label="bind:innerHTML, changelbl" data-settingsevent="listen: touchstart, press; listen:touchend, changePWD"></div></li></ul></div><div class="settingmodule"><legend data-label="bind:innerHTML, brainstormsettings"></legend><ul><li class="activedeck"><span data-label="bind:innerHTML, setdeck">Set brainstorming deck</span><select data-options="bind:setDecks, decks" data-settingsevent="listen: change, updateDeck"></select></li></ul></div></div></div>',f.place(t.get("dashboard-settings")),f.updateLang=function(t,n){n.value!==m.get("lang")&&o.updateLabels(n.value).then(function(){m.set("lang",n.value),m.upload(),p.set("timers",[{name:l.get("everymin"),value:6e4},{name:l.get("everyfive"),value:3e5},{name:l.get("everyfifteen"),value:9e5},{name:l.get("never"),value:864e5}]),p.set("screens",[{name:l.get("public"),dest:"#public"},{name:l.get("library"),dest:"#library"},{name:l.get("brainstorm"),dest:"#brainstorm"},{name:l.get("connect"),dest:"#connect"},{name:l.get("dashboard"),dest:"#dahsboard"}])})},f.getDecks=function(){var t=new u,n=m.get("taiaut_decks").concat(m.get("custom_decks")),r=[];t.setTransport(i.get("transport")),t.sync(i.get("db"),{keys:n}).then(function(){p.set("decks",[]),t.loop(function(e,t){var n=e.doc.content;n.characters.length>=2&&n.contexts.length>=2&&n.problems.length>=2&&n.techno.length>=4&&r.push({id:e.doc._id,title:e.doc.title})}),t.unsync(),r.sort(function(e,t){var n=e.title,r=t.title;if(n<r)return-1;if(n>r)return 1;if(n===r)return 0}),p.set("decks",r)})},f.updateDeck=function(t,n){var r=n.selectedIndex,i=p.get("decks")[r].id;m.set("active_deck",i),m.upload()},f.updateStartup=function(t,n){var r=n.selectedIndex,i=m.get("settings");i.startupScreen=c[r].dest,m.set("settings",i),m.upload()},f.updatePollingInterval=function(t,n){var r=n.selectedIndex,i=m.get("settings");i.polling_interval=h[r].value,m.set("settings",i),m.upload()},f.showTips=function(e,t){var n=m.get("settings");n.showTips=t.checked,m.set("settings",n),m.upload().then(function(){console.log("upload successful")})},f.showNotif=function(e,t){var n=m.get("settings");n.notifyPopup=t.checked,m.set("settings",n),m.upload()},f.useAsChar=function(e,t){var n=m.get("settings");n.useascharacter=t.checked,m.set("settings",n),m.upload()},f.press=function(e,t){t.classList.add("pressed")},f.clearOK=function(e,t){p.set("pwdchange","")},f.changePWD=function(e,t){t.classList.remove("pressed"),p.get("pwd")!==p.get("pwdbis")?p.set("pwdbis",""):v.request("ChangePWD",{userid:m.get("_id"),pwd:p.get("pwd")},function(e){e==="ok"&&p.set("pwdchange","&#10003;")})},f.reset=function(){d.reset(m.get("settings")),m.watchValue("settings",function(e){d.reset(m.get("settings"))}),f.getDecks(),v.request("GetLanguages",{},function(e){p.set("lang",e)}),p.set("timers",[{name:l.get("everymin"),value:6e4},{name:l.get("everyfive"),value:3e5},{name:l.get("everyfifteen"),value:9e5},{name:l.get("never"),value:864e5}]),p.set("screens",[{name:l.get("public"),dest:"#public"},{name:l.get("library"),dest:"#library"},{name:l.get("brainstorm"),dest:"#brainstorm"},{name:l.get("connect"),dest:"#connect"},{name:l.get("dashboard"),dest:"#dahsboard"}])},f.reset(),o.updateLabels(m.get("lang")),m.watchValue("taiaut_decks",f.getDecks),m.watchValue("custom_decks",f.getDecks),m.watchValue("active_deck",f.getDecks),f}});