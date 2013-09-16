/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Amy/Stack-plugin","./detail-stack/library-idea","./detail-stack/library-edit","./detail-stack/library-sendmail","./detail-stack/library-share","service/config","Store","lib/spin.min"],function(e,t,n,r,i,s,o,u,a,f){return function(){var l=new e,c,h,p,d,v=new n,m=u.get("observer"),g=new a,y=0,b=(new f({color:"#9AC9CD",lines:10,length:12,width:6,radius:10,top:328})).spin();return l.plugins.addAll({detailstack:v}),l.template='<div class="detail-stack" data-detailstack="destination"></div>',l.reset=function(t,n){var r;g=t,y=n,v.getStack().show("#library-ideadetail"),c.hideCache(),b.spin(l.dom),c.reset(t,n).then(function(){b.stop(),r.classList.add("invisible")})},l.action=function(t){switch(t){case"#library-edit":d.reset(g.get(y).id),v.getStack().show("#library-edit");break;case"#library-favorites":break;case"#library-share":p.reset(g.get(y).id),v.getStack().show("#library-share");break;case"close":v.getStack().show("#library-ideadetail");break;default:v.getStack().show("#library-ideadetail")}},l.edit=function(t){d.reset(t),v.getStack().show("#library-edit")},l.sendMail=function(t){h.reset(t),v.getStack().show("#library-sendmail")},l.share=function(t){p.reset(t._id),v.getStack().show("#library-share")},c=new r(l.action),d=new i(l.action),h=new s(l.action),p=new o(l.action),v.getStack().add("#library-ideadetail",c),v.getStack().add("#library-edit",d),v.getStack().add("#library-sendmail",h),v.getStack().add("#library-share",p),m.watch("library-viewidea",function(e){l.viewIdea(e)}),m.watch("library-edit",function(e){l.edit(e)}),m.watch("library-sendmail",function(e){l.sendMail(e)}),m.watch("library-share",function(e){l.share(e)}),l}});