/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../libs/olives"),
      emily = require("../libs/emily"),
      CouchDBTools = require("../libs/CouchDBTools"),
      Widget = olives.OObject,
      Model = olives(["Bind.plugin"]),
      Event = olives(["Event.plugin"]),
      Config = require("./config"),
      Store = emily.Store,
      CouchDBView = CouchDBTools.CouchDBView,
      CouchDBDocument = CouchDBTools.CouchDBDocument,
      Promise = emily.Promise,
      New2C = require("./new2c"),
      Spinner = require("../libs/spin.min"),
      Confirm = require("./confirm"),
      Utils = require("./utils");

function ActionBarConstructor($type, $parent, $data){

        var   buttons = new Store([]),
                parentHeight = $parent.offsetHeight,
                style = new Store({"height": parentHeight}),
                padding = 10,
                user = Config.get("user"),
                labels = Config.get("labels"),
                observer = Config.get("observer"),
                transport = Config.get("transport"),
                db = Config.get("db"),
                buildButtons,
                ui = this,
                spinner = new Spinner({color:"#9AC9CD", lines:10, length: 10, width: 8, radius:10}).spin(),
                favSpinner = new Spinner({color:"#a0a0a0", lines:10, length: 6, width: 4, radius:6}).spin();
                        
        this.plugins.addAll({
                "buttons" : new Model(buttons, {
                        setIcon : function(icon){
                                                this.setAttribute("style", "background-image:url('"+icon+"');");
                                        }
                }),
                "style" : new Model(style,{
                        setPosition : function(height){
                                                this.setAttribute("style", "height:"+height+"px; margin-top:-"+ (height-padding) +"px;");
                                        },
                        setButtons : function(height){
                                                var mt = Math.floor((height-padding-40)/2);
                                                this.setAttribute("style", "margin-top:"+ mt +"px;");        
                                        }
                }),
                "action" : new Event(this)
        });
                        
        this.template = '<div class="actionbar" data-style="bind:setPosition, height" data-action="listen:mouseup, hide"><ul class="buttonlist" data-style="bind:setButtons, height" data-buttons="foreach"><li class="actionbutton" data-buttons ="bind:setIcon,icon" data-action="listen:mousedown, press; listen:mouseup, action"></li></ul><div id="abspinner"></div></div>';
                        
        this.hide = function(){
                var parent = ui.dom.parentElement;
                parent && parent.removeChild(parent.lastChild);        
        };
                        
        this.getParent = function(){
                return $parent;
        };
                        
         this.press = function(event, node){
                event.stopPropagation();
                event.preventDefault();
                node.classList.add("pressed");
                spinner.el = document.getElementById("abspinner");
        };
                        
        this.action = function(event, node){
                var id = node.getAttribute("data-buttons_id"),
                      action = buttons.get(id).name;
                                
                event.stopPropagation();
                event.preventDefault();
                node.classList.remove("pressed");
                                
                switch(action){
                        case "delete":
                                this.deleteItem().then(function(){
                                        ui.hide();
                                });
                                break;
                        case "edit":
                                this.editItem();
                                break;
                        case "share":
                                this.shareItem();
                                break;
                        case "replay":
                                Config.get("observer").notify("replay-session", $data.sessionId);
                                break;
                        case "mail":
                                this.mailItem();
                                break;
                        case "twocent":
                                this.sendTwocent();
                                break;
                        case "unfav":
                                favSpinner.spin(node);
                                (document.getElementById("public")) ? this.removeFav("public-favorites") : this.removeFav("library-favorites");
                                break;
                        case "addfav":
                                favSpinner.spin(node);
                                (document.getElementById("public")) ? this.addFav("public-favorites") : this.addFav("library-favorites");
                                break;
                        default:
                                break;        
                }
        };
                        
        buildButtons = function(type, data){
                var cdbView; 
                switch (type){
                        case "idea":
                                cdbView = new CouchDBView();
                                cdbView.setTransport(transport);
                                cdbView.sync(db, "ideas", "_view/all",{
                                        key: '"'+data+'"',
                                        include_docs: true
                                })
                                .then(function(){
                                        var pubFav = user.get("public-favorites") || [],
                                              libFav = user.get("library-favorites") || [];
                                        data = cdbView.get(0).doc;
                                        $data = cdbView.get(0).doc;
                                        // actions: edit, delete, email, share, replaysession, add to favorites ?
                                        // edit : allow edits if user is one of the authors
                                        // note: original idea is always saved with session
                                        if (data.authors.indexOf(user.get("_id"))>-1) buttons.alter("push", {name:"edit", icon:"img/wall/35modify.png"});
                                                // if idea is coming from a session display replaysession
                                        if (data.sessionId && (data.sessionId !== "") && (data.sessionId.search("deleted") === -1)){
                                                if (data.sessionReplay || data.authors.indexOf(user.get("_id"))>-1){
                                                        // double check if session is still around (legacy sessions)
                                                        var cdb = new CouchDBView();
                                                        cdb.setTransport(Config.get("transport"));
                                                        cdb.sync(Config.get("db"), "library", "_view/sessioncount", {key: '"'+data.sessionId+'"'})
                                                        .then(function(){
                                                                if (cdb.get(0)){
                                                                        buttons.alter("push", {name:"replay", icon:"img/library/25goToSession.png"});
                                                                }     
                                                        });
                                                }
                                        }
                                                        
                                        // check if idea is part of the user favorites (public or library) and display add/remove button accordingly
                                        if (document.getElementById("public")){
                                                if (pubFav.indexOf(data._id) > -1){
                                                        buttons.alter("push", {name:"unfav", icon:"img/public/unfav-actionbar.png"}); 
                                                }
                                                else{
                                                        buttons.alter("push", {name:"addfav", icon:"img/public/addfav-actionbar.png"});
                                                }
                                        }
                                        else if (document.getElementById("library")){
                                                if (libFav.indexOf(data._id) > -1){
                                                        buttons.alter("push", {name:"unfav", icon:"img/public/unfav-actionbar.png"}); 
                                                }
                                                else{
                                                        buttons.alter("push", {name:"addfav", icon:"img/public/addfav-actionbar.png"});
                                                }        
                                        }
                                                        
                                        // email -- if you can see it you can email it
                                        buttons.alter("push", {name: "mail", icon:"img/wall/35mail.png"});
                                                
                                        // if user has contacts or twitter/facebook/google profiles then share is ok
                                        if ( data.authors.indexOf(user.get("_id")) > -1){
                                                if(user.get("connections") && user.get("connections").length){
                                                        buttons.alter("push", {name:"share", icon:"img/wall/35share.png"});
                                                }
                                                else if (user.get("facebook") || user.get("twitter") || user.get("gplus") || user.get("linkedin")){
                                                        buttons.alter("push", {name:"share", icon:"img/wall/35share.png"});
                                                }
                                        }
                                                
                                        // if user is sole author, idea has not been shared and no twocents, then delete is ok
                                        if (data.authors.length === 1 && data.authors[0] === user.get("_id") && !data.twocents.length && !data.sharedwith.length && data.visibility !== "public") {
                                                buttons.alter("push", {name: "delete", icon:"img/wall/35delete.png"});
                                        }
                                        // if user is not an author but idea has been shared with him, he can delete it from his library
                                        if (data.authors.indexOf(user.get("_id")) === -1 && data.sharedwith.indexOf(user.get("_id")) >-1 && document.getElementById("library")){
                                                buttons.alter("push", {name: "delete", icon:"img/wall/35delete.png"});
                                        }
                                });
                                break;
                        case "deck":
                                var cdb = new CouchDBDocument();
                                cdb.setTransport(transport);
                                cdb.sync(db, $data)
                                .then(function(){
                                        if (cdb.get("created_by") === user.get("_id")){
                                                if(user.get("connections") && user.get("connections").length){
                                                        buttons.alter("push", {name:"share", icon:"img/wall/35share.png"});
                                                }
                                                else if (user.get("facebook") || user.get("twitter") || user.get("gplus") || user.get("linkedin")){
                                                        buttons.alter("push", {name:"share", icon:"img/wall/35share.png"});
                                                }        
                                        }
                                        if ((user.get("taiaut_decks").length + user.get("custom_decks").length) >1){
                                                buttons.alter("push", {name: "delete", icon:"img/wall/35delete.png"});
                                        }        
                                });
                                break;
                        case "message":
                                // export vi email -- if you can see it you can email it
                                buttons.alter("push", {name: "mail", icon:"img/wall/35mail.png"});
                                buttons.alter("push", {name: "delete", icon:"img/wall/35delete.png"});
                                break;
                        case "contact":
                                // export vi email -- if you can see it you can email it
                                buttons.alter("push", {name: "mail", icon:"img/wall/35mail.png"});
                                if (data.type === "user") buttons.alter("push", {name: "twocent", icon:"img/2centDisable.png"});
                                buttons.alter("push", {name: "delete", icon:"img/wall/35delete.png"});
                                break;
                        default:
                                break;
                }
        };
                        
        this.deleteItem = function deleteItem(){
                var promise = new Promise(),
                      cdb = new CouchDBDocument(),
                      scope = this;
                                
                cdb.setTransport(transport);
                                
                switch($type){
                        case "idea":
                                if ($data.authors.length === 1 && $data.authors[0] === user.get("_id")){
                                        cdb.sync(Config.get("db"), $data._id)
                                        .then(function(){
                                        // check if there are attachments to this idea and if yes remove them
                                                var att = cdb.get("attachments") || [];
                                                if (att.length){
                                                        att.forEach(function(val){
                                                                Utils.deleteAttachmentDoc(val.docId);        
                                                        });
                                                }
                                                return cdb.remove();
                                        })
                                        .then(function(){
                                                promise.fulfill();
                                        });
                                }
                                else {
                                        transport.request("RemoveFromLibrary", {"id": $data._id, "userid": user.get("_id")}, function(result){
                                                promise.fulfill();
                                        });       
                                }
                                break;
                        case "deck":
                                if (user.get("active_deck") === $data){
                                        alert(labels.get("cannotdelactivedeck"));
                                        scope.hide();
                                }
                                else{
				    Confirm.reset(labels.get("deldeckwarning"), function(decision){
                                                var spinner = new Spinner({lines:10, length: 20, width: 8, radius:10}).spin();
                                                if (!decision) {
                                                        Confirm.hide();
                                                        scope.hide();
                                                }
                                                else{
                                                        Confirm.hide();
                                                        spinner.spin(document.getElementById("deckview"));
                                                        // if deck is an ideafy deck simply remove from taiaut_decks field
                                                        if (user.get("taiaut_decks").indexOf($data) > -1){
                                                                var arr = user.get("taiaut_decks");
                                                                arr.splice(arr.indexOf($data), 1);
                                                                user.set("taiaut_decks", arr);
                                                                user.upload()
                                                                .then(function(){
                                                                        spinner.stop();
                                                                        promise.fulfill();
                                                                });
                                                        }
                                                        else{
                                                                cdb.sync(db, $data)
                                                                .then(function(){
                                                                        // if deck has been shared with user simply remove user id from sharedwith field
                                                                        var sw = cdb.get("sharedwith") || [], cd = user.get("custom_decks").concat();
                                                                
                                                                        // if deck has been shared with user simply remove user id from sharedwith field
                                                                        if (sw.length && sw.indexOf(user.get("_id")) > -1){
                                                                                sw.splice(sw.indexOf(user.get("_id")), 1);
                                                                                cdb.set("sharedwith", sw);
                                                                                cdb.upload
                                                                                .then(function(){
                                                                                        cd.splice(cd.indexOf($data), 1);
                                                                                        user.set("custom_decks", cd);
                                                                                        return user.upload();
                                                                                })
                                                                                .then(function(){
                                                                                        spinner.stop();
                                                                                        promise.fulfill();
                                                                                });
                                                                        }
                                                                
                                                                        // if user if author of deck then delete deck and as appropriate its contents from database
                                                                        else if (cdb.get("created_by") === user.get("_id")){
                                                                                transport.request("DeleteDeck", {"id": $data, "userid": user.get("_id")}, function(result){
                                                                                        if (result === "ok"){
                                                                                                cd.splice(cd.indexOf($data), 1);
                                                                                                user.set("custom_decks", cd);
                                                                                                user.upload()
                                                                                                .then(function(){
                                                                                                        spinner.stop();
                                                                                                        promise.fulfill();
                                                                                                });
                                                                                        }
                                                                                        else{
                                                                                                console.log(result);
                                                                                        }
                                                                                });        
                                                                        }       
                                                                });
                                                        }
                                                }
                                        }, "importcard-confirm");
                                        Confirm.show();
                                }
                                break;
                        case "message":
                                var arr = user.get("notifications").concat(), i,
                                      index;
                        
                                for (i=0, l=arr.length; i<l; i++){
                                        if (JSON.stringify(arr[i]) === JSON.stringify($data)){
                                                index = i;
                                                break;
                                        }
                                }
                                arr.splice(index, 1);
                                user.set("notifications", arr);
                                user.upload();
                                break;
                        case "contact":
                                var arr = user.get("connections").concat(), now = new Date(), date=[now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                // if deleted contact is of type user
                                if ($data.type ==="user"){
                                        for (i=arr.length-1; i>=0; i--){
                                                if (arr[i].type === "user" && arr[i].userid === $data.userid) arr.splice(i,1);
                                                else if (arr[i].type === "group"){
                                                        var grp = arr[i].contacts;
                                                        for (j=grp.length-1; j>=0; j--){
                                                                if (grp[j].userid === $data.userid) grp.splice(j,1);
                                                        }
                                                }
                                        }
                                }
                                else{
                                        for (i=arr.length-1; i>=0; i--){
                                                if (arr[i].username === $data.username) arr.splice(i, 1);
                                        }
                                }
                                user.set("connections", arr);
                                // if contact is of type user add contact deletion to news
                                if ($data.type === "user") user.get("news").unshift({type: "CX-", date:date, content:{userid: $data.userid, username: $data.username}});
                                user.upload()
                                .then(function(){
                                        // if contact is a user notify the other end that the contact is terminated.
                                        if ($data.type === "user"){
                                                var now = new Date(),
                                                      json = {
                                                                "dest":[$data.userid],
                                                                "date" : date,
                                                                "original":"",
                                                                "type": "CXCancel",
                                                                "author": user.get("_id"),
                                                                "username" : user.get("username"),
                                                                "firstname" : user.get("firstname"),
                                                                "toList": $data.username,
                                                                "ccList": "",
                                                                "object": user.get("username")+ labels.get("canceledCX"),
                                                                "body": "",
                                                                "signature": "",
                                                                "contactInfo": { 
                                                                        "firstname": user.get("firstname"),
                                                                        "lastname": user.get("lastname"),
                                                                        "userid": user.get("_id"),
                                                                        "username": user.get("username"),
                                                                        "intro": user.get("intro"), 
                                                                        "type": "user"
                                                                }
                                                        };
                                                //send response
                                                transport.request("Notify", json, function(result){
                                                        console.log(result);
                                                });
                                        }
                                        observer.notify("contact-deleted");        
                                });
                                break;
                        default:
                                break;        
                }
                return promise;
        };
                        
        this.editItem = function editItem(){
                // if type is "idea" we need to differentiate between public and private lists
                switch($type){
                        case "idea":
                                (document.getElementById("public")) ? observer.notify("public-edit", $data._id) : observer.notify("library-edit", $data._id);
                                break;
                        default:
                                break;        
                }
                spinner.stop();
        };
                        
        this.mailItem = function mailItem(){
                // if type is "idea" we need to differentiate between public and private lists
                switch($type){
                        case "idea":
                                (document.getElementById("public")) ? observer.notify("public-sendmail", $data) : observer.notify("library-sendmail", $data);
                                break;
                        case "message":
                                break;
                        case "contact":
                                //go to new Message and pre-set toField
                                observer.notify("message-contact", $data);
                                break;
                        default:
                                break;        
                } 
        };
                        
        this.shareItem = function shareItem(){
                // if type is "idea" we need to differentiate between public and private lists
                switch($type){
                        case "idea":
                                (document.getElementById("public")) ? observer.notify("public-share", $data) : observer.notify("library-share", $data);
                                break;
                        case "deck":
                                observer.notify("deck-share", $data);
                                break;
                        case "message":
                                break;
                        case "contact":
                                break;
                        default:
                                break;        
                }        
        };
                        
        this.sendTwocent = function sendTwocent(){
                New2C.reset($data);       
        };
                        
        this.addFav = function(list){
                var fav, update;
                (user.get(list)) ? fav = user.get(list).concat() : fav = [];
                if (fav.length<100){
                        fav.push($data._id);
                        user.set(list, fav);
                        user.upload()
                        .then(function(){
                                favSpinner.stop();
                                alert(labels.get("addedfav"));
                                ui.hide();
                        });
                }
                else{
                        favSpinner.stop();
                        alert(labels.get("maxfavsize"));
                        ui.hide();     
                }
        };
                        
        this.removeFav = function(list){
                var fav;
                (user.get(list)) ? fav = user.get(list).concat() : fav = [];
                fav.splice(fav.indexOf($data._id), 1);
                user.set(list, fav);
                user.upload()
                .then(function(){
                        favSpinner.stop();
                        alert(labels.get("removedfav"));
                        ui.hide();
                });       
        };
                        
        buildButtons($type, $data);
                        
        /*hide if no action is taken after 5s
                        setTimeout(function(){
                                if ($hide) {$hide(ui);}
                        }, 10000);
                        */                
};
                
module.exports = function ActionBarFactory($type, $parent, $data){
        ActionBarConstructor.prototype = new Widget();
        return new ActionBarConstructor($type, $parent, $data);
};
