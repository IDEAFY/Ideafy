/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","service/config","Store","lib/spin.min"],function(e,t,n,r,i,s,o){return function(){var a=new e,f=i.get("labels"),l=new s,c=i.get("user"),h=null,p=!1,d;return a.plugins.addAll({label:new n(f),model:new n(l,{setVisible:function(e){e?this.classList.remove("invisible"):this.classList.add("invisible")},setButton:function(e){e?this.setAttribute("style","display: inline-block;"):this.setAttribute("style","display:none;")},displayVote:function(e){var t=this.getAttribute("name"),n=l.get(t+"Votes"),r=this.querySelector(".yesvote"),i=this.querySelector(".novote");e?n.indexOf(c.get("_id"))>-1?i.classList.add("invisible"):r.classList.add("invisible"):(r.classList.remove("invisible"),i.classList.remove("invisible"))},setResult:function(e){e?this.innerHTML=f.get(e):this.innerHTML=""}}),event:new r(a)}),a.template='<div class = "confirm invisible"><legend><span data-label="bind:innerHTML, decidemsg"></span><span class="unanimity" data-label="bind: innerHTML, unanimity"></span></legend><div class="votingitem invisible" name="public" data-model="bind:setVisible,public; bind: displayVote, publicVote"><div class="sessionquestion" data-label="bind:innerHTML,setpublic"></div><div class = "votingbuttons" name="public"><span class="yesvote" data-label="bind:innerHTML, yeslbl" data-event="listen: touchstart, push; listen: touchend, vote">Yes</span><span class="novote" data-label="bind:innerHTML, nolbl" data-event="listen: touchstart, push; listen: touchend, vote">No</span></div><div class="votingresult" data-model="bind: setResult, publicResult"></div></div><div class="votingitem invisible" name = "replay" data-model="bind:setVisible,replay; bind: displayVote, replayVote"><div class="sessionquestion" data-label="bind:innerHTML,enablereplay"></div><div class = "votingbuttons" name="replay"><span class="yesvote" data-label="bind:innerHTML, yeslbl" data-event="listen: touchstart, push; listen: touchend, vote">Yes</span><span class="novote" data-label="bind:innerHTML, nolbl" data-event="listen: touchstart, push; listen: touchend, vote">No</span></div><div class="votingresult" data-model="bind: setResult, replayResult"></div></div><div id="muvotespinner"></div><div class="option left votebutton" data-event="listen:touchstart, press; listen:touchend, submit" data-model="bind:setButton, submit" data-label="bind: innerHTML, submitlbl">Submit</div><div class="option right votebutton" data-event="listen:touchstart, press; listen:touchend, skip" data-model="bind:setButton, skip" data-label="bind:innerHTML, skiplbl">Skip</div></div>',a.press=function(e,t){e.stopPropagation(),t.classList.add("pressed")},a.push=function(e,t){var n=t.parentNode,r=n.getAttribute("name");!l.get(r+"Vote")&&!l.get(r+"Result")&&t.setAttribute("style","-webkit-box-shadow: 0px 0px 2px #657B99;")},a.vote=function(t,n){var r=n.parentNode,i=r.getAttribute("name");n.setAttribute("style","-webkit-box-shadow: none;");if(l.get("leader"))n.classList.toggle("voted"),n.classList.contains("yesvote")?n.classList.contains("voted")?(l.set(i+"Votes",[c.get("_id")]),r.querySelector(".novote").classList.remove("voted")):l.set(i+"Votes",[]):(r.querySelector(".yesvote").classList.remove("voted"),l.set(i+"Votes",[])),!l.get("publicVotes").length&&!l.get("replayVotes").length?l.set("submit",!1):l.set("submit",!0);else if(!l.get(i+"Vote")){var s=l.get(i+"Votes");n.classList.contains("novote")?(i==="public"&&l.set("publicResult","rejected"),i==="replay"&&l.set("replayResult","rejected")):(s.push(c.get("_id")),l.set(i+"Votes",s),s.length===h.get("participants").length+1&&(i==="public"&&l.set("publicResult","accepted"),i==="replay"&&l.set("replayResult","accepted"))),n.classList.add("voted"),l.set(i+"Vote",!0),p?setTimeout(a.uploadVote,3e3):a.uploadVote()}},a.uploadVote=function(){var t;l.get("leader")||(t=h.get("vote"),p=!0,t.public&&(t.publicVotes=l.get("publicVotes"),t.publicResult=l.get("publicResult")),t.replay&&(t.replayVotes=l.get("replayVotes"),t.replayResult=l.get("replayResult")),h.set("vote",t),h.upload().then(function(){p=!1},function(e){console.log(e)}))},a.submit=function(e,t){var n={};t.classList.remove("pressed"),l.set("skip",!1),l.set("submit",!1),["public","replay"].forEach(function(e){l.get(e+"Votes").length?(n[e]=!0,n[e+"Votes"]=[c.get("_id")]):l.get(e+"Vote")?l.set(e+"Result","rejected"):l.set(e,!1),l.set(e+"Vote",!0)}),h.set("vote",n),h.upload().then(function(){return!0},function(e){console.log(e)})},a.skip=function(e,t){t&&t.classList.remove("pressed"),a.close(),d({visibility:"private",replay:!1})},a.close=function(){t.get("cache").classList.remove("votingcache"),a.dom.classList.add("invisible"),h=null},a.isActive=function(){return h!==null},a.show=function(){t.get("cache").classList.add("votingcache"),a.dom.classList.remove("invisible")},a.reset=function(n,r){var i;h=n,d=r,l.reset({}),h.get("vote")&&l.reset(h.get("vote")),h.get("initiator").id===c.get("_id")?(l.set("leader",!0),l.set("submit",!1),l.set("skip",!0),["public","replay"].forEach(function(e){l.set(e,!0),l.set(e+"Vote",!1),l.set(e+"Votes",[]),l.set(e+"Result","")})):(l.set("leader",!1),l.set("submit",!1),l.set("skip",!1)),l.set("publicVote",!1),l.set("replayVote",!1),a.show(),i=h.watchValue("vote",function(e){var n={},r=new o({lines:10,length:8,width:4,radius:8,top:10});exitVote=function(){h.unwatch(i),r.spin(a.dom.querySelector("#muvotespinner")),setTimeout(function(){r.stop(),t.get("cache").classList.remove("votingcache"),d&&d(n)},5e3)},e&&e.public&&e.replay?(l.set("publicResult",e.publicResult),l.set("replayResult",e.replayResult),e.publicResult&&e.replayResult&&(e.publicResult==="accepted"?n.visibility="public":n.visibility="private",e.replayResult==="accepted"?n.replay=!0:n.replay=!1,exitVote())):e&&e.public?(l.set("publicResult",e.publicResult),n.replay=!1,e.publicResult&&(e.publicResult==="accepted"?n.visibility="public":n.visibility="private",n.replay=!1,exitVote())):e&&e.replay&&(l.set("replayResult",e.replayResult),n.visibility="private",e.replayResult&&(e.replayResult==="accepted"?n.replay=!0:n.replay=!1,exitVote()))})},a}});