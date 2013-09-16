/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","service/config","Store","service/utils","./leaderboard","./editprofile","Promise"],function(e,t,n,r,s,o,u,a,f,c){return function(){var p=new e,d=s.get("user"),v=d.get("ip"),m=s.get("labels"),g=new o({total:0,ideas:0,sessions:0,contacts:0,twoQ:0}),y=new o({status:""}),b=new o({view:"info",completion:0,socialnw:0}),w=new o(d.get("news")),E,S,x=new o([]),T=new o;return p.plugins.addAll({label:new n(m),stats:new n(b,{setViewLbl:function(e){this.innerHTML=m.get(e)},toggleInformation:function(e){e==="info"?this.classList.remove("invisible"):this.classList.add("invisible")},toggleLeaderboard:function(e){e==="leaderboard"?this.classList.remove("invisible"):this.classList.add("invisible")},setPercentage:function(e){this.innerHTML=m.get("completionprefix")+e+m.get("completionsuffix")},setProgress:function(e){e===100?this.setAttribute("style","width:100%;border-top-right-radius:5px;border-bottom-right-radius:5px;"):this.setAttribute("style","width:"+e+"%;")},showDetails:function(e){e===100?this.classList.add("invisible"):this.classList.remove("invisible")},showSocialNW:function(e){e?this.classList.remove("invisible"):this.classList.add("invisible")}}),grades:new n(x,{showBadge:function(e){this.setAttribute("style","background: url('img/profile/"+e+"') no-repeat center center; background-size: cover;")}}),achievements:new n(T,{showBadge:function(e){this.setAttribute("style","background: url('img/profile/"+e+"') no-repeat center center; background-size: cover;")}}),progressbar:new n(g,{setWidth:function(e){this.setAttribute("style","width:"+e+"%;")}}),progress:new n(y),config:new n(s,{setAvatar:function(e){this.setAttribute("style","background: url('"+e+"') no-repeat center center;background-size:cover;")}}),user:new n(d,{setLocation:function(e){e.country?this.innerHTML=e.country.toUpperCase():this.innerHTML=m.get("completeprofile"),e.city&&e.country&&(this.innerHTML=e.city+", "+e.country.toUpperCase()),e.city&&e.state&&e.country&&(this.innerHTML=e.city+", "+e.state.toUpperCase()+" "+e.country.toUpperCase())},setAge:function(e){var t=new Date,n,r;e&&e.length===3?(n=new Date(e[0],e[1],e[2]),r=t.getTime()-n.getTime(),this.innerHTML=Math.floor(r/1e3/3600/24/365)+" "+m.get("agelbl")):this.innerHTML=m.get("completeprofile")},setFamily:function(e){var t=e.couple,n=e.children,r,i;t===null?r=m.get("completeprofile"):t===0?r=m.get("singlelbl"):t===1?r=m.get("marriedlbl"):t===2?r=m.get("divorcedlbl"):t===3&&(r=m.get("widowlbl")),!n||n===0?i="":(d.get("age")<20?n===1?i=n+m.get("onesiblinglbl"):i=n+m.get("siblingslbl"):n===1?i=n+m.get("onechildlbl"):i=n+m.get("childrenlbl"),i=", "+i),this.innerHTML=r+i},setOccupation:function(e){e.situation===4?this.innerHTML=m.get("stayathome"):e.situation===3?this.innerHTML=m.get("unemployed"):e.situation===0?e.organization?this.innerHTML=m.get("student")+" @ "+e.organization:this.innerHTML=m.get("student"):e.situation===2?e.job?this.innerHTML=e.job+" ("+m.get("retired")+")":this.innerHTML=m.get("retired"):e.situation===1?!e.job&&!e.organization?this.innerHTML=m.get("active"):e.job&&!e.organization?this.innerHTML=e.job:!e.job&&e.organization?this.innerHTML=m.get("active")+" @ "+e.organization:this.innerHTML=e.job+" @ "+e.organization:this.innerHTML=m.get("completeprofile")},showLeisure:function(e){e[0].name||e[1].name||e[2].name?this.classList.remove("invisible"):this.classList.add("invisible")},setLeisure:function(e){var t="<ul>";if(e&&e.length){for(i=0;i<e.length;i++)e[i].comment?t+="<li>"+e[i].name+" ("+e[i].comment+")</li>":t+="<li>"+e[i].name+"</li>";this.innerHTML=t+"</ul>"}else this.innerHTML=""},showInterests:function(e){e[0].name||e[1].name||e[2].name?this.classList.remove("invisible"):this.classList.add("invisible")},setInterests:function(e){var t="<ul>";if(e&&e.length){for(i=0;i<e.length;i++)e[i].comment?t+="<li>"+e[i].name+" ("+e[i].comment+")</li>":t+="<li>"+e[i].name+"</li>";this.innerHTML=t+"</ul>"}else this.innerHTML=""},showSN:function(e){e?this.innerHTML=e:this.innerHTML=""},setSessionCount:function(e){var t=d.get("su_sessions_count")||0,n=d.get("mu_sessions_count")||0;this.innerHTML=t+n},setContactCount:function(e){var t=0;for(i=0,l=e.length;i<l;i++)e[i].type==="user"&&t++;this.innerHTML=t},setBarLength:function(e){e>=3e5?this.setAttribute("style","width: 100%"):e>=3e4?this.setAttribute("style","width: 75%"):e>=3e3?this.setAttribute("style","width: 50%"):this.setAttribute("style","width: 25%")}}),news:new n(w,{setType:function(e){e.search("CX")>-1?this.setAttribute("style","background: url('img/profileDisable.png') no-repeat center center; background-size: contain;"):e.search("RWD")>-1||e.search("RANK")>-1?this.setAttribute("style","background: url('img/brainstorm/yourScore40.png') no-repeat center center; background-size: 40px;"):e.search("ID")>-1?this.setAttribute("style","background: url('img/libraryIdeaDisabled40.png') no-repeat center center; background-size: 40px;"):e.search("2Q")>-1?this.setAttribute("style","background: url('img/2questionDisable50.png') no-repeat center center; background-size: 40px;"):e.search("2CTS")>-1&&this.setAttribute("style","background: url('img/2centDisable.png') no-repeat center center; background-size: 40px;")},setContent:function(e){var t=this.getAttribute("data-news_id");switch(w.get(t).type){case"CX+":this.innerHTML="<span class='newsinfo'>"+w.get(t).content.username+"</span>"+m.get("isnowacontact");break;case"CX-":this.innerHTML="<span class='newsinfo'>"+w.get(t).content.username+"</span>"+m.get("isnolongeracontact");break;case"IDEA+":this.innerHTML=m.get("enterednewidea")+"<span class='newsinfo'>"+w.get(t).content.title+"</span>";break;case"SHID":this.innerHTML=m.get("sharedanidea")+"("+"<span class='newsinfo'>"+w.get(t).content.title+"</span>)";break;case"RANK":this.innerHTML=m.get("reachedrank")+"<span class='newsinfo'>"+w.get(t).content.label+"</span>";break;case"RWD":this.innerHTML=m.get("gotaward")+"<span class='newsinfo'>"+w.get(t).content.label+"</span>";break;case"2Q+":this.innerHTML=m.get("posted2q")+"<span class='newsinfo'>"+w.get(t).content.question+"</span>";break;case"2CTS":this.innerHTML=m.get("commentedon")+"<span class='newsinfo'>"+w.get(t).content.title+"</span>"+m.get("by")+w.get("id").content.username}},formatDate:function(e){this.innerHTML=u.formatDate(e)}}),profileevent:new r(p)}),p.template='<div id="dashboard-profile"><div class="header blue-dark"><span data-label="bind:innerHTML, profilelbl"></span></div><input class="infoslider" type="range" min="0" max="1" value ="0" data-profileevent="listen:touchend, switchLeaderboard"><span class="slidertext" data-stats="bind:setViewLbl, view"></span><div id="profile-content" data-stats="bind:toggleInformation, view"><div class="leftprofile"><div class="userdetails"><div class="editbtn" data-profileevent="listen:touchstart, edit"></div><div class="cd-picarea"><div class="cardpicture" data-config="bind:setAvatar, avatar"></div><div class="cardinfo"><h2 data-user="bind:innerHTML,username"></h2><blockquote data-user="bind:innerHTML, intro"></blockquote><p><span class="cd-agelbl"></span><span data-user="bind:setAge, birthdate"></span></p><p><span class="cd-locationlbl"></span><span class="cd-info" data-user="bind: setLocation, address"></span></p><p><span class="cd-joblbl"></span><span class="cd-info" data-user="bind: setOccupation, occupation"></span></p><p><span class="cd-familylbl"></span><span class="cd-info" data-user="bind: setFamily, family"></span></p></div></div><div class="cd-contentarea"><div data-user="bind:showLeisure, leisure_activities"><span class="contentTitle" data-label="bind: innerHTML, hobbieslbl"></span><p class = "userinfo" data-user="bind:setLeisure, leisure_activities"></p></div><div data-user="bind:showInterests, interests"><span class="contentTitle" data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "userinfo" data-user="bind: setInterests, interests"></p></div><div data-stats="bind:showSocialNW, socialnw"><span class="contentTitle" data-label="bind: innerHTML, socialnwlbl"></span><p class = "userinfo fb" data-user="bind:showSN, facebook"></p><p class = "userinfo gp" data-user="bind:showSN, gplus; bind:innerHTML"></p><p class = "userinfo tw" data-user="bind:showSN, twitter"></p><p class = "userinfo lin" data-user="bind:showSN, linkedin"></p></div></div><div><legend data-stats="bind: setPercentage, completion"></legend><div class="completionbar"><div class="innerbar" data-stats = "bind:setProgress, completion"></div></div></div></div><div class="edituserdetails invisible"></div><div class="mystats"><legend data-label="bind:innerHTML, mystatslbl"></legend><div class="completionbar"><ul data-user="bind: setBarLength, ip"><li class="innerbar myids" data-progressbar="bind: setWidth, ideas"></li><li class="innerbar myss" data-progressbar="bind:setWidth, sessions"></li><li class="innerbar myctcts" data-progressbar="bind: setWidth, contacts"></li><li class="innerbar my2q" data-progressbar="bind:setWidth, twoQ"></li></ul></div><table><tr class ="myids"><th data-label="bind:innerHTML, ideaslbl"></th><td data-user="bind: innerHTML, ideas_count"></td></tr><tr class ="myss"><th data-label="bind:innerHTML, sessionslbl"></th><td data-user="bind: setSessionCount, ip"></td></tr><tr class="myctcts"><th data-label="bind:innerHTML, contactslbl"></th><td data-user="bind: setContactCount, connections"></td></tr><tr class="my2q"><th data-label="bind:innerHTML, toquestionslbl"></th><td data-user="bind: innerHTML, twoquestions_count"></td></tr></table></div><div class="recentactivity"><legend data-label="bind:innerHTML, recentactivitylbl"></legend><ul data-news="foreach"><li><div class="newstype" data-news="bind:setType, type"></div><div class="newsdate" data-news="bind:formatDate, date"></div><p class="newstext" data-news="bind:setContent, content"></p></li></ul></div></div><div class = "rightprofile"><div class="userscore"><span class="ip" data-user="bind:innerHTML, ip"></span><span data-label="bind:innerHTML, ideafypoints"></span></div><div class="userachievements"><h2 class="grade" data-stats="bind:innerHTML, title"></h2><ul class="badges" data-grades="foreach"><li class="badge"><div data-grades="bind:showBadge, badge"></div><legend data-grades="bind:innerHTML, title"></legend></li></ul><ul class="badges" data-achievements="foreach"><li class="badge"><div data-achievements="bind:showBadge, badge"></div><legend data-achievements="bind:innerHTML, label"></legend></li></ul></div></div></div><div id="leaderboard" data-stats="bind:toggleLeaderboard, view"></div></div>',p.place(t.get("dashboard-profile")),p.switchLeaderboard=function(e,t){var n=document.getElementById("leaderboard"),r=document.getElementById("profile-content");E||(E=new a,E.init(n)),t.value==1?(t.setAttribute("style","background: #5F8F28;"),b.set("view","leaderboard")):(t.setAttribute("style","background: #9AC9CD;"),b.set("view","info"))},p.edit=function(e,t){var n=document.querySelector(".edituserdetails");document.querySelector(".userdetails").classList.add("invisible"),S?S.reset():(S=new f,S.init(n)),n.classList.remove("invisible")},s.get("observer").watch("profile-updated",function(e){p.checkProfileCompletion().then(function(){p.updateGrade(),p.updateAchievements()})}),d.watchValue("ip",function(){p.updateGrade(),p.updateProgressBar()}),d.watchValue("tutorial_complete",function(){p.updateGrade(),p.updateAchievements()}),d.watchValue("settings",function(){p.updateGrade(),p.updateAchievements()}),d.watchValue("news",function(){w.reset(d.get("news"))}),d.watchValue("lang",function(){p.updateGrade().then(function(){p.updateAchievements()}),w.reset([]),w.reset(d.get("news"))}),p.checkProfileCompletion=function(){var e=u.checkProfileCompletion(),t=new c;return b.set("completion",e.percentage),b.set("missing",e.missing),e.missing.indexOf(m.get("entersocialnw"))<0&&b.set("socialnw",1),e.percentage===100&&d.get("profile_complete")!==!0?(d.set("profile_complete",!0),d.upload().then(function(){t.fulfill()})):e.percentage<100&&d.get("profile_complete")?(d.set("profile_complete",!1),d.upload().then(function(){t.fulfill()})):t.fulfill(),t},p.updateGrade=function(){var t=new c;return u.getGrade(d.get("ip"),function(e){var n;e.distinction?n=[e.grade,e.distinction]:n=[e.grade],x.reset(n),b.set("title",e.grade.label),t.fulfill()}),t},p.updateAchievements=function(){var t=new c;return u.getAchievements(d.get("_id"),function(e){e.length?T.reset(e):T.reset(d.get("achievements")),t.fulfill()}),t},p.updateProgressBar=function(){var t,n,r,i,s,o,u,a,f;n=d.get("ideas_count"),i=d.get("su_sessions_count")||0,s=d.get("mu_sessions_count")||0,r=i+s,u=d.get("twoquestions_count")||0,o=0;for(a=0,f=d.get("connections").length;a<f;a++)d.get("connections")[a].type==="user"&&o++;t=n+u+o+r,g.set("total",t),g.set("ideas",Math.floor(n/t*100)),g.set("contacts",Math.floor(o/t*100)),g.set("sessions",Math.floor(r/t*100)),g.set("twoQ",Math.floor(u/t*100))},p.cleanOldNews=function(){var t=new Date,n=d.get("news"),r,i,s=new c;if(n.length){for(r=n.length-1;r>=0;r--)i=new Date(n[r].date[0],n[r].date[1],n[r].date[2]),t.getTime()-i.getTime()>1296e6&&n.splice(r,1);d.set("news",n),d.upload().then(function(){s.fulfill()})}return s},p.init=function(){p.checkProfileCompletion().then(function(){return p.updateGrade()}).then(function(){return p.updateAchievements()}).then(function(){p.updateProgressBar(),p.cleanOldNews()})},p.reset=function(){w.reset([]),w.reset(d.get("news")),p.init()},p.init(),p}});