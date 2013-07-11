/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","Olives/Model-plugin","Olives/Event-plugin","service/config","Store","service/utils"],function(e,t,n,r,i,s){function o(e){var o=new i,u=r.get("avatars"),a=e[0];this.plugins.addAll({avatar:new t(o,{setStyle:function(e){this.setAttribute("style","background-image: url('"+e+"');")}}),event:new n(this)}),this.template='<div class="avatar" data-avatar="bind: setStyle, img"></div>',e.length>1?o.set("img","img/avatars/deedee6.png"):a===r.get("user").get("_id")?(o.set("img",r.get("avatar")),r.watchValue("avatar",function(){o.set("img",r.get("avatar"))})):a==="ideafy@taiaut.com"||a==="IDEAFY"?o.set("img","img/avatars/doctordeedee.png"):u.get(a)?o.set("img",u.get(a)):s.getAvatarById(a).then(function(){o.set("img",u.get(a))})}return function(n){return o.prototype=new e,new o(n)}});