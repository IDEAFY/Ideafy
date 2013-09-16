/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject","service/config","Olives/Model-plugin","Olives/Event-plugin","Store"],function(e,t,n,r,i){return function(){var o=new e,u=t.get("labels"),a=new i({body:"",result:""});return o.plugins.addAll({labels:new n(u),support:new n(a),supportevent:new r(o)}),o.template='<div class="aboutcontent"><legend class="support" data-labels="bind:innerHTML, supportlegend"></legend><textarea class="input" data-labels="bind:placeholder, supportplaceholder" data-support="bind: value, body"></textarea><span data-support="bind:innerHTML, result"></span><div class="cancel" data-labels="bind: innerHTML, cancellbl" data-supportevent="listen: mousedown, press; listen: mouseup, cancel"></div><div class="send" data-labels="bind: innerHTML, sendlbl" data-supportevent="listen: mousedown, press; listen: mouseup, send"></div><div class="supportus"><legend data-labels="bind: innerHTML, twoway"></legend><p data-labels="bind: innerHTML, supportusintro"><ul><li><h4 data-labels="bind: innerHTML, asanideafyer"></h4><p data-labels="bind: innerHTML, ideafyerhelp"></p></li><li><h4 data-labels="bind: innerHTML, asanexec"></h4><p data-labels="bind: innerHTML, exechelp"></p></li><li><h4 data-labels="bind: innerHTML, asadev"></h4><p data-labels="bind: innerHTML, devhelp"></p></li><li><h4 data-labels="bind: innerHTML, asaninvest"></h4><p data-labels="bind: innerHTML, investhelp"></p></li></ul></p></div></div>',o.send=function(e,t){t.classList.remove("pressed"),o.sendRequest(a.get("body")),a.set("body","")},o.cancel=function(e,t){t.classList.remove("pressed"),a.set("body","")},o.press=function(e,t){t.classList.add("pressed")},o.sendRequest=function(n){var r={},i=new Date;r.request=n,r.date=i.getTime(),r.userid=t.get("user").get("_id"),t.get("transport").request("Support",r,function(e){e==="ok"?a.set("result",u.get("requestsent")):a.set("result",e),setTimeout(function(){a.set("result","")},3e3)})},o}});