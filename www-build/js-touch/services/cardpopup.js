/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Bind.plugin","Event.plugin","service/config","Store"],function(e,t,n,r,i){function s(e){var s=new i,o=r.get("labels"),u,a={x:0,y:0},f='<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark"> <span data-carddetails="bind: formatName, firstname"></span><div class="close-popup" data-popupevent="listen:touchstart, close"></div></div><div class="cd-picarea"><div class="cardpicture" data-carddetails="bind:setPic, picture_file"></div><div class="cardinfo"><ul><li><span class="cd-agelbl"></span><span data-carddetails="bind:innerHTML, age"></span><span class="agesuffix" data-label="bind:innerHTML, agelbl"></span></li><li><span class="cd-locationlbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, location"></span></li><li><span class="cd-joblbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, occupation.description"></span></li><li><span class="cd-familylbl"></span><span class="cd-info" data-carddetails="bind: setFamily, family"></span></li><li><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit"></span></li></ul></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, hobbieslbl">Hobbies</span><p class = "charinfo" data-carddetails="bind:setLeisure, leisure_activities">hobbies</p><span class="contentTitle" data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "charinfo" data-carddetails="bind: setInterests, interests">Centers of interest</p><span class="contentTitle" data-label="bind: innerHTML, commentslbl">Comments</span><p class = "charinfo" data-carddetails="bind:setComments, comments"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>',l='<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark"> <span data-carddetails="bind: formatTitle, title"></span><div class="close-popup" data-popupevent="listen:touchstart, close"></div></div><div class="cd-picarea"><div class="cardpicture" data-carddetails="bind:setPic, picture_file"></div><div class="cardinfo"><p><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit">Picture credits</span><br/><span class="cd-sourcelbl" data-label="bind:innerHTML, source">Source : </span><span class="cd-info" data-carddetails="bind: setSources, sources"></span></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, dyknow"></span><p class = "dyknow" data-carddetails="bind:innerHTML,didYouKnow"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>',c='<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark story"> <div class="storytitlelbl" data-label="bind:innerHTML, storytitlelbl"></div><div class="storytitle"><span data-label="bind:innerHTML, cdtitlelbl"></span> <span data-carddetails="bind: formatTitle, title"></span></div><div class="close-popup" data-popupevent="listen:touchstart, close"></div></div><div class="cd-contentarea story"><span class="contentTitle" data-label="bind: innerHTML, scenariodesclbl"></span><p class = "dyknow" data-carddetails="bind:innerHTML,story"></p><span class="contentTitle" data-label="bind: innerHTML, soldesclbl"></span><p class = "dyknow" data-carddetails="bind:innerHTML,solution"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>';this.plugins.addAll({label:new t(o),carddetails:new t(s,{setPosition:function(e){e&&this.setAttribute("style","left:"+e.x+"px; top:"+e.y+"px;")},setCaret:function(e){var t,n=s.get("position").y;n>340?t=240:t=60,e?this.setAttribute("style","display: inline-block; margin-top:"+t+"px;"):this.setAttribute("style","display: none;")},setPic:function(e){var t,n=this;e?e.search("img/decks")>-1?this.setAttribute("style","background-image:url('"+e+"');"):(t={dir:"cards",filename:e},r.get("transport").request("GetFile",t,function(e){n.setAttribute("style","background:white; background-image: url('"+e+"');")})):this.setAttribute("style","background-image: none;")},setSources:function(e){e&&e.length?e instanceof Array?this.innerHTML=e.join(", "):this.innerHTML=e:this.innerHTML=""},formatTitle:function(e){e&&(this.innerHTML=e.toUpperCase())},formatName:function(e){e&&(this.innerHTML=e.substring(0,1).toUpperCase()+e.substring(1).toLowerCase()+"  "+s.get("lastname").toUpperCase())},setFamily:function(e){var t=e.couple,n=e.children,r,i;t===0?r=o.get("singlelbl"):t===1?r=o.get("marriedlbl"):t===2?r=o.get("divorcedlbl"):t===3&&(r=o.get("widowlbl")),n===0?i="":(s.get("age")<20?n===1?i=n+o.get("onesiblinglbl"):i=n+o.get("siblingslbl"):n===1?i=n+o.get("onechildlbl"):i=n+o.get("childrenlbl"),i=", "+i),this.innerHTML=r+i},setLeisure:function(e){var t="<ul>",n;if(e&&e.length){for(n=0;n<e.length;n++)e[n].comment?t+="<li>"+e[n].name+" ("+e[n].comment+")</li>":t+="<li>"+e[n].name+"</li>";this.innerHTML=t+"</ul>"}else this.innerHTML=""},setInterests:function(e){var t="<ul>",n;if(e&&e.length){for(n=0;n<e.length;n++)e[n].comment?t+="<li>"+e[n].name+" ("+e[n].comment+")</li>":t+="<li>"+e[n].name+"</li>";this.innerHTML=t+"</ul>"}else this.innerHTML=""},setComments:function(e){var t="<ul>",n;if(e&&e.length){for(n=0;n<e.length;n++)t+="<li>"+e[n]+"</li>";this.innerHTML=t+"</ul>"}else this.innerHTML=""}}),popupevent:new n(this)}),this.close=function(t,n){u.classList.add("invisible"),e()},this.reset=function(t,n,r,i){u=i,this.template="",typeof t=="string"?s.reset(JSON.parse(t)):s.reset(t),s.set("position",n),r==="left"?s.set("caret",{left:!0,right:!1}):s.set("caret",{left:!1,right:!0}),s.get("type")===1?this.template=f:s.get("type")===5?this.template=c:this.template=l,this.render(),this.place(u),u.classList.remove("invisible")}}return function(n){return s.prototype=new e,new s(n)}});