/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","Olives/Model-plugin","Olives/Event-plugin","service/config","Store"],function(e,t,n,r,s){function o(e){var o=new s,u=r.get("labels"),a,f={x:0,y:0},l='<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark"> <span data-carddetails="bind: formatName, firstname"></span><div class="close-popup" data-popupevent="listen:mousedown, close"></div></div><div class="cd-picarea"><div class="cardpicture" data-carddetails="bind:setPic, picture_file"></div><div class="cardinfo"><p><span class="cd-agelbl"></span><span data-carddetails="bind:innerHTML, age">age</span><span class="agesuffix" data-label="bind:innerHTML, agelbl"></span><br/><span class="cd-locationlbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, location"></span><br/><span class="cd-joblbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, occupation.description"></span><br/><span class="cd-familylbl"></span><span class="cd-info" data-carddetails="bind: setFamily, family"></span><br/><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit"></span></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, hobbieslbl">Hobbies</span><p class = "dyknow" data-carddetails="bind:setLeisure, leisure_activities">hobbies</p><span class="contentTitle" data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "dyknow" data-carddetails="bind: setInterests, interests">Centers of interest</p><span class="contentTitle" data-label="bind: innerHTML, commentslbl">Comments</span><p class = "dyknow" data-carddetails="bind:setComments, comments">Comments</p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>',c='<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark"> <span data-carddetails="bind: formatTitle, title"></span><div class="close-popup" data-popupevent="listen:mousedown, close"></div></div><div class="cd-picarea"><div class="cardpicture" data-carddetails="bind:setPic, picture_file"></div><div class="cardinfo"><p><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit">Picture credits</span><br/><span class="cd-sourcelbl" data-label="bind:innerHTML, source">Source : </span><span class="cd-info" data-carddetails="bind: innerHTML, sources"></span></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, dyknow"></span><p class = "dyknow" data-carddetails="bind:innerHTML,didYouKnow"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>',h='<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark story"> <div class="storytitlelbl" data-label="bind:innerHTML, storytitlelbl"></div><div class="storytitle"><span data-label="bind:innerHTML, cdtitlelbl"></span> <span data-carddetails="bind: formatTitle, title"></span></div><div class="close-popup" data-popupevent="listen:mousedown, close"></div></div><div class="cd-contentarea story"><span class="contentTitle" data-label="bind: innerHTML, scenariodesclbl"></span><p class = "dyknow" data-carddetails="bind:innerHTML,story"></p><span class="contentTitle" data-label="bind: innerHTML, soldesclbl"></span><p class = "dyknow" data-carddetails="bind:innerHTML,solution"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>';this.plugins.addAll({label:new t(u),carddetails:new t(o,{setPosition:function(e){e&&this.setAttribute("style","left:"+e.x+"px; top:"+e.y+"px;")},setCaret:function(e){var t,n=o.get("position").y;n>340?t=240:t=60,e?this.setAttribute("style","display: inline-block; margin-top:"+t+"px;"):this.setAttribute("style","display: none;")},setPic:function(e){e?this.setAttribute("style","background-image:url('"+e+"');"):this.setAttribute("style","background-image: none;")},formatTitle:function(e){e&&(this.innerHTML=e.toUpperCase())},formatName:function(e){e&&(this.innerHTML=e.substring(0,1).toUpperCase()+e.substring(1).toLowerCase()+"  "+o.get("lastname").toUpperCase())},setFamily:function(e){var t=e.couple,n=e.children,r,i;t===0?r=u.get("singlelbl"):t===1?r=u.get("marriedlbl"):t===2?r=u.get("divorcedlbl"):t===3&&(r=u.get("widowlbl")),n===0?i="":(o.get("age")<20?n===1?i=n+u.get("onesiblinglbl"):i=n+u.get("siblingslbl"):n===1?i=n+u.get("onechildlbl"):i=n+u.get("childrenlbl"),i=", "+i),this.innerHTML=r+i},setLeisure:function(e){var t="<ul>";if(e&&e.length){for(i=0;i<e.length;i++)t+="<li>"+e[i].name+" ("+e[i].comment+")</li>";this.innerHTML=t+"</ul>"}else this.innerHTML=""},setInterests:function(e){var t="<ul>";if(e&&e.length){for(i=0;i<e.length;i++)t+="<li>"+e[i].name+" ("+e[i].comment+")</li>";this.innerHTML=t+"</ul>"}else this.innerHTML=""},setComments:function(e){var t="<ul>";if(e&&e.length){for(i=0;i<e.length;i++)t+="<li>"+e[i]+")</li>";this.innerHTML=t+"</ul>"}else this.innerHTML=""}}),popupevent:new n(this)}),this.close=function(t,n){a.classList.add("invisible"),e()},this.reset=function(t,n,r,i){a=i,this.template="",typeof t=="string"?o.reset(JSON.parse(t)):o.reset(t),o.set("position",n),r==="left"?o.set("caret",{left:!0,right:!1}):o.set("caret",{left:!1,right:!0}),o.get("type")===1?this.template=l:o.get("type")===5?this.template=h:this.template=c,this.render(),this.place(a),a.classList.remove("invisible")}}return function(n){return o.prototype=new e,new o(n)}});