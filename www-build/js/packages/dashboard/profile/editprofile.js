/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/config","Olives/Model-plugin","Olives/Event-plugin","service/avatar","service/utils","Store"],function(e,t,n,r,i,s,o){return new function(){var u=new e,a=t.get("user"),f=new o,l=[{name:"azur",file:"img/avatars/deedee0.png",selected:!1},{name:"blue",file:"img/avatars/deedee1.png",selected:!1},{name:"green",file:"img/avatars/deedee2.png",selected:!1},{name:"grey",file:"img/avatars/deedee3.png",selected:!1},{name:"orange",file:"img/avatars/deedee4.png",selected:!1},{name:"red",file:"img/avatars/deedee5.png",selected:!1},{name:"yellow",file:"img/avatars/deedee6.png",selected:!1}],c=new o(l),h={},p=new o({status:null}),d=t.get("labels"),v=80,m=80,g=function(e){var t=e.getContext("2d");t.clearRect(0,0,e.width,e.height)},y=function(e){var t,n,r=document.createElement("canvas"),i=r.getContext("2d");return t=e.width,n=e.height,t<n?(n*=v/t,t=v):(t*=m/n,n=m),r.width=t,r.height=n,i.drawImage(e,0,0,t,n),r.toDataURL("image/png")},b=function(e){var t=new Image,n=document.createElement("canvas"),r=document.getElementById("avatarcanvas"),i=n.getContext("2d"),s=r.scrollWidth,o=r.scrollHeight,u,a;t.src=e,setTimeout(function(){n.width=s,n.height=o,u=Math.floor(Math.max(0,(t.width-s)/2)),a=Math.floor(Math.max(0,(t.height-o)/2)),i.drawImage(t,u,a,s,o,0,0,s,o),f.set("avatar",n.toDataURL("image/png"))},300)},w=function(e){var t="/upload",n=new FormData;n.append("type","avatar"),n.append("filename",h.picture_file),n.append("img",f.get("avatar")),s.uploadFile(t,n,p,function(e){e.response!=="ok"&&console.log(e)})};return u.plugins.addAll({label:new n(d),avatars:new n(c,{setPic:function(e){this.setAttribute("style","background-image: url('"+e+"');background-repeat: no-repeat; background-position: center center; background-size: cover;")},setChecked:function(e){e?this.innerHTML="&#10003;":this.innerHTML=""}}),progress:new n(p,{showProgress:function(e){var t=0;e&&(t=Math.floor(e/100*80)),this.setAttribute("style","width:"+t+"px;"),e===100?this.innerHTML=d.get("uploadcomplete"):this.innerHTML=""}}),profile:new n(f,{setAvatar:function(e){this.setAttribute("style","background-image: url('"+e+"');background-repeat: no-repeat; background-position: center center; background-size: cover;")},setDay:function(e){e[2]&&(this.value=e[2])},setMonth:function(e){var t=e[1]||0;this.value=this.options[t].innerHTML},setYear:function(e){e[0]&&(this.value=e[0])},setFamilyStatus:function(e){if(e||e===0)this.selectedIndex=e},setChildren:function(e){if(e||e===0)this.selectedIndex=e},setSituation:function(e){if(e||e===0)this.selectedIndex=e},setLeisureName:function(e){var t=this,n=t.getAttribute("name");[0,1,2].forEach(function(r){e[r]&&n.search(r)>0&&(t.value=e[r].name)})},setLeisureDesc:function(e){var t=this,n=t.getAttribute("name");[0,1,2].forEach(function(r){e[r]&&n.search(r)>0&&(t.value=e[r].comment)})},setInterestName:function(e){var t=this,n=t.getAttribute("name");[0,1,2].forEach(function(r){e[r]&&n.search(r)>0&&(t.value=e[r].name)})},setInterestDesc:function(e){var t=this,n=t.getAttribute("name");[0,1,2].forEach(function(r){e[r]&&n.search(r)>0&&(t.value=e[r].comment)})}}),editprofileevent:new r(u)}),u.template='<div><div class = "setavatar"><canvas id ="avatarcanvas" class="currentavatar" data-profile="bind:setAvatar, avatar" data-editprofileevent="listen:mousedown, changeAvatar"></canvas><div id="rotate" class="invisible" data-editprofileevent="listen:mousedown, rotateAvatar"></div><div id="changeavatar" class="invisible"><div class="avatarcache"></div><span class="importbutton"><input type="file" enctype="multipart/form-data" accept = "image/gif, image/jpeg, image/png" data-editprofileevent="listen: mousedown, selectpress; listen: change, uploadnDisplay"><div data-label="bind:innerHTML, importlbl"></div></span><p data-label="bind:innerHTML, selectavatar"></p><ul class="defaultlist" data-avatars="foreach"><li><div class="defaultAvatar" data-avatars="bind: setPic, file"></div><div class="checkbox" data-avatars="bind: setChecked, selected" data-editprofileevent="listen: mouseup, setDefaultAvatar"></div></li></ul></div></div><form class="profileinfo"><div class = "username"><div class = "firstname"><label data-label="bind:innerHTML, firstnameplaceholder"></label><input class="input" name="firstname" type="text" data-profile="bind: value, firstname" data-editprofileevent="listen: input, updateField"></div><div class = "lastname"><label data-label="bind:innerHTML, lastnameplaceholder"></label><input class="input" type="text" name="lastname" data-profile="bind: value, lastname" data-editprofileevent="listen: input, updateField"></div></div><label data-label="bind:innerHTML, profileintro"></label><input class="input" name="intro" type="text" data-profile="bind:value, intro" data-label="bind:placeholder, shortprofiledesc" data-editprofileevent="listen: input, updateField"><label data-label="bind:innerHTML, dob"></label><div class="dob"><input class="day" name="day" type="text" data-label="bind:placeholder, day" data-profile="bind: setDay, birthdate" data-editprofileevent="listen:input, updateDate"><select name="month" data-profile="bind: setMonth, birthdate" data-editprofileevent="listen:change, updateDate"><option data-label="bind:innerHTML, jan"></option><option data-label="bind:innerHTML, feb"></option><option data-label="bind:innerHTML, mar"></option><option data-label="bind:innerHTML, apr"></option><option data-label="bind:innerHTML, may"></option><option data-label="bind:innerHTML, jun"></option><option data-label="bind:innerHTML, jul"></option><option data-label="bind:innerHTML, aug"></option><option data-label="bind:innerHTML, sep"></option><option data-label="bind:innerHTML, oct"></option><option data-label="bind:innerHTML, nov"></option><option data-label="bind:innerHTML, dec"></option></select><input class="year" name="year" type="text" data-label="bind:placeholder,year" data-profile="bind: setYear, birthdate" data-editprofileevent="listen:input, updateDate"></div><div class="postal"><label class="streetaddress" data-label="bind:innerHTML, mailaddress"></label><input class="streetaddress input" name="street1" type="text" data-label="bind:placeholder, street" data-profile="bind:value, address.street1" data-editprofileevent="listen:input, updateAddress"><div class="city"><label data-label="bind:innerHTML, city"></label><input class="input city" name="city" type="text" data-profile="bind:value, address.city" data-editprofileevent="listen:input, updateAddress"></div><div class="zipstate"><div class="state"><label data-label="bind:innerHTML, state"></label><input class="input" name="state" type="text" data-profile="bind:value, address.state" data-editprofileevent="listen:input, updateAddress"></div><div class="zip"><label data-label="bind:innerHTML, zip"></label><input class="input" name="zip" type="text" data-profile="bind:value, address.zip" data-editprofileevent="listen:input, updateAddress"></div></div><label data-label="bind:innerHTML, country"></label><input class="input" name="country" type="text" data-profile="bind:value, address.country" data-editprofileevent="listen:input, updateAddress"></div><label data-label="bind:innerHTML, myfamily"></label><div class="family"><select class="status" name="couple" data-profile="bind: setFamilyStatus, family.couple" data-editprofileevent="listen:change, updateFamily"><option data-label="bind:innerHTML, single"></option><option data-label="bind:innerHTML, married"></option><option data-label="bind:innerHTML, divorced"></option><option data-label="bind:innerHTML, widow"></option><option data-label="bind:innerHTML, relation"></option></select><select class="children" name="children" data-profile="bind: setChildren, family.children" data-editprofileevent="listen:change, updateFamily"><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8+</option></select><label data-label="bind:innerHTML, children"></label></div><label data-label="bind:innerHTML, myoccupation"></label><div class="job"><select class="status" name="situation" data-profile="bind: setSituation, occupation.situation" data-editprofileevent="listen:change, updateJob"><option data-label="bind:innerHTML, student"></option><option data-label="bind:innerHTML, active"></option><option data-label="bind:innerHTML, retired"></option><option data-label="bind:innerHTML, unemployed"></option><option data-label="bind:innerHTML, stayathome"></option></select><div class="jobdesc"><label data-label="bind:innerHTML, jobtitle"></label><input class="input" type="text" name="job" data-profile="bind:value, occupation.job" data-label="bind:placeholder, jobtitle" data-editprofileevent="listen:input, updateJob"></div><div class="org"><label data-label="bind:innerHTML, organization"></label><input class="input" name="organization" type="text" data-profile="bind:value, occupation.organization" data-label="bind:placeholder,organization" data-editprofileevent="listen:input, updateJob"></div></div></form><form class="addtlinfo"><legend data-label="bind:innerHTML, socialnwlbl"></legend><ul class="socialnw"><li class="fb"><input class="input" type="text" name="facebook" data-profile="bind: value, facebook" data-editprofileevent="listen: input, updateField"></li><li class="gp"><input class="input" name="gplus" type="text" data-profile="bind: value, gplus" data-editprofileevent="listen: input, updateField"></li><li class="lin"><input class="input" name="linkedin" type="text" data-profile="bind: value, linkedin" data-editprofileevent="listen: input, updateField"></li><li class="tw"><input class="input" name="twitter" type="text" data-profile="bind: value, twitter" data-editprofileevent="listen: input, updateField"></li></ul><legend data-label="bind:innerHTML, hobbieslbl"></legend><label data-label="bind:innerHTML, name"></label><label class="description" data-label="bind:innerHTML, comment"></label><input name="leisure0" class="input" type="text" data-profile="bind: setLeisureName, leisure_activities" data-editprofileevent="listen: input, updateLeisureName"><input class="input description" name="leisure0" type="text" data-profile="bind: setLeisureDesc, leisure_activities" data-editprofileevent="listen: input, updateLeisureDesc"><input name="leisure1" class="input" type="text"  data-profile="bind: setLeisureName, leisure_activities" data-editprofileevent="listen: input, updateLeisureName"><input class="input description" name="leisure1" type="text" data-profile="bind: setLeisureDesc, leisure_activities" data-editprofileevent="listen: input, updateLeisureDesc"><input class="input" name="leisure2" type="text" data-profile="bind: setLeisureName, leisure_activities" data-editprofileevent="listen: input, updateLeisureName"><input class="input description" name="leisure2" type="text" data-profile="bind: setLeisureDesc, leisure_activities" data-editprofileevent="listen: input, updateLeisureDesc"><legend data-label="bind:innerHTML, interestslbl"></legend><label data-label="bind:innerHTML, field"></label><label class="description" data-label="bind:innerHTML, comment"></label><input class="input" name="interest0" type="text" data-profile="bind: setInterestName, interests" data-editprofileevent="listen: input, updateInterestName"><input class="input description" name="interest0" type="text" data-profile="bind: setInterestDesc, interests" data-editprofileevent="listen: input, updateInterestDesc"><input class="input" name="interest1" type="text" data-profile="bind: setInterestName, interests" data-editprofileevent="listen: input, updateInterestName"><input class="input description" name="interest1" type="text" data-profile="bind: setInterestDesc, interests" data-editprofileevent="listen: input, updateInterestDesc"><input class="input" name="interest2" type="text" data-profile="bind: setInterestName, interests" data-editprofileevent="listen: input, updateInterestName"><input class="input description" name="interest2" type="text" data-profile="bind: setInterestDesc, interests" data-editprofileevent="listen: input, updateInterestDesc"></form><div class="useascharacter"></div><p class="update"><label class="cancelprofile" data-label="bind:innerHTML, cancellbl" data-editprofileevent="listen: mousedown, press; listen:mouseup, cancel"></label><label class="updateprofile" data-label="bind:innerHTML, updatelbl" data-editprofileevent="listen:mousedown, press; listen:mouseup, update"></label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p><div class="uploadprogress" data-progress="bind:showProgress, status"></div></div>',u.init=function(t){u.reset(),u.place(t)},u.selectpress=function(e,t){t.nextSibling.classList.add("pressed"),t.value=""},u.uploadnDisplay=function(e,t){var n=new Image,r=new FileReader,i=new FileReader,s=document.getElementById("avatarcanvas");r.onload=function(e){n.src=e.target.result,setTimeout(function(){b(y(n)),h.picture_file=a.get("_id")+"_@v@t@r",document.getElementById("changeavatar").classList.add("invisible"),t.nextSibling.classList.remove("pressed")},300)},r.readAsDataURL(t.files[0])},u.changeAvatar=function(e,t){document.getElementById("changeavatar").classList.remove("invisible"),p.set("status",0)},u.setDefaultAvatar=function(e,t){var n=t.getAttribute("data-avatars_id");c.loop(function(e,t){t===parseInt(n)?c.update(t,"selected",!0):c.update(t,"selected",!1)}),f.set("avatar",c.get(n).file),h.picture_file=c.get(n).file,document.getElementById("changeavatar").classList.add("invisible")},u.rotateAvatar=function(e,t){var n=document.createElement("canvas"),r=n.getContext("2d"),i=new Image;i.src=f.get("avatar"),setTimeout(function(){console.log(i.height,i.width),n.width=i.width,n.height=i.height,r.translate(n.width/2,n.height/2),r.rotate(Math.PI/2),r.translate(-n.height/2,-n.width/2),r.drawImage(i,0,0),f.set("avatar",n.toDataURL("image/png"))},300)},u.reset=function(){f.reset(JSON.parse(a.toJSON())),f.set("avatar",t.get("avatar")),c.reset(l),h={},f.get("picture_file").search("img/avatars/deedee")>-1&&c.loop(function(e,t){f.get("picture_file").search(e.file)>-1&&c.update(t,"selected",!0)})},u.updateField=function(e,t){var n=t.getAttribute("name");h[n]=t.value,f.set(n,t.value)},u.updateDate=function(e,t){var n=f.get("birthdate"),r=t.getAttribute("name"),i;switch(r){case"year":n[0]=t.value;break;case"month":n[1]=t.selectedIndex;break;case"day":n[2]=t.value}f.set("birthdate",n),h.birthdate=n},u.updateAddress=function(e,t){var n=f.get("address"),r=t.getAttribute("name");n[r]=t.value,f.set("address",n),h.address=n},u.updateFamily=function(e,t){var n=t.getAttribute("name"),r=f.get("family");r[n]=t.selectedIndex,f.set("family",r),h.family=r},u.updateJob=function(e,t){var n=f.get("occupation"),r=t.getAttribute("name"),i;switch(r){case"situation":n.situation=t.selectedIndex;break;case"job":n.job=t.value;break;case"organization":n.organization=t.value}console.log(n,f.get("occupation")),h.occupation=n},u.updateLeisureName=function(e,t){var n=t.getAttribute("name"),r=n.charAt(n.length-1),i=f.get("leisure_activities");i[r].name=t.value,f.set("leisure_activities",i),h.leisure_activities=i},u.updateLeisureDesc=function(e,t){var n=t.getAttribute("name"),r=n.charAt(n.length-1),i=f.get("leisure_activities");i[r].comment=t.value,f.set("leisure_activities",i),h.leisure_activities=i},u.updateInterestName=function(e,t){var n=t.getAttribute("name"),r=n.charAt(n.length-1),i=f.get("interests");i[r].name=t.value,f.set("interests",i),h.interests=i},u.updateInterestDesc=function(e,t){var n=t.getAttribute("name"),r=n.charAt(n.length-1),i=f.get("interests");i[r].comment=t.value,f.set("interests",i),h.interests=i},u.press=function(e,t){t.classList.add("pressed")},u.cancel=function(t,n){n.classList.remove("pressed"),document.querySelector(".userdetails").classList.remove("invisible"),document.querySelector(".edituserdetails").classList.add("invisible")},u.update=function(n,r){var i,s=0;r.classList.remove("pressed");for(i in h)a.set(i,h[i]),s++;s?a.upload().then(function(){console.log(h),h.picture_file&&t.set("avatar",f.get("avatar")),h.picture_file&&h.picture_file.search("img/avatars/deedee")<0&&(w(),document.getElementById("rotate").classList.add("invisible")),t.get("observer").notify("profile-updated"),document.querySelector(".userdetails").classList.remove("invisible"),document.querySelector(".edituserdetails").classList.add("invisible")}):(document.querySelector(".edituserdetails").classList.add("invisible"),document.querySelector(".userdetails").classList.remove("invisible"))},u}});