/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../libs/olives"),
      emily = require("../libs/emily"),
      Widget = olives.OObject,
      Store = emily.Store,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Place = olives["Place.plugin"],
      Map = require("../services/map"),
      Config = require("../services/config"),
      Avatar = require("../services/avatar");
      
var notify = new Widget(),
      notifyPopup = new Widget(),
      user = Config.get("user"),
      observer = Config.get("observer"),
      labels = Config.get("labels"),
      current = 0, // current number of messages
      currentUnread = 0, // current number of unread messages
      popupEnabled = true,
      notif = new Store({"unread": 0, "newmsg":false}),
      messages = new Store([]); 
                
notify.seam.addAll({
        "notif" : new Model(notif, {
                flashNew : function(newmsg){
                        var flash, node = this;
                                        
                        if(newmsg){
                                flash = setInterval(function(){
                                        (node.classList.contains("orange")) ? node.classList.remove("orange") : node.classList.add("orange");
                                }, 600);
                                        
                                setTimeout(function(){
                                        clearInterval(flash);
                                        node.classList.remove("orange");
                                        notif.set("newmsg", false);
                                }, 3000);
                        }
                }
        }),
        "place" : new Place({"notifyPopup": notifyPopup}),
        "notifevent" : new Event(notify)
});
                
notify.template = '<div id="notify"><div class = "notif-bubble" data-notif="bind:innerHTML, unread"></div><div class="deedee" data-notif="bind:flashNew, newmsg" data-notifevent="listen: mousedown, push; listen:mouseup, showPopup"></div><div class = "signout-bubble" data-notifevent="listen:mousedown, signout"></div><div class = "info-bubble" data-notifevent="listen:mousedown, press; listen:mouseup, showAbout"></div><div id="notify-popup" data-place="place:notifyPopup"></div></div>';
                
notify.getUnread = function getUnread(){
        var msg = user.get("notifications"),
              unread = 0;
        for (i=0, l=msg.length; i<l; i++){
                if (msg[i].status === "unread") unread++;
        }
        return unread;        
};
                
notify.push = function(event, node){
        node.classList.add("orange");
        event.stopPropagation();        
};
                
notify.press = function(event, node){
        node.classList.add("pressed");        
};
                
notify.showPopup = function(event, node){
        node.classList.remove("orange");
        notifyPopup.showPopup();
};
                
                                
// signout function
notify.signout = function signout(event, node){
        document.getElementById("cache").classList.add("appear");
        // remove highlight from dock item and set it back to public
        document.getElementById("dock").querySelector(".selected").classList.remove("selected");
        document.querySelector('a[href="#public"]').classList.add("selected");
        Config.get("observer").notify("signout");        
};
                
// info && help
notify.showAbout = function(event, node){
        node.classList.remove("pressed");
        Config.get("observer").notify("goto-screen", "#dashboard");
        Config.get("observer").notify("show-about");        
};
                
