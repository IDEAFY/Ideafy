define(["OObject","Store","Bind.plugin","Event.plugin","service/config","service/utils"],function(e,t,n,r,i,s){function o(e){var o=i.get("user"),u=i.get("transport"),a,f,l,c,h=new Date,p,d={author:o.get("_id"),message:"",firstname:o.get("firstname"),date:"",datemod:"",plusones:0},v=new t(d);this.plugins.addAll({model:new n(v,{date:function m(m){this.innerHTML=s.formatDate(m)}}),config:new n(i,{setAvatar:function(e){this.setAttribute("style","background: url('"+e+"') no-repeat center center;background-size:cover;")}}),writereplyevent:new r(this),labels:new n(i.get("labels"))}),this.template='<div class="writeTwocent writeTwocentReply"><div class="replyAvatar" data-config="bind: setAvatar, avatar"></div><textarea class="twocentText replyMessage" data-labels="bind: placeholder, addtwocentreplyplaceholder" data-model="bind: value, message"></textarea><div class="writeFooter"><ul class="twocentContext"><li class="creadate"><span class="creadatelbl" data-labels="bind:innerHTML, twocentcreationdate"></span><span class="date" data-model="bind: date, date"></span></li></ul><div class="twocentCancel" data-labels="bind: innerHTML, cancellbl" data-writereplyevent="listen: mousedown, press; listen: mouseup, cancel">Cancel</div><div class="twocentPublish" data-labels="bind: innerHTML, publishlbl" data-writereplyevent="listen: mousedown, press; listen: mouseup, publish;">Publish</div></div></div>',this.reset=function(e,t,n,r,i,s){var o=new Date;e&&t&&(a=e,f=t),i?c=i:c="",n?(v.reset(n),editTCR=n,l=r,v.set("datemod",[o.getFullYear(),o.getMonth(),o.getDate()])):(v.reset(d),v.set("date",[o.getFullYear(),o.getMonth(),o.getDate()]),editTCR="newreply"),p=s},this.cancel=function(t,n){n.setAttribute("style","-webkit-box-shadow: none; background: #e69b73;"),v.reset(d),p?p():e.classList.add("invisible")},this.publish=function(t,n){n.setAttribute("style","-webkit-box-shadow: none; background: #8cab68;");if(v.get("message")){var r=JSON.parse(v.toJSON()),s,o;editTCR==="newreply"?o=editTCR:o="editreply",c&&(r.message="@ "+c+" : "+r.message),s={docId:a,type:o,position:l,twocent:f,reply:r},u.request("WriteTwocent",s,function(t){t!=="ok"?alert(i.get("labels").get("somethingwrong")):e.classList.add("invisible")})}},this.press=function(e,t){t.setAttribute("style","-webkit-box-shadow: inset 0 0 5px 1px rgba(0,0,0,0.6); background: #666666;")}}return function(n){return o.prototype=new e,new o(n)}});