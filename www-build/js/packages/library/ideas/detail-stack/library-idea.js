/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","Store","Olives/Model-plugin","Olives/Event-plugin","service/map","service/utils","service/avatar","service/config","twocents/writetwocent","twocents/twocentlist","Observable"],function(e,t,n,r,i,s,o,u,a,f,l){return function(h){var p=new e,d=new f,v=new a("library"),m=u.get("labels"),g=new t([{active:!1},{active:!1},{active:!1},{active:!1},{active:!1}]),y=!1,b=u.get("user"),w=u.get("transport"),E=u.get("observer"),S=new t,x=new t([]),T=i.get("ideas-detail"),N=i.get("library-writetwocents"),C=new l;return p.plugins.addAll({label:new n(m),ideadetail:new n(S,{toggleRateEdit:function(e){e.indexOf(b.get("_id"))>-1?this.setAttribute("href","#library-edit"):this.setAttribute("href","#library-favorites")},toggleTwocentShare:function(e){e.indexOf(b.get("_id"))>-1?this.setAttribute("href","#library-share"):this.setAttribute("href","#library-2cents")},displayWriteTwocent:function(e){e.indexOf(b.get("_id"))<0?this.classList.remove("invisible"):this.classList.add("invisible")},displayTwocentList:function(e){e&&e.length&&document.getElementById("public-writetwocents").classList.add("invisible")},date:function k(k){k&&(this.innerHTML=s.formatDate(k))},setAuthor:function(e){e===b.get("username")&&S.get("doc").authors.indexOf(b.get("_id"))>-1?this.innerHTML=m.get("youlbl"):this.innerHTML=e},setWrotelbl:function(e){e.length===1&&e[0]===b.get("_id")?this.innerHTML=m.get("youwrotelbl"):e.length>1?this.innerHTML=m.get("theywrotelbl"):this.innerHTML=m.get("ideawrotelbl")},setAvatar:function(t){var n=document.createDocumentFragment(),r=new o(t);r.place(n),this.hasChildNodes()?this.replaceChild(n,this.firstChild):this.appendChild(n)},hideRating:function(e){e.search("I:WELCOME")>-1?this.classList.add("invisible"):this.classList.remove("invisible")},setRating:function(t){if(t===undefined){var n=S.get("doc").votes;n.length===0?this.innerHTML="":this.innerHTML=Math.round(n.reduce(function(e,t){return e+t})/n.length*100)/100}else this.innerHTML=Math.round(t*100)/100},toggleVoteButton:function(e){var t=S.get("id"),n=S.get("doc").authors;document.getElementById("ratingPopup").classList.remove("appear"),b.get("rated_ideas").indexOf(t)<0&&n.indexOf(b.get("_id"))<0&&!y?(this.setAttribute("name","vote"),this.innerHTML=m.get("votebuttonlbl"),this.classList.remove("votes"),this.classList.add("publicButton")):(y=!0,this.classList.remove("publicButton"),this.setAttribute("name","voted"),e.length===0?this.innerHTML="("+m.get("novotesyet")+")":e.length===1?this.innerHTML="("+m.get("onevote")+")":this.innerHTML="("+e.length+" "+m.get("votes")+")",this.classList.add("votes"))},setSharedWith:function(e){S.get("id").search("I:WELCOME")<0&&e&&e.length?(this.classList.remove("invisible"),e.length===1?this.innerHTML=m.get("sharedwith")+"<b><u>"+1+m.get("ideafyer")+"</u></b>":this.innerHTML=m.get("sharedwith")+"<b><u>"+e.length+m.get("ideafyer")+"</u></b>"):this.classList.add("invisible")}}),share:new n(x),vote:new n(g,{setIcon:function(e){var t="background: url('img/public/activeIdeaVote.png') no-repeat center center;",n="background: url('img/public/rateForList.png') no-repeat center center;";e?this.setAttribute("style",t):this.setAttribute("style",n)}}),ideadetailevent:new r(p)}),p.template='<div class="library-idea"><div class="header blue-dark"><a href="#library-2cents" data-ideadetail="bind: toggleTwocentShare, doc.authors" data-ideadetailevent="listen: mousedown, action" class="option left"></a><span data-label="bind: innerHTML, ideadetailsheadertitle"></span><a href="#library-favorites" data-ideadetail="bind: toggleRateEdit, doc.authors" data-ideadetailevent="listen: mousedown, action" class="option right"></a></div><div class = "detail-contents"><div class="detail-header"><div class="avatar" data-ideadetail="bind:setAvatar, doc.authors"></div><h2 data-ideadetail="bind:innerHTML,doc.title"></h2><span class="date" data-ideadetail="bind:date, doc.creation_date"></span><br><span class="author" data-ideadetail="bind:setAuthor,doc.authornames"></span><span class="commentlbl" data-ideadetail="bind: setWrotelbl, doc.authors"></span></div><div class="detail-body"><p data-ideadetail="bind:innerHTML,doc.description"></p><p data-ideadetail="bind:innerHTML,doc.solution"></p></div><div class="detail-footer"><div class="sharedwith invisible" data-ideadetail="bind: setSharedWith, doc.sharedwith" data-ideadetailevent="listen:mousedown, displayList"></div><div id="sharelist" class="autocontact invisible"><div class="autoclose" data-ideadetailevent="listen:mousedown,close"></div><ul data-share="foreach"><li data-share="bind:innerHTML, value.username"></li></ul></div><div class ="rateIdea" data-ideadetail="bind:hideRating, id"><a class="item-acorn"></a><div class="rating" data-ideadetail="bind:setRating,value.rating"></div><div class="publicButton" data-ideadetail="bind: toggleVoteButton, doc.votes" name="vote" data-ideadetailevent="listen: mousedown, press; listen: mouseup, vote;" data-label="bind: innerHTML, votebuttonlbl"></div><div id="ratingPopup" class="popup"><ul class="acorns" data-vote="foreach"><li class="item-acorn" data-vote="bind: setIcon, active" data-ideadetailevent="listen: mousedown, previewVote; listen: mouseup, castVote"></li></ul></div></div></div></div><div id="library-writetwocents" class="invisible" data-ideadetail="bind: displayWriteTwocent, doc.authors"></div><div id="library-twocents" class="twocents" data-ideadetail="bind: displayTwocentList, doc.twocents"></div></div>',p.reset=function(t,n){y=!1,S.reset(t.get(n)),v.reset(S.get("id")),d.reset(S.get("id"),"library"),N=document.getElementById("library-writetwocents"),v.place(N),t.watch("updated",function(e,t){e===parseInt(n)&&S.reset(t)})},p.action=function(e,t){var n=t.getAttribute("href");n==="#library-2cents"?(v.reset(S.get("id")),N.classList.remove("invisible")):h(n)},p.edit=function(){_stack.getStack().show("#public-edit")},p.press=function(e,t){t.classList.add("pressed")},p.vote=function(e,t){y||document.getElementById("ratingPopup").classList.add("appear"),t.classList.remove("pressed")},p.previewVote=function(e,t){var n=0,r=t.getAttribute("data-vote_id");g.loop(function(e,t){t<=r?g.update(t,"active",!0):g.update(t,"active",!1)})},p.castVote=function(e,t){var n=parseInt(t.getAttribute("data-vote_id"))+1,r=S.get("id"),i={id:r,vote:n,voter:b.get("_id")};y||(y=!0,w.request("Vote",i,function(e){e!="ok"?(console.log(e,"something went wrong, please try again later"),y=!1):(alert(u.get("labels").get("thankyou")),document.getElementById("ratingPopup").classList.remove("appear"),_node=T.querySelector("publicButton"),g.reset([{active:!1},{active:!1},{active:!1},{active:!1},{active:!1}]))}))},p.close=function(t,n){n.parentNode.classList.add("invisible")},p.displayList=function(e,t){w.request("GetUserNames",{list:S.get("doc").sharedwith},function(e){console.log(e),x.reset(e),document.getElementById("sharelist").classList.remove("invisible")})},p.place(T),p}});