/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../libs/olives"),
      emily = require("../libs/emily"),
      Widget = olives.OObject,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Store = emily.Store,
      Config = require("./config"),
      Map = require("./map");
      
module.exports = new function new2CConstructor(){
                
                        var _widget = new Widget(),
                            _dest = new Store({"userid":"", "username":""}),
                            _user = Config.get("user"),
                            _store = new Store(),
                            _labels = Config.get("labels"),
                            _transport = Config.get("transport"),
                            contact,
                            upload = false,
                            _error = new Store({"error": ""});
                            
                        _widget.seam.addAll({
                                "new2c" : new Model(_store),
                                "dest" : new Model(_dest, {
                                        setHeader : function(username){
                                                this.innerHTML = _labels.get("sendtcprefix") + username + _labels.get("sendtcsuffix");
                                        }
                                }),
                                "labels" : new Model(_labels),
                                "errormsg" : new Model(_error),
                                "new2cevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id="new2c-popup"><div class = "header blue-dark"><span data-dest="bind: setHeader, username"></span><div class="close-popup" data-new2cevent="listen:touchstart, cancel"></div></div><form class="form"><p><textarea class="description input" data-labels="bind:placeholder, twocentplaceholder" data-new2c="bind: value, message"></textarea></p><div><span class="errormsg" data-errormsg="bind:innerHTML, error"></span><div class="sendmail" data-new2cevent="listen:touchstart, press; listen:touchend, upload" data-labels="bind:innerHTML, sendlbl"></div></div></form></div>';
                        
                        _widget.render();
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        _widget.closePopup = function closePopup(){
                                // hide window
                                _widget.dom.classList.remove("appear");
                                document.getElementById("cache").classList.remove("appear");
                                // reset _store, _dest and _error
                                _store.reset();
                                _dest.reset();
                                _error.reset({"error":""});        
                        };
                        
                        _widget.reset = function reset($contact){
                                contact = $contact;
                                _widget.dom.classList.add("appear");
                                document.getElementById("cache").classList.add("appear");
                                _dest.set("userid", contact.userid);
                                _dest.set("username", contact.username);
                                _store.reset({
                                        "author": _user.get("_id"),
                                        "message": "",
                                        "firstname": _user.get("firstname"),
                                        "username": _user.get("username"),
                                        "date": [], // YY, MM, DD
                                        "datemod": "",
                                        "plusones": 0,
                                        "replies": []
                                });
                                upload = false;       
                        };
                        
                        _widget.cancel = function(event, node){
                                _widget.closePopup();      
                        };
                        
                        _widget.upload = function(event, node){
                                var now = new Date(),
                                    json = {},
                                    timer;
                                 
                                if (!_store.get("message")){
                                        _error.set("error", _labels.get("nomessage"));
                                        node.classList.remove("pressed");
                                }
                                else{
                                        upload = true;
                                        timer = setInterval(function(){
                                                if (_error.get("error") === _labels.get("sendinginprogress")){
                                                        _error.set("error", _labels.get("sendinginprogress")+" ...");
                                                }
                                                else _error.set("error", _labels.get("sendinginprogress"));
                                        }, 150);
                                        
                                        // finalize tc content
                                        _store.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                
                                        json.tc = JSON.parse(_store.toJSON());
                                        json.userid = _dest.get("userid");
                                        json.username = _dest.get("username");
                                
                                        _transport.request("SendTwocent", json, function(result){
                                                var contact_tc = contact.twocents || [], i,
                                                    connections = _user.get("connections");
                                                if (result === "ok"){
                                                        // add tc to contact information?
                                                        contact_tc.unshift(json.tc);
                                                        contact.twocents = contact_tc;
                                                        for (i = connections.length-1; i>=0; i--){
                                                                if (connections[i].type === "user" && connections[i].userid === contact.userid){
                                                                        connections.splice(i, 1, contact);
                                                                }
                                                        }
                                                        _user.set("connections", connections);
                                                        _user.upload().then(function(){
                                                                clearInterval(timer);
                                                                node.classList.remove("pressed");
                                                                _widget.closePopup();
                                                        });
                                                                
                                                }
                                                else {
                                                        _error.set("error", "something went wrong - try again later");
                                                        clearInterval(timer);
                                                        node.classList.remove("pressed");
                                                }
                                        });
                                }
                        };
                        
                        return _widget;
};        