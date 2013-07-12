/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["service/config","Observable","Promise","Olives/LocalStore"],function(e,t,n,r){return{formatDate:function(e){var t=e[1]+1;return t<10&&(t="0"+t),e[2]+"/"+t+"/"+e[0]},formatDuration:function(e){var t=Math.round(e/1e3),n=Math.floor(t/86400),r=Math.floor(t%86400/3600),i=Math.floor(t%86400%3600/60),s=Math.floor(t%86400%3600%60),o;return n>0?o=n+"d ":o="",r>0?o+=r+":":o+="",i>0?o+=(r>0&&i<10?"0":"")+i+":":o+="0:",s<10?o+="0"+s:o+=s,o},displayFirstSentence:function(e,t){var n=[];n=t.split("."[0],1);if(!(n[0].length>140))return e.innerHTML;e.innerHTML=n[0].substr(0,139).replace(/\w*\s(\S)*$/," ..."),e.innerHTML=n[0]+"..."},truncate:function(e,t){e.innerHTML=t;while(e.scrollHeight>e.offsetHeight){var n=e.innerHTML;e.innerHTML=n.replace(/\W*\s(\S)*$/,"...")}return e.innerHTML},setRating:function(e,t){var n="<img src = 'img/wall/disableIdeaVote.png'>",r="<img src = 'img/wall/semi-activeIdeaVote.png'>",i="<img src = 'img/wall/activeIdeaVote.png'>",s="";if(!t)for(o=0;o<5;o++)s+=n;else{var o=0;while(o<Math.floor(t))s+=i,o++;o<5&&(Math.round(t-Math.floor(t))?s+=r:s+=n,o++);while(o<5)s+=n,o++}e.innerHTML=s},searchArray:function(t,n){var r=n.toLowerCase().split(" "),s=[];for(i=0,l=t.length;i<l;i++){var o=JSON.stringify(t[i]).toLowerCase(),u=0;for(j=0;j<r.length;j++){if(!(o.search(r[j])>-1))break;u++}u===r.length&&s.push(t[i])}return s},sortByProperty:function s(e,t,n){switch(t){case"idea":e.sort(function(e,r){var i=e[t],o=r[t],u,a;return n?(!!i&&i instanceof Array&&!!i.length?(s(i,"title",!0),u=i[0].title):u="",!!o&&o instanceof Array&&!!o.length?(s(o,"title",!0),a=o[0].title):a="",u<a?1:u>a?-1:0):(!!i&&i instanceof Array&&!!i.length?(s(i,"title",!1),u=i[0].title):u="",!!o&&o instanceof Array&&!!o.length?(s(o,"title",!1),a=o[0].title):a="",u<a?-1:u>a?1:0)});break;case"date":e.sort(function(e,r){var i=e[t],s=r[t],o=new Date(i[0],i[1],i[2]),u=new Date(s[0],s[1],s[2]);return n?o<u?1:o>u?-1:0:o<u?-1:o>u?1:0});break;default:e.sort(function(e,r){var i=e[t],s=r[t];return typeof i=="string"||typeof s=="string"?(i&&i.toLowerCase&&(i=i.toLowerCase()),s&&s.toLowerCase&&(s=s.toLowerCase()),n?i<s?1:i>s?-1:0:i<s?-1:i>s?1:0):n?i<s?1:i>s?-1:0:i<s?-1:i>s?1:0})}},uploadFile:function(t,n,r,i){var s=new XMLHttpRequest;s.open("POST",e.get("location")+t),s.onreadystatechange=function(){s.readyState===4&&i&&i(s)},s.upload.onprogress=function(e){e.lengthComputable&&r.set("status",Math.round(e.loaded/e.total*100))},s.send(n)},checkServerStatus:function(){var t=new n,r=new XMLHttpRequest;return r.open("GET",e.get("location")),r.onreadystatechange=function(){r.readyState===4&&(r.status===200?t.resolve():t.reject())},r.send(),t},updateLabels:function(t){var i={lang:t},s=new r,o=e.get("labels"),u=new n;return s.sync("ideafy-data"),e.get("transport").request("Lang",i,function(t){t==="nok"?(s.set("labels",e.get("defaultLabels")),e.set("language","en-us")):(s.set("labels",t),e.set("language",t.language)),s.sync("ideafy-data"),o.reset(s.get("labels")),u.resolve()}),u},getAvatarById:function(t){var r=new n,i=e.get("avatars");if(t!==e.get("user").get("_id"))return e.get("transport").request("GetAvatar",{id:t},function(e){if(e.error)r.reject();else{if(i.getNbItems()<100)i.set(t,e);else{var n=i.toJSON(),s=n.keys();i.del(s[0]),i.set(t,e)}r.resolve()}}),r;e.get("transport").request("GetFile",{sid:"avatars",filename:t+"_@v@t@r"},function(t){e.set("avatar",t),r.resolve()})},getAvatarByFileName:function(t,n){e.get("transport").request("GetAvatar",{file:t},function(e){n(e)})},getGrade:function(t,n){var r=e.get("transport"),i=e.get("user");r.request("GetGrade",{ip:t,lang:i.get("lang")},function(e){n(e)})},getAchievements:function(t,n){var r=e.get("transport"),i=e.get("user");r.request("GetAchievements",{userid:t,lang:i.get("lang")},function(e){n(e)})},getUserDetails:function(t,n){var r=e.get("transport");r.request("GetUserDetails",{userid:t},function(e){n(e)})},checkProfileCompletion:function(){var t=e.get("user"),n=e.get("labels"),r={percentage:0,missing:[]};return t.get("firstname")&&t.get("lastname")&&(r.percentage+=10),t.get("birthdate").length===3?r.percentage+=10:r.missing.push(n.get("enterbirthdate")),t.get("family").couple!==null&&t.get("family").children!==null?r.percentage+=10:r.missing.push(n.get("enterfamily")),t.get("address").city&&t.get("address").country?r.percentage+=10:r.missing.push(n.get("enteraddress")),t.get("intro")&&t.get("intro")!=="Ideafyer"?r.percentage+=10:r.missing.push(n.get("enterintro")),t.get("occupation").situation>=0&&t.get("occupation").job&&t.get("occupation").organization?r.percentage+=10:r.missing.push(n.get("enteroccupation")),t.get("leisure_activities")[0].name&&t.get("leisure_activities")[1].name?r.percentage+=10:r.missing.push(n.get("enterleisure")),t.get("interests")[0].name&&t.get("interests")[1].name?r.percentage+=10:r.missing.push(n.get("enterinterest")),t.get("twitter")||t.get("facebook")||t.get("gplus")||t.get("linkedin")?r.percentage+=10:r.missing.push(n.get("entersocialnw")),t.get("picture_file").search("img/avatars/deedee")<0?r.percentage+=10:r.missing.push(n.get("enterownpic")),r},stringToBytes:function(e){var t,n,r=[],i,s=0,o;for(i=0;i<e.length;i++){t=e.charCodeAt(i);if(t<127)r[s++]=t&255;else{n=[];do n.unshift(t&255),t>>=8;while(t);for(o=0;o<n.length;o++)r[s++]=n[o]}}return r},changeStyle:function(e){var t=document.querySelector(".currentStyle"),n=t.getAttribute("href");n!=="css/"+e&&t.setAttribute("href","css/"+e)}}});