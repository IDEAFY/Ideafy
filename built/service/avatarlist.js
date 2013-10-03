/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","Bind.plugin","Event.plugin","service/config","service/utils","Store"],function(e,t,i,n,s,a){function r(e){var s,r=new a([]),o=n.get("avatars");for(this.plugins.addAll({avatar:new t(r,{setAvatar:function(e){this.setAttribute("style","background-image: url('"+e+"');")}}),event:new i(this)}),this.template='<ul data-avatar="foreach"><li data-avatar="bind: setAvatar, img; bind: name, id"></li></ul>',s=0;s<e.length;s++)e[s]===n.get("user").get("_id")?r.alter("push",{id:e[s],img:n.get("avatar")}):o.get(e[s])?r.alter("push",{id:e[s],img:o.get(e[s])}):n.get("transport").request("GetAvatar",{id:e[s]},function(t){t.error||r.alter("push",{id:e[s],img:t})})}return function(t){return r.prototype=new e,new r(t)}});