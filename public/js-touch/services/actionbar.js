/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */ 

define(["OObject", "Bind.plugin", "Event.plugin", "service/config", "Store", "CouchDBView", "CouchDBDocument", "Promise", "service/new2c", "lib/spin.min"],
        function(Widget, Model, Event, Config, Store, CouchDBView, CouchDBDocument, Promise, New2C, Spinner){
                function ActionBarConstructor($type, $parent, $data, $hide){
                
                        var buttons = new Store([]),
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
                            spinner = new Spinner({color:"#9AC9CD", lines:10, length: 10, width: 8, radius:10}).spin();
                        
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
                        
                        this.template = '<div class="actionbar" data-style="bind:setPosition, height" data-action="listen:touchend, hide"><ul class="buttonlist" data-style="bind:setButtons, height" data-buttons="foreach"><li class="actionbutton" data-buttons ="bind:setIcon,icon" data-action="listen:touchstart, press; listen:touchend, action"></li></ul><div id="abspinner"></div></div>';
                        
                        this.hide = function(event, node){
                                $hide(this);        
                        };
                        
                        this.press = function(event, node){
                                node.classList.add("pressed");
                                spinner.el = document.getElementById("abspinner");
                        };
                        
                        this.action = function(event, node){
                                var id = node.getAttribute("data-buttons_id"),
                                    action = buttons.get(id).name;
                                
                                event.stopPropagation();
                                node.classList.remove("pressed");
                                
                                
                                switch(action){
                                        case "delete":
                                                this.deleteItem().then(function(){
                                                        $hide(ui);
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
                                        default:
                                                break;        
                                }
                        };
                        
                        buildButtons = function(type, data){
                                var cdbView; 
                                switch (type){
                                        case "idea":
                                                console.log(data);
                                                cdbView = new CouchDBView();
                                                cdbView.setTransport(transport);
                                                cdbView.sync(db, "ideas", "_view/all",{
                                                        key: '"'+data+'"',
                                                        include_docs: true
                                                })
                                                .then(function(){
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
                                        case "message":
                                                // export vi email -- if you can see it you can email it
                                                buttons.alter("push", {name: "mail", icon:"img/wall/35mail.png"});
                                                buttons.alter("push", {name: "delete", icon:"img/wall/35delete.png"});
                                                break;
                                        case "contact":
                                                // export vi email -- if you can see it you can email it
                                                buttons.alter("push", {name: "mail", icon:"img/wall/35mail.png"});
                                                if (data.type === "user") buttons.alter("push", {name: "twocent", icon:"img/2centDisable.png"})
                                                buttons.alter("push", {name: "delete", icon:"img/wall/35delete.png"});
                                                break;
                                        default:
                                                break;
                                }
                        };
                        
                        this.deleteItem = function deleteItem(){
                                var promise = new Promise(),
                                    cdb = new CouchDBDocument();
                                
                                cdb.setTransport(transport);
                                
                                switch($type){
                                        case "idea":
                                                if ($data.authors.length === 1 && $data.authors[0] === user.get("_id")){
                                                        cdb.sync(Config.get("db"), $data._id)
                                                        .then(function(){
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
                                        case "message":
                                                 var arr = user.get("notifications"), i,
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
                                                var arr = user.get("connections"), now = new Date(), date=[now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                                // if deleted contact is of type user
                                                if ($data.type ==="user"){
                                                        for (i=arr.length-1; i>=0; i--){
                                                                if (arr[i].type === "user" && arr[i].userid === $data.userid) arr.splice(i,1)
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
                        
                        buildButtons($type, $data);
                        
                        /*hide if no action is taken after 5s
                        setTimeout(function(){
                                if ($hide) {$hide(ui);}
                        }, 10000);
                        */
                
                }
                
                return function ActionBarFactory($type, $parent, $data, $hide){
                        ActionBarConstructor.prototype = new Widget();
                        return new ActionBarConstructor($type, $parent, $data, $hide);
                };
        });