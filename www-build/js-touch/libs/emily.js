/**
 * @license Emily <VERSION> http://flams.github.com/emily
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

/**
 * Emily
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Tools",[],function(){function t(e,t,n){var r,i;if(!t)return;return t.forEach(function(t,s){var o=n(t,e);o>=0&&(typeof i=="undefined"||o<i)&&(i=o,r=s)}),r}return{getGlobal:function(){var t=function(){return this};return t.call(null)},mixin:function(t,n,r){return this.loop(t,function(e,i){if(!n[i]||!r)n[i]=t[i]}),n},count:function(t){var n=0;return this.loop(t,function(){n++}),n},compareObjects:function(t,n){var r=function(e){return Object.getOwnPropertyNames(e).sort().join("")};return r(t)==r(n)},compareNumbers:function(t,n){return t>n?1:t<n?-1:0},toArray:function(t){return[].slice.call(t)},loop:function(t,n,r){var i,s;if(t instanceof Object&&n instanceof Function){if(t instanceof Array)for(i=0;i<t.length;i++)n.call(r,t[i],i,t);else for(i in t)t.hasOwnProperty(i)&&n.call(r,t[i],i,t);return!0}return!1},objectsDiffs:function(t,n){if(t instanceof Object&&n instanceof Object){var r=[],i=[],s=[],o=[];return this.loop(n,function(e,n){typeof t[n]=="undefined"?o.push(n):e!==t[n]?i.push(n):e===t[n]&&r.push(n)}),this.loop(t,function(e,t){typeof n[t]=="undefined"&&s.push(t)}),{updated:i,unchanged:r,added:o,deleted:s}}return!1},jsonify:function(t){return t instanceof Object?JSON.parse(JSON.stringify(t)):!1},clone:function(t){return t instanceof Array?t.slice(0):typeof t!="object"||t===null||t instanceof RegExp?!1:this.mixin(t,{})},getNestedProperty:function(t,n){if(t&&t instanceof Object){if(typeof n=="string"&&n!==""){var r=n.split(".");return r.reduce(function(e,t){return e&&e[t]},t)}return typeof n=="number"?t[n]:t}return t},setNestedProperty:function(t,n,r){if(t&&t instanceof Object){if(typeof n=="string"&&n!==""){var i=n.split(".");return i.reduce(function(e,t,n){return e[t]=e[t]||{},i.length==n+1&&(e[t]=r),e[t]},t)}return typeof n=="number"?(t[n]=r,t[n]):t}return t},closest:function(n,r){return t(n,r,function(e,t){return Math.abs(e-t)})},closestGreater:function(n,r){return t(n,r,function(e,t){return e-t})},closestLower:function(n,r){return t(n,r,function(e,t){return t-e})}}}),define("Observable",["Tools"],function(t){return function(){var n={};this.watch=function(t,r,i){if(typeof r=="function"){var s=n[t]=n[t]||[],o=[r,i];return s.push(o),[t,s.indexOf(o)]}return!1},this.unwatch=function(t){var r=t[0],i=t[1];return n[r]&&n[r][i]?(delete n[r][i],n[r].some(function(e){return!!e})||delete n[r],!0):!1},this.notify=function(r){var i=n[r],s=t.toArray(arguments).slice(1);return i?(t.loop(i,function(e){try{e&&e[0].apply(e[1]||null,s)}catch(t){}}),!0):!1},this.hasObserver=function(t){return!!(t&&n[t[0]]&&n[t[0]][t[1]])},this.hasTopic=function(t){return!!n[t]},this.unwatchAll=function(t){return n[t]?delete n[t]:n={},!0}}}),define("StateMachine",["Tools"],function(t){function n(e,n){var i={},s="";this.init=function(t){return i[t]?(s=t,!0):!1},this.add=function(t){if(!i[t]){var n=i[t]=new r;return n}return i[t]},this.get=function(t){return i[t]},this.getCurrent=function(){return s},this.has=function(t){return i.hasOwnProperty(t)},this.advance=function(t){return this.has(t)?(s=t,!0):!1},this.event=function(n){var r;return r=i[s].event.apply(i[s].event,t.toArray(arguments)),r===!1?!1:(r&&(i[s].event("exit"),s=r,i[s].event("entry")),!0)},t.loop(n,function(e,t){var n=this.add(t);e.forEach(function(e){n.add.apply(null,e)})},this),this.init(e)}function r(){var e={};this.add=function(n,r,i,s){var o=[];return e[n]?!1:typeof n=="string"&&typeof r=="function"?(o[0]=r,typeof i=="object"&&(o[1]=i),typeof i=="string"&&(o[2]=i),typeof s=="string"&&(o[2]=s),e[n]=o,!0):!1},this.has=function(n){return!!e[n]},this.get=function(n){return e[n]||!1},this.event=function(r){var i=e[r];return i?(i[0].apply(i[1],t.toArray(arguments).slice(1)),i[2]):!1}}return n}),define("Promise",["Observable","StateMachine"],function(t,n){return function r(){var e=null,i=null,s=new t,o={Pending:[["fulfill",function(n){e=n,s.notify("fulfill",n)},"Fulfilled"],["reject",function(t){i=t,s.notify("reject",t)},"Rejected"],["toFulfill",function(t){s.watch("fulfill",t)}],["toReject",function(t){s.watch("reject",t)}]],Fulfilled:[["toFulfill",function(n){setTimeout(function(){n(e)},0)}]],Rejected:[["toReject",function(t){setTimeout(function(){t(i)},0)}]]},u=new n("Pending",o);this.fulfill=function(t){return u.event("fulfill",t),this},this.reject=function(t){return u.event("reject",t),this},this.then=function(){var n=new r;return arguments[0]instanceof Function?arguments[1]instanceof Function?u.event("toFulfill",this.makeResolver(n,arguments[0])):u.event("toFulfill",this.makeResolver(n,arguments[0],arguments[1])):u.event("toFulfill",this.makeResolver(n,function(){n.fulfill(e)})),arguments[1]instanceof Function&&u.event("toReject",this.makeResolver(n,arguments[1],arguments[2])),arguments[2]instanceof Function&&u.event("toReject",this.makeResolver(n,arguments[2],arguments[3])),!(arguments[1]instanceof Function)&&!(arguments[2]instanceof Function)&&u.event("toReject",this.makeResolver(n,function(){n.reject(i)})),n},this.sync=function(t){if(t instanceof Object&&t.then){var n=function(t){this.fulfill(t)},r=function(t){this.reject(t)};return t.then(n.bind(this),r.bind(this)),!0}return!1},this.makeResolver=function(t,n,r){return function(i){var s;try{s=n.call(r,i),t.sync(s)||t.fulfill(s)}catch(o){t.reject(o)}}},this.getReason=function(){return i},this.getValue=function(){return e},this.getObservable=function(){return s},this.getStateMachine=function(){return u},this.getStates=function(){return o}}}),define("Store",["Observable","Tools"],function(t,n){return function(r){var i=n.clone(r)||{},s=new t,o=new t,u=[],a=function(t){var r=n.objectsDiffs(t,i);["updated","deleted","added"].forEach(function(e){r[e].forEach(function(t){s.notify(e,t,i[t]),o.notify(t,i[t],e)})})};this.getNbItems=function(){return i instanceof Array?i.length:n.count(i)},this.count=this.getNbItems,this.get=function(t){return i[t]},this.has=function(t){return i.hasOwnProperty(t)},this.set=function(t,n){var r,u,a;return typeof t!="undefined"?(r=this.has(t),u=this.get(t),i[t]=n,a=r?"updated":"added",s.notify(a,t,i[t],u),o.notify(t,i[t],a,u),!0):!1},this.update=function(t,r,i){var u;return this.has(t)?(u=this.get(t),n.setNestedProperty(u,r,i),s.notify("updated",r,i),o.notify(t,u,"updated"),!0):!1},this.del=function(t){return this.has(t)?(this.alter("splice",t,1)||(delete i[t],s.notify("deleted",t),o.notify(t,i[t],"deleted")),!0):!1},this.delAll=function(t){return t instanceof Array?(t.sort(n.compareNumbers).reverse().forEach(this.del,this),!0):!1},this.alter=function(t){var r,s;return i[t]?(s=n.clone(i),r=this.proxy.apply(this,arguments),a(s),r):!1},this.proxy=function(t){return i[t]?i[t].apply(i,Array.prototype.slice.call(arguments,1)):!1},this.watch=function(t,n,r){return s.watch(t,n,r)},this.unwatch=function(t){return s.unwatch(t)},this.getStoreObservable=function(){return s},this.watchValue=function(t,n,r){return o.watch(t,n,r)},this.unwatchValue=function(t){return o.unwatch(t)},this.getValueObservable=function(){return o},this.loop=function(t,r){n.loop(i,t,r)},this.reset=function(t){if(t instanceof Object){var r=n.clone(i);return i=n.clone(t)||{},a(r),!0}return!1},this.compute=function(t,r,i,s){var o=[];return typeof t=="string"&&typeof r=="object"&&typeof i=="function"&&!this.isCompute(t)?(u[t]=[],n.loop(r,function(e){u[t].push(this.watchValue(e,function(){this.set(t,i.call(s))},this))},this),this.set(t,i.call(s)),!0):!1},this.removeCompute=function(t){return this.isCompute(t)?(n.loop(u[t],function(e){this.unwatchValue(e)},this),this.del(t),!0):!1},this.isCompute=function(t){return!!u[t]},this.toJSON=function(){return JSON.stringify(i)},this.dump=function(){return i}}}),define("Transport",[],function(){return function(t){var n=null;this.setReqHandlers=function(t){return t instanceof Object?(n=t,!0):!1},this.getReqHandlers=function(){return n},this.request=function(t,r,i,s){return n.has(t)&&typeof r!="undefined"?(n.get(t)(r,function(){i&&i.apply(s,arguments)}),!0):!1},this.listen=function(t,r,i,s){if(n.has(t)&&typeof r!="undefined"&&typeof i=="function"){var o=function(){i.apply(s,arguments)},u;return u=n.get(t)(r,o,o),function(){typeof u=="function"?u():typeof u=="object"&&typeof u.func=="function"&&u.func.call(u.scope)}}return!1},this.setReqHandlers(t)}});