// popup user interface
notifyPopup.seam.addAll({
        "labels" : new Model(labels),
        "notify" : new Model(messages,{
                setObject : function(type){
                        var id = this.getAttribute("data-notify_id");
                        if (type){
                                switch(type){
                                        case "CXR":
                                                this.innerHTML = messages.get(id).username + labels.get("CXRobject");
                                                break;
                                        case "INV":
                                                this.innerHTML = messages.get(id).username + labels.get("INVObject");
                                                break;
                                        case "CXRaccept":
                                                this.innerHTML = messages.get(id).username + labels.get("acceptedCXR");
                                                break;
                                        case "CXRreject":
                                                this.innerHTML = messages.get(id).username + labels.get("rejectedCXR");
                                                break;
                                        case "CXCancel":
                                                this.innerHTML = messages.get(id).username + labels.get("canceledCX");
                                                break;
                                        case "DOC":
                                                this.innerHTML = messages.get(id).username + labels.get("sentdocmsg");
                                                break;
                                        case "2Q+":
                                                this.innerHTML = messages.get(id).username + labels.get("askednew");
                                                break;
                                        case "2C+":
                                                this.innerHTML = messages.get(id).username + labels.get("senttc");
                                                break;
                                        case "REF":
                                                this.innerHTML = messages.get(id).username + labels.get("joinedideafy");
                                                break;
                                        case "MUD-":
                                                this.innerHTML = labels.get("muinaday");
                                                break;
                                        case "MUQ-":
                                                this.innerHTML = labels.get("mufifteen");
                                                break;
                                        case "MUP+":
                                                this.innerHTML = labels.get("newpart");
                                                break;
                                        case "MUP-":
                                                this.innerHTML = labels.get("partleft");
                                                break;
                                        case "SCANCEL":
                                                this.innerHTML = labels.get("scancel");
                                                break;
                                        case "SSTART":
                                                this.innerHTML = labels.get("sstart");
                                                break;
                                        default :
                                                this.innerHTML = messages.get(id).object;
                                }
                        }        
                },
                setStyle : function(status){
                        (status === "unread") ? this.setAttribute("style", "font-weight: bold;") : this.setAttribute("style", "font-weight: normal;");
                },
                setFirstname : function(firstname){
                        if (firstname) this.innerHTML = firstname;
                        else this.innerHTML = labels.get("ideafy");        
                },
                setAvatar : function(author){
                        var _frag, _ui, node = this;
                        if (author){
                                _frag = document.createDocumentFragment();
                                _ui = new Avatar([author]);
                                _ui.place(_frag);
                                (!node.firstChild) ? node.appendChild(_frag) : node.replaceChild(_frag, node.firstChild);
                        }   
                }
        }),
        "notifyevent" : new Event(notifyPopup)
});
                
notifyPopup.template = '<div class="invisible"><div class="notify-header" data-labels="bind:innerHTML, notificationlbl" data-notifyevent="listen:mousedown, closePopup"></div><ul class="notify-list" data-notify="foreach: messages, 0, 7"><li data-notify="bind: setStyle, status" data-notifyevent="listen:mousedown, displayComCenter"><div data-notify="bind:setAvatar, author"></div><p><span class="notify-name" data-notify="bind:setFirstname, firstname"></span> : <span class="notify-body" data-notify="bind:setObject, type"></span></p></li></ul></div>';
                
notifyPopup.closePopup = function closePopup(event, node){
        notifyPopup.dom.classList.add("invisible");        
};
                
notifyPopup.showPopup = function showPopup(event, node){
        notifyPopup.dom.classList.remove("invisible");
        messages.reset(user.get("notifications").concat());      
};
                
notifyPopup.displayComCenter = function displayComCenter(event, node){
        var id = node.getAttribute("data-notify_id");
        observer.notify("display-message", id);      
};
                
// close popup after displaying comcenter
observer.watch("display-message", function(){
        notifyPopup.closePopup();
});
                
// init notifications engine
notify.init = function init(){
        notify.reset();
        notifyPopup.dom.classList.add("invisible");
};
                
// reset notify UI
notify.reset = function reset(){
        currentUnread = notify.getUnread();
        notif.set("unread", currentUnread);
        notif.set("newmsg", false);
        messages.reset(user.get("notifications").concat());     
};
                
// watch for new/unread messages
                
user.watchValue("notifications", function(){
        var unread = notify.getUnread(),
              n = user.get("notifications").concat() || [];
                        
        if (unread > currentUnread){
                notif.set("newmsg", true);
                notif.set("unread", unread);
                currentUnread = unread;
                if (user.get("settings") && user.get("settings").notifyPopup) popup.classList.add("show-notify");
        }
        else if (unread < currentUnread){
                notif.set("unread", unread);
                currentUnread = unread;
        }
        messages.reset(n);
});
                
module.exports = notify;
