/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Amy/Stack-plugin","service/map","Event.plugin","service/config","Bind.plugin","Store","lib/spin.min","Promise","CouchDBDocument"],function(e,t,n,r,i,s,o,u,a,f){return function(c,h,p){var d=new e,v=new e,m=new e,g=new e,y=new e,b=new e,w=new t,E=new o({email:"",firstname:"",lastname:"","confirm-password":"",password:"",error:""}),S=i.get("labels"),x=i.get("transport"),T=i.get("db"),N,C=(new u({color:"#657B99",lines:10,length:10,width:8,radius:15,top:270})).spin(),k=!1;return d.plugins.addAll({loginstack:w}),g.plugins.add("label",new s(S)),g.template='<div id="loading"><p data-label="bind: innerHTML, loadingmessage"></p><div id="loadingspin"></div></div>',g.place(document.getElementById("loading")),y.plugins.add("label",new s(S)),y.template='<div id="serverdown"><p data-label="bind: innerHTML, maintenancemessage"></p><div id="loadingspin"></div></div>',b.plugins.add("label",new s(S)),b.template='<div id="nointernt"><p data-label="bind: innerHTML, nointernet"></p><div id="loadingspin"></div></div>',m.plugins.addAll({label:new s(S),loginmodel:new s(E),signupevent:new r(m)}),m.template='<form id="signup-form"><p class="login-fields"><input data-loginmodel="bind:value,email" data-label="bind:placeholder, emailplaceholder" type="text" data-signupevent="listen: keypress, resetError"><input data-loginmodel="bind:value,password" type="password" data-label="bind:placeholder, passwordplaceholder" data-signupevent="listen: keypress, resetError"><input data-loginmodel="bind:value,confirm-password" type="password" data-label="bind:placeholder, repeatpasswordplaceholder" data-signupevent="listen: keypress, resetError"><input data-loginmodel="bind:value,firstname" type="text" data-label="bind:placeholder, firstnameplaceholder" data-signupevent="listen: keypress, resetError"><input data-loginmodel="bind:value,lastname" type="text" data-label="bind:placeholder, lastnameplaceholder" data-signupevent="listen:keypress, resetError; listen:keypress, entersignup"></p><p><label data-loginmodel="bind:innerHTML,error" class="login-error"></label></p><p><label id="signup" class="login-button pressed-btn" data-label="bind:innerHTML, signupbutton" data-signupevent="listen: mousedown, press; listen: mouseup, release; listen:mouseup, signup"></label></p><p><label class="login-button pressed-btn" name="#login-screen" data-signupevent="listen: mousedown, press; listen:mouseup, release; listen: mouseup, showLogin" data-label="bind:innerHTML, loginbutton"></label></p></form>',m.press=function(e,t){t.classList.add("pressed")},m.release=function(e,t){t.classList.remove("pressed")},m.entersignup=function(e,t){e.keyCode===13&&(e.target.blur(),m.signup())},m.showLogin=function(e,t){w.getStack().show("#login-screen")},m.resetError=function(e,t){E.set("error","")},m.signup=function(t,n){var r=E.get("email"),s=E.get("password"),o=E.get("confirm-password"),u=E.get("firstname"),l=E.get("lastname"),d=new a,v=new f;if(r==="")E.set("error",S.get("signupmissingemail"));else if(s==="")E.set("error",S.get("signupmissingpwd"));else if(o==="")E.set("error",S.get("signupmissingpwdok"));else if(u==="")E.set("error",S.get("signupmissingfn"));else if(l==="")E.set("error",S.get("signupmissingln"));else{var g=r.toLowerCase(),y=/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;y.test(g)?s!==o?E.set("error",S.get("signuppwdnomatch")):(C.spin(m.dom),x.request("Signup",{name:g,password:s,fn:u,ln:l,lang:i.get("lang")},function(e){if(e.signup==="ok"){v.reset(i.get("userTemplate")),v.set("firstname",u),v.set("lastname",l),v.set("username",u+" "+l),v.set("lang",i.get("lang"));var t=new Date;v.set("notifications",[{type:"MSG",toList:u+" "+l,date:[t.getFullYear(),t.getMonth(),t.getDate(),t.getHours(),t.getMinutes(),t.getSeconds()],object:S.get("signupwelcomeobject"),status:"unread",author:"IDEAFY",firstname:"DeeDee",signature:"-- Ideas made easy!",username:"Ideafy",body:S.get("signupwelcomebody")}]),x.request("Welcome",{userid:g,language:v.get("lang")},function(e){console.log(e)}),e.db&&p.set("db",e.db),v.setTransport(x),v.sync(e.db,g).then(function(){return v.upload()}).then(function(){p.set("currentLogin",g),p.set("userAvatar",v.get("picture_file")),p.sync("ideafy-data"),i.set("uid",'"'+g+'"'),v.unsync(),k?h(!0):c(!0)})}else E.set("error","error : "+e.message),E.set("email",""),C.stop()},this)):E.set("error",S.get("signupinvalidemail"))}},v.plugins.addAll({label:new s(S),loginmodel:new s(E),loginevent:new r(v)}),v.template='<form id="login-form"><p class="login-fields"><input data-loginmodel="bind:value,email" autofocus="autofocus" data-label="bind:placeholder, emailplaceholder" type="text" data-loginevent="listen:keypress, resetError"><input data-loginmodel="bind:value,password" type="password" data-label="bind:placeholder, passwordplaceholder" data-loginevent="listen: keypress, resetError; listen:keypress, enterlogin"></p><p><label class="login-button pressed-btn" data-label="bind: innerHTML, loginbutton" data-loginevent="listen:mousedown, press; listen: mouseup, release; listen:mouseup, login"></label></p><p><label data-loginmodel="bind:innerHTML,error" class="login-error"></label></p><p><label id="signup-button" class="pressed-btn" name="#signup-screen" data-label="bind: innerHTML, newuserbutton" data-loginevent="listen: mousedown, press; listen:mouseup, release; listen: mouseup, showSignup"></label></p></form>',v.press=function(e,t){t.classList.add("pressed")},v.release=function(e,t){t.classList.remove("pressed")},v.enterlogin=function(e,t){e.keyCode===13&&(e.target.blur(),v.login())},v.showSignup=function(e,t){w.getStack().show("#signup-screen")},v.resetError=function(e,t){E.set("error","")},v.login=function(t,n){var r=E.get("email").toLowerCase(),s=E.get("password");r&&s?(C.spin(v.dom),x.request("Login",{name:r,password:s},function(e){e.login==="ok"?(i.set("uid",'"'+r+'"'),e.db&&p.set("db",e.db),p.set("currentLogin",r),x.request("GetAvatar",{id:r},function(e){e.error||(p.set("userAvatar",e),p.sync("ideafy-data"),i.set("avatar",e)),k?h():c()})):(E.set("error",S.get("invalidlogin")),C.stop())})):E.set("error",S.get("invalidlogin"))},w.getStack().add("#login-screen",v),w.getStack().add("#signup-screen",m),w.getStack().add("#loading-screen",g),w.getStack().add("#maintenance-screen",y),w.getStack().add("#nointernet",b),d.alive(n.get("login")),d.init=function(){w.getStack().show("#loading-screen"),N=(new u({color:"#9AC9CD",lines:10,length:20,width:8,radius:15})).spin(document.getElementById("loadingspin"))},d.setScreen=function(t){w.getStack().show(t)},d.reset=function(t){E.reset({email:"",firstname:"",lastname:"","confirm-password":"",password:"",error:""}),t&&(k=!0)},d.stopSpinner=function(){C&&C.stop(),N&&N.stop()},d}});