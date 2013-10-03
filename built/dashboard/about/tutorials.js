/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Store"],function(e,t,s,i){return function(){var n=new e,a=t.get("labels"),c=[{name:"brainstormtutorial",src:"http://37.153.96.26:1664/tuto04.m4v"}],r=new i(c);return n.plugins.addAll({labels:new s(a),tuto:new s(r,{setName:function(e){this.innerHTML=a.get(e)}})}),n.template='<div class="aboutcontent"><ul data-tuto="foreach"><li><legend data-tuto="bind: setName, name"></legend><div class="videocontent"><video width = "640" height="480" controls="controls"><source data-tuto="bind:src,src" type="video/mp4" /></video></div></li></ul></div>',n}});