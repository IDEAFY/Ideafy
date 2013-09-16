/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Bind.plugin","Event.plugin","service/config","service/utils","Store"],function(e,t,n,r,i,s){function o(e){var i=new s([]),o,u=r.get("avatars");this.plugins.addAll({avatar:new t(i,{setAvatar:function(e){this.setAttribute("style","background-image: url('"+e+"');")}}),event:new n(this)}),this.template='<ul data-avatar="foreach"><li data-avatar="bind: setAvatar, img; bind: name, id"></li></ul>';for(o=0;o<e.length;o++)e[o]===r.get("user").get("_id")?i.alter("push",{id:e[o],img:r.get("avatar")}):u.get(e[o])?i.alter("push",{id:e[o],img:u.get(e[o])}):r.get("transport").request("GetAvatar",{id:e[o]},function(t){t.error||i.alter("push",{id:e[o],img:t})})}return function(n){return o.prototype=new e,new o(n)}});