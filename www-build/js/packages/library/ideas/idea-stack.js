/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/map","Amy/Stack-plugin","./detail-stack/library-idea","./detail-stack/library-edit","./detail-stack/library-sendmail","./detail-stack/library-share","service/config","Store"],function(e,t,n,r,i,s,o,u,a){return function(){var l=new e,c=new n,h=t.get("ideas-detail"),p=u.get("observer"),d=new a,v=0;return l.plugins.addAll({detailstack:c}),l.alive(h),l.reset=function(t,n){d=t,v=n,c.getStack().get("#library-ideadetail").reset(t,n),c.getStack().show("#library-ideadetail")},l.action=function(t){switch(t){case"#library-edit":c.getStack().get("#library-edit").reset(d.get(v).id),c.getStack().show("#library-edit");break;case"#library-favorites":break;case"#library-share":c.getStack().get("#library-share").reset(d.get(v).doc),c.getStack().show("#library-share");break;case"close":c.getStack().show("#library-ideadetail");break;default:c.getStack().show("#library-ideadetail")}},l.edit=function(t){c.getStack().get("#library-edit").reset(t),c.getStack().show("#library-edit")},l.sendMail=function(t){c.getStack().get("#library-sendmail").reset(t),c.getStack().show("#library-sendmail")},l.share=function(t){c.getStack().get("#library-share").reset(t),c.getStack().show("#library-share")},c.getStack().add("#library-ideadetail",new r(l.action)),c.getStack().add("#library-edit",new i(l.action)),c.getStack().add("#library-sendmail",new s(l.action)),c.getStack().add("#library-share",new o(l.action)),p.watch("library-viewidea",function(e){l.viewIdea(e)}),p.watch("library-edit",function(e){l.edit(e)}),p.watch("library-sendmail",function(e){l.sendMail(e)}),p.watch("library-share",function(e){l.share(e)}),l}});