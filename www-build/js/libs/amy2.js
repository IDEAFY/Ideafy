/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Olivier Wietrich <Olivier.Wietrich@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Amy/DomUtils",["Olives/DomUtils","Tools"],function(e,t){return{hasQuerySelector:function(n,r,i){return t.toArray(e.getNodes(n,i)).indexOf(r)>-1}}}),define("Amy/TestUtils",[],function(){var e=function(e){return typeof e=="string"},t=function(t,n){throw new Error(e(n)?n:t)};return{assertIsObject:function(e,n){return e instanceof Object||t("Is not Object",n),!0},assertIsObservable:function(e,n){return(!e||typeof e["watch"]!="function"||typeof e["notify"]!="function")&&t("Is not Observable",n),!0},assertIsString:function(n,r){return e(n)||t("Is not String",r),!0}}}),define("Amy/Stack-plugin",["Amy/Stack-service"],function(e){return function(n,r){var i=new e(n,r);this.getStack=function(){return i},this.destination=function(e){i.setDestination(e)},this.hide=function(){i.hide()},this.show=function(e,t,n,r){e.addEventListener(t,function(e){i.show(e.target.getAttribute(n))},r=="true")}}}),define("Amy/Event-controller",["Amy/TestUtils","Tools"],function(e,t){return function(n,r){var i=n instanceof Object?n:null,s=function(e){return typeof e=="boolean"?e:!1},o=function(){var e=!0,t;for(t=arguments.length;t>=0;t--)e=e&&typeof arguments[t]=="string";return e},u=s(r),a={mousedown:"touchstart",mouseup:"touchend",mousemove:"touchmove"};this.addListener=function(e,t,n,r){e.addEventListener(this.map(t),n,r)},this.call=function(e){i[e].apply(i,t.toArray(arguments).slice(1))},this.isTouch=function(){return u},this.setTouch=function(e){return s(e)?(u=e,!0):!1},this.setMap=function(e,t){return o(e,t)?(a[e]=t,!0):!1},this.map=function(e){var t=a[e];return t&&u?t:e},this.setScope=function(e){return i=e,!0},this.scope=function(){return i}}}),define("Amy/Delegate-plugin",["Amy/Event-controller","Amy/DomUtils"],function(e,t){function n(){this.listen=function(e,t,n,r){var i=this;this.addListener(e,t,function(t){i.call(n,t,e)},r=="true")},this.selector=function(e,n,r,i,s){var o=this;this.addListener(e,r,function(r){t.hasQuerySelector(e,r.target,n)&&o.call(i,r,e)},s=="true")}}return function(r,i){return n.prototype=new e(r,i),new n}}),define("Amy/Control-plugin",["Amy/Event-controller","Amy/DomUtils"],function(e,t){function n(){var e=null;this.init=function(t){e=t},this.radio=function(n,r,i,s,o,u){var a=this;this.addListener(n,s,function(s){var u=s.target;t.hasQuerySelector(n,u,r)&&(a.radioClass(u,e,i),e=u,a.call(o,s))},u=="true")},this.radioClass=function(e,t,n){e.classList.add(n),t&&t!=e&&t.classList.remove(n)},this.toggleClass=function(e,t){return e.classList.toggle(t)},this.toggle=function(e,n,r,i,s,o){var u=this;this.addListener(e,i,function(i){var o=i.target;t.hasQuerySelector(e,o,n)&&(u.toggleClass(o,r),u.call(s,i))},o=="true")}}return function(r,i){return n.prototype=new e(r,i),new n}}),define("Amy/Stack-service",["Store","Olives/OObject","Olives/DomUtils","Tools"],function(t,n,r,i){return function(i,s){var o=new t(i),u=s,a="",f=null;this.setDestination=function(t){return r.isAcceptedType(t)?(u=t,!0):!1},this.getDestination=function(){return u},this.setCurrentScreen=function(t){f=t},this.getCurrentScreen=function(){return f},this.add=function(t,r){return typeof t=="string"&&r instanceof n?(o.set(t,r),this.hide(r),!0):!1},this.get=function(t){return o.get(t)},this.getCurrentName=function(){return a},this.show=function(t){var n=this.get(t);return n&&t!==a?(n.place(u),f&&this.hide(f),this.setCurrentScreen(n),a=t,!0):!1},this.hide=function(t){t.place(document.createDocumentFragment())}}});