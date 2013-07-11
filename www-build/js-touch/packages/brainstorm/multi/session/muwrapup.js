/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","Place.plugin","service/config","Store","service/utils","./mubchat"],function(e,t,n,r,i,s,o,u,a){return function(l,c,h,p,d){var v=new e,m=new o,g=new o([]),y=s.get("labels"),b=new a,w;return v.plugins.addAll({labels:new n(y),wrapup:new n(m,{formatTitle:function(e){e&&(this.innerHTML=e.substring(0,1).toUpperCase()+e.substring(1).toLowerCase())},setScore:function(e){e&&(this.innerHTML=e+" ip")},setTime:function(e){e&&(this.innerHTML=u.formatDuration(e))},alertMsg:function(e){var t=this;e&&v.dom.querySelector(".sessionchat").classList.contains("folded")?w=setInterval(function(){t.classList.toggle("flashing")},300):w&&clearInterval(w)},setVisibility:function(e){e&&e==="public"?this.classList.add("publicwrapup"):this.classList.remove("publicwrapup")},setReplay:function(e){e?this.classList.remove("invisible"):this.classList.add("invisible")}}),cards:new n(g,{formatTitle:function(e){var t=this.getAttribute("data-cards_id");e&&(t<3?this.innerHTML=e.substring(0,1).toUpperCase()+e.substring(1).toLowerCase():(this.innerHTML=e.toUpperCase(),this.setAttribute("style","font-family:Helvetica;")))},setPic:function(e){e?this.setAttribute("style","background-image:url('"+e+"');"):this.setAttribute("style","background-image: none;")}}),place:new i({chat:b}),muwrapupevent:new r(v)}),v.template='<div id = "muwrapup"><div class="previousbutton" data-muwrapupevent="listen: touchstart, press; listen: touchstart, prev"></div><div class="brainstorm-header header blue-light" data-labels="bind: innerHTML, muwrapup" data-muwrapupevent="listen:touchstart, toggleProgress"></div><div class="congrats"><div class="message"><span class="messagetitle" data-labels="bind:innerHTML, congratulations"></span><span class="sessioncompleted" data-labels="bind:innerHTML, sessioncompleted"></span></div><div class="enddeedee"></div></div><div class="summary"><div class="storysummary"><div class="storyheader" data-labels="bind:innerHTML, storytitlelbl">Your Story</div><div class="storytitle" data-wrapup="bind:formatTitle, scenario.title"></div><div class="storycontent"><p class="summaryheader" data-labels="bind:innerHTML, scenarioheader"></p><p class="content" data-wrapup="bind:innerHTML, scenario.story"></p><p class="summaryheader" data-labels="bind:innerHTML, scenariosolution"></p><p class="content" data-wrapup="bind:innerHTML, scenario.solution">solution content</p></div></div><div class="ideasummary"><div class="ideaheader" data-labels="bind:innerHTML, ideatitlelbl"></div><div class="ideatitle" data-wrapup="bind:formatTitle, idea.title"></div><div class="ideacontent"><p class="summaryheader" data-labels="bind:innerHTML, ideadescription"></p><p class="content" data-wrapup="bind:innerHTML, idea.description"></p><p class="summaryheader" data-labels="bind:innerHTML, ideaimplementation"></p><p class="content" data-wrapup="bind:innerHTML, idea.solution">solution content</p></div></div></div><div class="sessionresults"><div class ="sessiontime"><span data-labels="bind:innerHTML, yourtime"></span><span data-wrapup = "bind: setTime, duration"></span></div><div class="sessionscore"><span data-labels="bind:innerHTML, yourscore"></span><span data-wrapup="bind:setScore, score"></span></div><div class="wrapupvisibility" data-wrapup="bind:setVisibility, idea.visibility"></div><div class="wrapupreplay invisible" data-wrapup="bind:setReplay, idea.sessionReplay"></div></div><div class="exit-brainstorm" data-progressevent="listen: touchstart, press; listen:touchend, exit"></div><div class="sessioncards" data-muwrapupevent="listen:touchstart, toggleCards"><legend>Cards used during this session</legend><ul class="cardlist" data-cards="foreach"><li class="card"><div class="cardpicture" data-cards="bind:setPic,pic"></div><div class="cardtitle" data-cards="bind: formatTitle, title"></div></li></ul></div><div class="togglechat" data-wrapup="bind:alertMsg, newmsg" data-muwrapupevent="listen: touchstart, toggleChat"></div><div class="sessionchat folded" data-place="place:chat"></div></div>',v.place(t.get("muwrapup")),v.press=function(e,t){t.classList.add("pressed")},v.next=function(e,t){t.classList.remove("pressed"),p("muwrapup")},v.exit=function(){d(!0)},v.prev=function(e,t){t.classList.remove("pressed"),h("muwrapup")},v.toggleProgress=function(e,t){d()},v.toggleCards=function(e,t){t.classList.contains("expanded")?t.classList.remove("expanded"):t.classList.add("expanded")},v.toggleChat=function(t,n){m.set("newmsg",!1),v.dom.querySelector(".sessionchat").classList.toggle("folded")},v.getChatUI=function(){return b},v.reset=function(t){g.reset([]),m.reset(),b.clear(),l.get("chat")[5]&&b.reset(l.get("chat")[5]).then(function(){b.getModel().watchValue("msg",function(e){e.length>1&&!t&&(m.set("newmsg",!0),setTimeout(function(){clearInterval(w)},2500))}),t&&b.dom.querySelector(".chatread").classList.add("replayed")}),m.set("scenario",c.get("scenario")),m.set("idea",c.get("idea")),m.set("score",l.get("score")),m.set("duration",l.get("duration")),g.reset([]),t?["added","updated"].forEach(function(e){c.watch(e,function(){var e;c.get("characters")&&c.get("contexts")&&c.get("problems")&&c.get("techno").getNbItems()===3&&(e=[c.get("characters"),c.get("contexts"),c.get("problems"),c.get("techno").get(0),c.get("techno").get(1),c.get("techno").get(2)],g.reset(e))})}):g.reset([c.get("characters"),c.get("contexts"),c.get("problems"),c.get("techno").get(0),c.get("techno").get(1),c.get("techno").get(2)])},c.watchValue("scenario",function(e){m.set("scenario",e)}),c.watchValue("idea",function(e){m.set("idea",e)}),l.watchValue("score",function(e){m.set("score",e)}),l.watchValue("duration",function(e){m.set("duration",e)}),l.watchValue("chat",function(e){e.length===6&&b.getModel().get("_id")!==e[5]&&(b.reset(e[5]),b.getModel().watchValue("msg",function(e){e.length>1&&m.set("newmsg",!0)}))}),MUWRAP=v,v}});