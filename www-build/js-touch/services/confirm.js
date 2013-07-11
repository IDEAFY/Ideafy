/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject","service/map","Bind.plugin","Event.plugin","service/config","Store"],function(e,t,n,r,i,s){function o(e,o,u){var a=i.get("labels"),f=this,l=new s({question:o}),c=u;f.plugins.addAll({label:new n(a),confirm:new n(l),confirmevent:new r(this)}),f.template='<div class = "confirm"><div class="help-doctor"></div><p class="confirm-question" data-confirm="bind:innerHTML,question"></p><div class="option left" data-confirmevent="listen:touchstart, press; listen:touchend, ok" data-label="bind: innerHTML, continuelbl">Continue</div><div class="option right" data-confirmevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl">Cancel</div></div>',f.press=function(e,t){e.stopPropagation(),t.classList.add("pressed")},f.ok=function(e,n){n.classList.remove("pressed"),t.get("cache").classList.remove("appear"),c&&c(!0)},f.cancel=function(e,n){n&&n.classList.remove("pressed"),t.get("cache").classList.remove("appear"),c&&c(!1)},f.close=function(){t.get("cache").classList.remove("appear"),e.removeChild(e.lastChild)},f.hide=function(){t.get("cache").classList.remove("appear"),f.dom.classList.add("invisible")},f.show=function(){t.get("cache").classList.add("appear"),f.dom.classList.remove("invisible")},f.reset=function(t,n){l.set("question",t),c=n},f.render(),f.place(e),o?l.set("question",o):f.hide(),setTimeout(function(){f.close},15e3)}return function(n,r,i){return o.prototype=new e,new o(n,r,i)}});