/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/map","Olives/Model-plugin","Olives/Event-plugin","service/config","Store"],function(e,t,n,r,i,s){function o(e,t,o){var u=i.get("labels"),a=this,f=new s({question:""});a.plugins.addAll({label:new n(u),confirm:new n(f),confirmevent:new r(this)}),a.template='<div class = "confirm"><div class="help-doctor"></div><p class="confirm-question" data-confirm="bind:innerHTML,question"></p><div class="option left" data-confirmevent="listen:mousedown, press; listen:mouseup, ok" data-label="bind: innerHTML, continuelbl">Continue</div><div class="option right" data-confirmevent="listen:mousedown, press; listen:mouseup, cancel" data-label="bind:innerHTML, cancellbl">Cancel</div></div>',a.press=function(e,t){e.stopPropagation(),t.classList.add("pressed")},a.ok=function(e,t){t.classList.remove("pressed"),o(!0)},a.cancel=function(e,t){t&&t.classList.remove("pressed"),o(!1)},a.close=function(){e.removeChild(e.lastChild)},f.set("question",t),a.render(),a.place(e),setTimeout(function(){a.close},15e3)}return function(n,r,i){return o.prototype=new e,new o(n,r,i)}});