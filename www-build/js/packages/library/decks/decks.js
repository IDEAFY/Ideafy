/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","Olives/Model-plugin","Amy/Stack-plugin","Amy/Control-plugin","Amy/Delegate-plugin","service/config","service/map","./decklist/decklist","./deckview/deckview"],function(e,t,n,r,i,s,o,u,a){return function(){var l=new e,c=new r(l),h=new n,p=new u,d=new a;return l.plugins.addAll({label:new t(s.get("labels")),deckliststack:h,decksevent:new i(l),deckscontrol:c}),l.alive(o.get("decks")),l.reset=function(e){p.reset(),d.reset()},l.init=function(){var t=new u("taiaut_decks");h.getStack().add("ideafy",t),t.init(function(e){e&&(h.getStack().show("ideafy"),d.init(),t.initSelected(c.init,0),d.reset(t.getModel().get(0)))})},l.selectStart=function(e){var t=h.getStack().getCurrentScreen().getModel(),n=e.target.getAttribute("data-decks_id");d.reset(t.get(n))},l.init(),l}});