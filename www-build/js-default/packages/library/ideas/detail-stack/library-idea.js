/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Store","Bind.plugin","Event.plugin","service/map","service/utils","service/avatar","service/config","twocents/writetwocent","twocents/twocentlist","Observable","Promise","CouchDBDocument","Place.plugin"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p){return function(v){var m=new e,g=new f("library"),y=new a("library"),b=u.get("labels"),w=new t([{active:!1},{active:!1},{active:!1},{active:!1},{active:!1}]),E=!1,S=u.get("user"),x=u.get("transport"),T=new h,N=new t([]),C=i.get("ideas-detail"),k=i.get("library-writetwocents"),L=new l;return T.setTransport(x),m.plugins.addAll({label:new n(b),ideadetail:new n(T,{toggleRateEdit:function(e){e.indexOf(S.get("_id"))>-1?this.setAttribute("href","#library-edit"):this.setAttribute("href","#library-favorites")},toggleTwocentShare:function(e){e.indexOf(S.get("_id"))>-1?this.setAttribute("href","#library-share"):this.setAttribute("href","#library-2cents")},displayWriteTwocent:function(e){e.indexOf(S.get("_id"))<0?this.classList.remove("invisible"):this.classList.add("invisible")},displayTwocentList:function(e){e&&e.length&&document.getElementById("library-writetwocents").classList.add("invisible")},date:function A(A){A&&(this.innerHTML=s.formatDate(A))},setAuthor:function(e){e===S.get("username")&&T.get("authors").indexOf(S.get("_id"))>-1?this.innerHTML=b.get("youlbl"):this.innerHTML=e},setWrotelbl:function(e){e.length===1&&e[0]===S.get("_id")?this.innerHTML=b.get("youwrotelbl"):e.length>1?this.innerHTML=b.get("theywrotelbl"):this.innerHTML=b.get("ideawrotelbl")},setAvatar:function(t){var n=document.createDocumentFragment(),r=new o(t);r.place(n),this.hasChildNodes()?this.replaceChild(n,this.firstChild):this.appendChild(n)},hideRating:function(e){e.search("I:WELCOME")>-1?this.classList.add("invisible"):this.classList.remove("invisible")},setRating:function(t){t.length===0?this.innerHTML="":this.innerHTML=Math.round(t.reduce(function(e,t){return e+t})/t.length*100)/100},setDescription:function(t){this.innerHTML=t.replace(/\n/g,"<br>")},setSolution:function(t){this.innerHTML=t.replace(/\n/g,"<br>")},toggleVoteButton:function(e){var t=T.get("_id"),n=T.get("authors");document.getElementById("ratingPopup").classList.remove("appear"),S.get("rated_ideas").indexOf(t)<0&&n.indexOf(S.get("_id"))<0&&!E?(this.setAttribute("name","vote"),this.innerHTML=b.get("votebuttonlbl"),this.classList.remove("votes"),this.classList.add("publicButton")):(E=!0,this.classList.remove("publicButton"),this.setAttribute("name","voted"),e.length===0?this.innerHTML="("+b.get("novotesyet")+")":e.length===1?this.innerHTML="("+b.get("onevote")+")":this.innerHTML="("+e.length+" "+b.get("votes")+")",this.classList.add("votes"))},setSharedWith:function(e){T.get("_id").search("I:WELCOME")<0&&e&&e.length?(this.classList.remove("invisible"),e.length===1?this.innerHTML=b.get("sharedwith")+"<b><u>"+1+b.get("ideafyer")+"</u></b>":this.innerHTML=b.get("sharedwith")+"<b><u>"+e.length+b.get("ideafyer")+"</u></b>"):this.classList.add("invisible")}}),share:new n(N),vote:new n(w,{setIcon:function(e){var t="background: url('img/public/activeIdeaVote.png') no-repeat center center;",n="background: url('img/public/rateForList.png') no-repeat center center;";e?this.setAttribute("style",t):this.setAttribute("style",n)}}),place:new p({LibraryTwocentUI:g}),ideadetailevent:new r(m)}),m.template='<div class="library-idea"><div class="header blue-dark"><a href="#library-2cents" data-ideadetail="bind: toggleTwocentShare, authors" data-ideadetailevent="listen: mousedown, action" class="option left"></a><span data-label="bind: innerHTML, ideadetailsheadertitle"></span><a href="#library-favorites" data-ideadetail="bind: toggleRateEdit, authors" data-ideadetailevent="listen: mousedown, action" class="option right"></a></div><div id="idea-cache" class="invisible"></div><div class = "detail-contents"><div class="detail-header"><div class="avatar" data-ideadetail="bind:setAvatar, authors"></div><h2 data-ideadetail="bind:innerHTML,title"></h2><span class="date" data-ideadetail="bind:date, creation_date"></span><br><span class="author" data-ideadetail="bind:setAuthor,authornames"></span><span class="commentlbl" data-ideadetail="bind: setWrotelbl, authors"></span></div><div class="detail-body"><p data-ideadetail="bind:setDescription,description"></p><p data-ideadetail="bind:setSolution,solution"></p></div><div class="detail-footer"><div class="sharedwith invisible" data-ideadetail="bind: setSharedWith, sharedwith" data-ideadetailevent="listen:mousedown, displayList"></div><div id="sharelist" class="autocontact invisible"><div class="autoclose" data-ideadetailevent="listen:mousedown,close"></div><ul data-share="foreach"><li data-share="bind:innerHTML, value.username"></li></ul></div><div class ="rateIdea" data-ideadetail="bind:hideRating, id"><a class="item-acorn"></a><div class="rating" data-ideadetail="bind:setRating,votes"></div><div class="publicButton" data-ideadetail="bind: toggleVoteButton, votes" name="vote" data-ideadetailevent="listen: mousedown, press; listen: mouseup, vote;" data-label="bind: innerHTML, votebuttonlbl"></div><div id="ratingPopup" class="popup"><ul class="acorns" data-vote="foreach"><li class="item-acorn" data-vote="bind: setIcon, active" data-ideadetailevent="listen: mousedown, previewVote; listen: mouseup, castVote"></li></ul></div></div></div></div><div id="library-writetwocents" class="invisible" data-ideadetail="bind: displayWriteTwocent, authors"></div><div id="library-twocents" class="twocents" data-ideadetail="bind: displayTwocentList, twocents" data-place="place: LibraryTwocentUI"></div></div>',m.showCache=function(){m.dom.querySelector("#idea-cache").classList.remove("invisible")},m.hideCache=function(){m.dom.querySelector("#idea-cache").classList.add("invisible")},m.reset=function(t,n){var r=t.get(n).id,i=new c;return w.reset([{active:!1},{active:!1},{active:!1},{active:!1},{active:!1}]),m.getIdea(r).then(function(){E=!1,y.reset(T.get("_id")),g.reset(T.get("_id")),k=document.getElementById("library-writetwocents"),y.place(k),i.fulfill()}),i},m.getIdea=function(t){return T.unsync(),T.reset(),T.sync(u.get("db"),t)},m.action=function(e,t){var n=t.getAttribute("href");n==="#library-2cents"?(y.reset(T.get("_id")),k.classList.remove("invisible")):v(n)},m.edit=function(){_stack.getStack().show("#public-edit")},m.press=function(e,t){t.classList.add("pressed")},m.vote=function(e,t){E||document.getElementById("ratingPopup").classList.add("appear"),t.classList.remove("pressed")},m.previewVote=function(e,t){var n=0,r=t.getAttribute("data-vote_id");w.loop(function(e,t){t<=r?w.update(t,"active",!0):w.update(t,"active",!1)})},m.castVote=function(e,t){var n=parseInt(t.getAttribute("data-vote_id"))+1,r=T.get("_id"),i={id:r,vote:n,voter:S.get("_id")};E||(E=!0,x.request("Vote",i,function(e){var t=S.get("rated_ideas")||[];e!=="ok"?(console.log(e,"something went wrong, please try again later"),E=!1):(t.unshift(r),S.set("rated_ideas",t),alert(u.get("labels").get("thankyou")),document.getElementById("ratingPopup").classList.remove("appear"),w.reset([{active:!1},{active:!1},{active:!1},{active:!1},{active:!1}]))}))},m.close=function(t,n){n.parentNode.classList.add("invisible")},m.displayList=function(e,t){x.request("GetUserNames",{list:T.get("sharedwith")},function(e){N.reset(e),document.getElementById("sharelist").classList.remove("invisible")})},m.place(C),m}});