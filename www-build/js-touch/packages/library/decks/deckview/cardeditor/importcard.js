/* 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/config","Bind.plugin","Event.plugin","Store"],function(e,t,n,r,i){return function(s,o){var u=new e,a=t.get("labels");return u.template='<div class="importcard"><div class="cancelmail" data-importevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-importevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div>',u.plugins.addAll({label:new n(a),importevent:new r(u)}),u.changeType=function(t){console.log("importcard change type : ",t)},u.cancel=function(e,t){o()},u}});