/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Event.plugin","CouchDBView","service/utils","service/avatar"],function(e,t,n,r,i,s,o){return function(){var a=new e,f=new i([]);return a.template='<div><ul data-leaders="foreach"><li class="leader" data-leaders="bind:setSpotLight, value.userid"><div data-leaders="bind:setAvatar, value.userid"></div><div class="username" data-leaders="bind:innerHTML, value.username"></div><div class="distinction" data-leaders="bind:setDistinction, value.ip"></div><div class="grade" data-leaders="bind:setGrade, value.ip"></div><div class="score" data-leaders="bind: setScore, value.ip"></div></li></ul></div>',a.plugins.addAll({leaders:new n(f,{setSpotLight:function(e){e===t.get("user").get("_id")?(this.classList.add("userleader"),this.scrollIntoView(!1)):this.classList.remove("userleader")},setAvatar:function(e){var t,n;e&&(n=document.createDocumentFragment(),t=new o([e]),t.place(n),this.hasChildNodes()?this.replaceChild(n,this.firstChild):this.appendChild(n))},setGrade:function(e){var t=this;s.getGrade(e,function(e){t.setAttribute("style","background: url('img/profile/"+e.grade.badge+"') no-repeat center center; background-size: 40px 40px;")})},setDistinction:function(e){var t=this;s.getGrade(e,function(e){e.distinction&&t.setAttribute("style","background: url('img/profile/"+e.distinction.badge+"') no-repeat center center; background-size: 40px 40px;")})},setScore:function(e){this.innerHTML=e+" ip"}}),leaderevent:new r(a)}),a.init=function(n){f.setTransport(t.get("transport")),f.sync(t.get("db"),"users","_view/leaderboard",{limit:100,descending:!0}).then(function(){a.place(n)})},t.get("observer").watch("reconnect",function(){f.unsync(),f.reset([]),f.sync(t.get("db"),"users","_view/leaderboard",{limit:100,descending:!0})}),a}});