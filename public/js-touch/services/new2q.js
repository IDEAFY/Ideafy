/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "CouchDBStore"],
        function(Widget, Map, Model, Event, Config, Store){
                
                return function new2QConstructor(){
                
                        var _widget = new Widget(),
                            _store = new Store(Config.get("TQTemplate")),
                            _user = Config.get("user"),
                            _labels = Config.get("labels"),
                            _maxLength = 140,
                            upload = false,
                            _error = new Store({"error": ""});
                            
                        _store.setTransport(Config.get("transport"));
                        
                        _widget.plugins.addAll({
                                "new2q" : new Model(_store, {
                                        setLength : function(type){
                                                if (type === 10) this.setAttribute("maxlength", _maxLength);
                                        }
                                }),
                                "labels" : new Model(_labels),
                                "errormsg" : new Model(_error, {
                                        setError : function(error){
                                                switch (error){
                                                        case "noquestion":
                                                             this.innerHTML = _labels.get("noquestion");
                                                             break;
                                                        case "lengthexceeded":
                                                             this.innerHTML = _labels.get("lengthexceeded") + " (" + _maxLength + _labels.get("characters") + ")";
                                                             break;
                                                        default:
                                                             this.innerHTML = error;
                                                }
                                        }
                                }),
                                "new2qevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div><div class = "header blue-dark"><span data-labels="bind: innerHTML, createquestion"></span><div class="close-popup" data-new2qevent="listen:touchstart, cancel"></div></div><form class="form"><p><textarea class="description input" data-labels="bind:placeholder, questionplaceholder" data-new2q="bind: value, question; bind: setLength, type" data-new2qevent="listen:input, checkLength"></textarea></p><div><span class="errormsg" data-errormsg="bind:setError, error"></span><div class="sendmail" data-new2qevent="listen:touchstart, press; listen:touchend, upload" data-labels="bind:innerHTML, publishlbl">Publish</div></div></form></div>';
                        
                        _widget.render();
                        _widget.place(Map.get("new2q-popup"));
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        _widget.closePopup = function closePopup(){
                                // hide window
                                document.getElementById("new2q-popup").classList.remove("appear");
                                document.getElementById("cache").classList.remove("appear");
                                // reset _store and _error
                                _store.unsync();
                                _store.reset(Config.get("TQTemplate"));
                                _error.reset({"error":""});      
                        };
                        
                        _widget.cancel = function(event, node){
                                _widget.closePopup();      
                        };
                        
                        _widget.upload = function(event, node){
                                var now = new Date(),
                                    timer,
                                    id = "Q:"+now.getTime();
                                
                                
                                // check for errors (missing fields)
                                if (!_store.get("question")) _error.set("error", "noquestion")

                                if (!_error.get("error") && !_store.get("_id") && !upload){
                                        
                                        // set upload flag to true
                                        upload = true;
                                        timer = setInterval(function(){
                                                if (_error.get("error") === _labels.get("uploadinprogress")){
                                                        _error.set("error", _labels.get("uploadinprogress")+"...");
                                                }
                                                else _error.set("error", _labels.get("uploadinprogress"));
                                        }, 150);
                                                                       
                                        // fill cdb document
                                        _store.set("author", _user.get("_id"));
                                        _store.set("username", _user.get("username"));
                                        _store.set("creation_date", [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]);
                                        // set language to the user's language by default
                                        _store.set("lang", _user.get("lang"));
                                        
                                        // create document in couchdb and upload
                                        _store.sync(Config.get("db"), id);
                                        setTimeout(function(){
                                                _store.upload();
                                                Config.get("transport").request("UpdateUIP", {"userid": _user.get("_id"), "type": _store.get("type"), "docId": id, "question": _store.get("question")}, function(result){
                                                        var i, contacts = _user.get("connections"), l=contacts.length, dest =[], 
                                                            json = {
                                                                "type" : "2Q+",
                                                                "docId" : id,
                                                                "status" : "unread",
                                                                "date" : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()],
                                                                "author" : _user.get("_id"),
                                                                "username" : _user.get("username"),
                                                                "firstname" : _user.get("firstname"),
                                                                "toList" : "",
                                                                "ccList" : "",
                                                                "object" : _user.get("username")+_labels.get("askednew"),
                                                                "body" : _store.get("question"),
                                                                "signature" : ""
                                                             };
                                                        if (result !== "ok") console.log(result);
                                                        _widget.closePopup();
                                                        clearInterval(timer);
                                                                
                                                        // notifying contacts
                                                        timer = setInterval(function(){
                                                                if (_error.get("error") === _labels.get("notifyingcontacts")){
                                                                        _error.set("error", _labels.get("notifyingcontacts")+"...");
                                                                }
                                                                else _error.set("error", _labels.get("notifyingcontacts"));
                                                        }, 150);
                                                        
                                                        // building recipient list
                                                        for(i=0; i<l; i++){
                                                                if (contacts[i].type === "user") dest.push(contacts[i].userid);
                                                        }
                                                        json.dest = dest;
                                                        // notification request
                                                        Config.get("transport").request("Notify", json, function(result){
                                                                var result = JSON.parse(result);
                                                                console.log(result);
                                                        });
                                                });
                                        }, 500);
                                }
                                else{
                                        node.classList.remove("pressed");        
                                } 
                        };
                        
                        _widget.checkLength = function(event, node){
                                (node.value.length >= _maxLength) ? _error.set("error", "lengthexceeded") : _error.set("error", "");        
                        };
                        
                        return _widget;
                };
                
        });