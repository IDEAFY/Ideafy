/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Event.plugin","CouchDBBulkDocuments","CouchDBDocument","Store","service/cardpopup","Promise"],function(e,t,n,r,i,s,o,u,a){return function(l,c,h){var p=new e,d=new o([]),v=new o([]),m=new o({currentPage:0,nbPages:0}),g,y=t.get("labels"),b=t.get("user"),w=null,E=null;return p.plugins.addAll({pagination:new n(m,{setPage:function(e){var t=e+1;m.get("nbPages")>1?this.innerHTML=y.get("page")+t+" / "+m.get("nbPages"):this.innerHTML=""},setLeft:function(e){e>0?this.classList.remove("invisible"):this.classList.add("invisible")},setRight:function(e){e<m.get("nbPages")-1?this.classList.remove("invisible"):this.classList.add("invisible")}}),cards:new n(v,{formatTitle:function(e){e?(this.classList.remove("newcard"),l!=="techno"?this.innerHTML=e.substring(0,1).toUpperCase()+e.substring(1).toLowerCase():(this.innerHTML=e.toUpperCase(),this.setAttribute("style","font-family:Helvetica;"))):this.classList.add("newcard")},setPic:function(e){var n,r=this;if(e&&e.search("img/decks/")>-1)this.setAttribute("style","background-image:url('"+e+"');");else if(e)n={dir:"cards",filename:e},t.get("transport").request("GetFile",n,function(e){r.setAttribute("style","background:white; background-image: url('"+e+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;")});else switch(l){case"characters":this.classList.add("newchar");break;case"contexts":this.classList.add("newctx");break;case"problems":this.classList.add("newpb");break;case"techno":this.classList.add("newtech");break;default:this.setAttribute("style","background-image: none;")}}}),cardlistevent:new r(p)}),p.template='<div class="cardlist"><div id="cardlist-popup" class="invisible"></div><div class="cardpage" data-cardlistevent="listen:mousedown, setStart; listen:dblclick, changePage"><div class="pagenb"><div class="leftcaret" data-pagination="bind: setLeft, currentPage" data-cardlistevent="listen:mousedown, push; listen:mouseup, previousPage"></div><span data-pagination="bind: setPage, currentPage"></span><div class = "rightcaret" data-pagination="bind: setRight, currentPage" data-cardlistevent="listen:mousedown, push; listen:mouseup, nextPage"></div></div><ul data-cards="foreach"><li class="card" data-cardlistevent="listen:mousedown, highlight; listen:mouseup, zoom"><div class="cardpicture" data-cards="bind:setPic,picture_file"></div><div class="cardtitle" data-cards="bind: formatTitle, title"></div><div class="cardbtnbar invisible"><div class="editcardbtn" data-cardlistevent="listen: mousedown, press; listen:mouseup, editCard"></div><div class="deletecardbtn " data-cardlistevent="listen: mousedown, press; listen:mouseup, deleteCard"></div></div></li></ul></div></div>',p.reset=function(t){E=null,p.dom.querySelector("#cardlist-popup").classList.add("invisible"),w=t,p.getCardList(t.content[l])},p.getCardList=function(n){var r=new i,s=n;n[0]==="newcard"&&(s=n.slice(1,n.length)),s.length?(r.setTransport(t.get("transport")),r.sync(t.get("db"),{keys:s}).then(function(){n[0]==="newcard"?d.reset([{_id:"newcard",title:"",picture_file:""}]):d.reset([]),r.loop(function(e,t){d.alter("push",e.doc)}),m.set("nbPages",Math.ceil(d.getNbItems()/12)),p.displayPage(0),r.unsync()})):(d.reset([{_id:"newcard",title:"",picture_file:""}]),m.set("nbPages",1),p.displayPage(0))},p.displayPage=function(t){var n,r=d.getNbItems()-12*t;m.set("currentPage",t),v.reset([]);for(n=0;n<r;n++)v.alter("push",d.get(t*12+n))},p.removeCard=function(n){var r=new s,i=new s,o,u,f,c,p=!0;if(b.get("active_deck")===w._id){o=w.content.characters.length,u=w.content.contexts.length,f=w.content.problems.length,c=w.content.techno.length;if(o<=2||u<=2||f<=2||c<=4)p=!1,alert(y.get("cannotremovecard"))}p&&(r.setTransport(t.get("transport")),i.setTransport(t.get("transport")),r.sync(t.get("db"),w._id).then(function(){var e=r.get("content"),t=e[l];return t.splice(t.indexOf(n),1),e[l]=t,r.set("content",e),r.upload()}).then(function(){return h("updated",w._id,l),r.unsync(),i.sync(t.get("db"),n)}).then(function(){var e=i.get("deck"),n=new a,r,s=i.get("picture_file");return e.splice(e.indexOf(w._id),1),e.length?(i.set("deck",e),i.upload().then(function(){n.fulfill()})):(s.search("img/decks")===-1&&(r={type:"card",file:s},t.get("transport").request("DeleteAttachment",r,function(e){e!=="ok"&&console.log(e)})),i.remove().then(function(){n.fulfill()})),n}))},p.push=function(e,t){t.classList.add("invisible"),e.stopPropagation()},p.press=function(e,t){t.classList.add("pressed")},p.previousPage=function(e,t){p.displayPrevious()},p.nextPage=function(e,t){p.displayNext()},p.displayPrevious=function(){var t=m.get("currentPage");t>0&&p.displayPage(t-1)},p.displayNext=function(){var t=m.get("currentPage");t<m.get("nbPages")-1&&p.displayPage(t+1)},p.changePage=function(e,t){var n=[e.pageX,e.pageY];n[0]>(document.width+301)/2?p.displayNext():p.displayPrevious()},p.highlight=function(e,t){E!==null&&document.querySelector("li[data-cards_id='"+E+"']").classList.remove("highlighted"),E=t.getAttribute("data-cards_id"),t.classList.add("highlighted")},p.zoom=function(e,t){var n=t.getAttribute("data-cards_id");v.get(n)._id==="newcard"?(c("newcard",l),t.classList.remove("highlighted")):(p.setPopup(n),b.get("_id")===w.created_by&&(t.querySelector(".cardbtnbar").classList.remove("invisible"),v.get(n).created_by===b.get("_id")?t.querySelector(".editcardbtn").classList.remove("invisible"):t.querySelector(".editcardbtn").classList.add("invisible")))},p.editCard=function(t,n){var r=n.getAttribute("data-cards_id");t.stopPropagation(),g.close(),n.parentNode.classList.add("invisible"),c(v.get(r)._id,l)},p.deleteCard=function(t,n){var r=n.getAttribute("data-cards_id");t.stopPropagation(),g.close(),n.parentNode.classList.add("invisible"),p.removeCard(v.get(r)._id)},p.setPopup=function(t){var n,r={x:0,y:0},i="";n=t%12;switch(n){case 1:r.x=304,r.y=157,i="left";break;case 2:r.x=23,r.y=157,i="right";break;case 3:r.x=170,r.y=157,i="right";break;case 4:r.x=157,r.y=339,i="left";break;case 5:r.x=304,r.y=339,i="left";break;case 6:r.x=23,r.y=339,i="right";break;case 7:r.x=170,r.y=339,i="right";break;case 8:r.x=157,r.y=350,i="left";break;case 9:r.x=304,r.y=350,i="left";break;case 10:r.x=23,r.y=350,i="right";break;case 11:r.x=170,r.y=350,i="right";break;default:r.x=157,r.y=157,i="left"}g.reset(v.get(t),r,i,document.getElementById("cardlist-popup"))},p.closePopup=function(){p.dom.querySelector("li[data-cards_id='"+E+"']").classList.remove("highlighted"),p.dom.querySelector("li[data-cards_id='"+E+"']").querySelector(".cardbtnbar").classList.add("invisible"),E=null},g=new u(p.closePopup),p}});