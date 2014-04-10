/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "CouchDBDocument", "Promise", "lib/spin.min"],
        function(Widget, Map, Model, Event, Config, Store, Promise, Spinner){
                
                return function new2QConstructor(){
                
                        var _widget = new Widget(),
                            _store = new Store(Config.get("TQTemplate")),
                            _languages = new Store(Config.get("userLanguages")),
                            _user = Config.get("user"),
                            _resetLang = function(){
                                // set language to the user's language by default
                                _store.set("lang", _user.get("lang"));
                                _languages.loop(function(v,i){
                                        (v.name === _user.get("lang").substring(0,2)) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);       
                                });        
                            },
                            _labels = Config.get("labels"),
                            _maxLength = 140,
                            _error = new Store({"error": ""}),
                            spinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -8, left: 340}).spin();
                            
                        _store.setTransport(Config.get("transport"));
                        
                        // reset languages
                        _resetLang();
                        
                        _widget.plugins.addAll({
                                "new2q" : new Model(_store, {
                                        displayLang : function(lang){
                                                var l=lang.substring(0,2);
                                                this.setAttribute("style", "background-image:url('img/flags/"+l+".png');");       
                                        },
                                        setLength : function(type){
                                                if (type === 10) this.setAttribute("maxlength", _maxLength);
                                        }
                                }),
                                "select" : new Model (_languages, {
                                        setBg : function(name){
                                                this.setAttribute("style", "background-image:url('img/flags/"+name+".png');");
                                                //(name === _user.get("lang").substring(0,2)) ? this.classList.add("selected") : this.classList.remove("selected");
                                        },
                                        setSelected : function(selected){
                                                (selected) ? this.classList.add("selected") : this.classList.remove("selected");        
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
                        
                        _widget.template = '<div><div class = "header blue-dark"><span data-labels="bind: innerHTML, createquestion"></span><div class="close-popup" data-new2qevent="listen:mousedown, cancel"></div></div><form class="form"><div class="idealang"><div class="currentlang" data-new2q="bind: displayLang, lang" data-new2qevent="listen: mouseup, showLang"></div><ul class="invisible" data-select="foreach"><li data-select="bind: setBg, name; bind: setSelected, selected" data-new2qevent="listen: mousedown, selectFlag; listen: mouseup, setLang"></li></ul></div><p><textarea class="description input" data-labels="bind:placeholder, questionplaceholder" data-new2q="bind: value, question; bind: setLength, type" data-new2qevent="listen:input, checkLength"></textarea></p><div><span class="errormsg" data-errormsg="bind:setError, error"></span><div class="sendmail" data-new2qevent="listen:mousedown, press; listen:mouseup, upload" data-labels="bind:innerHTML, publishlbl">Publish</div></div></form></div>';
                        
                        _widget.render();
                        _widget.place(Map.get("new2q-popup"));
                        
                        _widget.showLang = function(event, node){
                                event.stopPropagation();
                                event.preventDefault();
                                _widget.dom.querySelector(".idealang ul").classList.remove("invisible");        
                        };
                        
                        _widget.selectFlag = function(event, node){
                                var id;
                                event.stopPropagation();
                                id = parseInt(node.getAttribute("data-select_id"), 10);
                                _languages.loop(function(v,i){
                                        (id === i) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);
                                });               
                        };
                        
                        _widget.setLang = function(event, node){
                                var id;
                                event.stopPropagation();
                                id = node.getAttribute("data-select_id");
                                _store.set("lang", _languages.get(id).name);
                                _widget.dom.querySelector(".idealang ul").classList.add("invisible");        
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                                _widget.dom.querySelector(".description").blur();
                        };
                        
                        _widget.closePopup = function closePopup(){
                                // hide window
                                document.getElementById("new2q-popup").classList.remove("appear");
                                document.getElementById("cache").classList.remove("appear");
                                // reset _store and _error
                                _store.unsync();
                                _store.reset(Config.get("TQTemplate"));
                                _resetLang();
                                _error.reset({"error":""});
                                // hide flag list
                                _widget.dom.querySelector(".idealang ul").classList.add("invisible");     
                        };
                        
                        _widget.cancel = function(event, node){
                                _widget.closePopup();      
                        };
                        
                        _widget.upload = function(event, node){
                                var now = new Date(),
                                    timer,
                                    id = "Q:"+now.getTime();
                                
                                node.classList.remove("pressed");
                                
                                // check for errors (missing fields)
                                if (!_store.get("question")) {_error.set("error", "noquestion");}

                                if (!_error.get("error") && !_store.get("_id")){
                                        
                                        node.classList.add("invisible");
                                        spinner.spin(node.parentNode);
                                        
                                        timer = setInterval(function(){
                                                if (_error.get("error") === _labels.get("uploadinprogress")){
                                                        _error.set("error", _labels.get("uploadinprogress")+"...");
                                                }
                                                else {_error.set("error", _labels.get("uploadinprogress"));}
                                        }, 150);
                                                                       
                                        // fill cdb document
                                        _store.set("author", _user.get("_id"));
                                        _store.set("username", _user.get("username"));
                                        _store.set("creation_date", [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]);
                                        // set language to the user's language by default
                                        _store.set("lang", _user.get("lang"));
                                        
                                        // create document in couchdb and upload
                                        _store.sync(Config.get("db"), id)
                                        .then(function(){
                                                return _store.upload();
                                        })
                                        .then(function(){
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
                                                        if (result !== "ok") {console.log(result);}
                                                        
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
                                                                if (contacts[i].type === "user") {dest.push(contacts[i].userid);}
                                                        }
                                                        json.dest = dest;
                                                        // notification request
                                                        Config.get("transport").request("Notify", json, function(result){
                                                                console.log(result);
                                                        });
                                                        
                                                        spinner.stop();
                                                        node.classList.remove("invisible");
                                                        _widget.closePopup();
                                                });
                                        });
                                } 
                        };
                        
                        _widget.checkLength = function(event, node){
                                (node.value.length >= _maxLength) ? _error.set("error", "lengthexceeded") : _error.set("error", "");        
                        };
                        
                        return _widget;
                };
                
        });