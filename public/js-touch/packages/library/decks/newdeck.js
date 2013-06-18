/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "CouchDBDocument", "lib/spin.min"],
        function(Widget, Map, Model, Event, Config, Store, Spinner){
                
                return function newConstructor(){
                
                        var _widget = new Widget(),
                            _store = new Store({}),
                            _user = Config.get("user"),
                            _labels = Config.get("labels"),
                            _error = new Store({"error": ""}),
                            spinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -8, left: 340}).spin();
                            
                        _store.setTransport(Config.get("transport"));
                        
                        _widget.plugins.addAll({
                                "newdeck" : new Model(_store, {
                                        setVisibility : function(visibility){
                                                if (visibility === "public"){
                                                        this.innerHTML = _labels.get("publicidealbl");
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/publicforslider.png'); background-position: 135px center; background-repeat:no-repeat; background-size: 30px;");
                                                }
                                                else{
                                                        this.innerHTML = _labels.get("privateidealbl");
                                                        this.setAttribute("style", "background-image:url('img/brainstorm/privateforslider.png'); background-position: 15px center; background-repeat:no-repeat; background-size: 20px;");       
                                                }
                                        },
                                        setWarning : function(visibility){
                                                (visibility === "public") ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        }
                                }),
                                "labels" : new Model(_labels),
                                "errormsg" : new Model(_error, {
                                        setError : function(error){
                                                switch (error){
                                                        case "notitle":
                                                             this.innerHTML = _labels.get("titlefield")+ _labels.get("emptyfielderror");
                                                             break;
                                                        case "nodesc":
                                                             this.innerHTML = _labels.get("descriptionfield")+ _labels.get("emptyfielderror");
                                                             break;
                                                        case "nosol":
                                                             this.innerHTML = _labels.get("solutionfield")+ _labels.get("emptyfielderror");
                                                             break;
                                                        default:
                                                             this.innerHTML = error;
                                                }
                                                this.setAttribute("style", "color: #F27B3D;");
                                        }
                                }),
                                "newdeckevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id="newdeck-popup"><div class = "header blue-dark"><span data-labels="bind: innerHTML, createdecklbl"></span><div class="close-popup" data-newdeckevent="listen:touchstart, cancel"></div></div><form class="form"><input maxlength=40 type="text" class="input newideatitle" data-labels="bind:placeholder, decktitleplaceholder" data-newdeck="bind: value, title" data-newdeckevent="listen: input, resetError"><textarea class="description input" data-labels="bind:placeholder, deckdescplaceholder" data-newdeck="bind: value, description" data-newdeckevent="listen: input, resetError"></textarea><legend>Select a deck icon</legend><div class="deckicon"></div><div class="newidea-footer"><span class="errormsg" data-errormsg="bind:setError, error"></span><div class="sendmail" data-newdeckevent="listen:touchstart, press; listen:touchend, upload" data-labels="bind:innerHTML, publishlbl">Publish</div></div></form></div>';
                        
                        _widget.reset = function reset(){
                                _store.reset({
                                        "_id": "",
                                        "type": 9,
                                        "description": "",
                                        "default_lang": _user.get("lang"),
                                        "content": {"characters": [], "contexts": [], "problems": [], "techno": []},
                                        "title": "",
                                        "version": 0,
                                        "date": [], // [YYYY, MM, DD]
                                        "picture_file": "",
                                        "translations": {},
                                        "created_by": _user.get("_id"),
                                        "author": _user.get("username")
                                });        
                        };
                        
                        _widget.show = function show(){
                                _widget.reset();
                                document.getElementById("cache").classList.add("appear");
                                _widget.dom.classList.add("appear");        
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        _widget.closePopup = function closePopup(){
                                // hide window
                                _widget.dom.classList.remove("appear");
                                document.getElementById("cache").classList.remove("appear");
                                // reset _store and _error
                                _store.unsync();
                                _widget.reset();
                                _error.reset({"error":""});       
                        };
                        
                        _widget.resetError = function(event, node){
                                var name;
                                node.scrollTop = 99999;
                                if (_error.get("error")){
                                        if (node.classList.contains("description")) {
                                                name = "nodesc";
                                        }
                                        else if (node.classList.contains("solution")) {
                                                name = "nosol";
                                        }
                                        else {
                                                name = "notitle";
                                        }
                                
                                        if (_error.get("error") === name && node.value) {
                                                _error.set("error", "");
                                        }
                                }
                        };
                        
                        _widget.cancel = function(event, node){
                                _widget.closePopup();   
                        };
                        
                        _widget.upload = function(event, node){
                                var now = new Date(),
                                    id = "D:"+now.getTime();
                                    
                                node.classList.remove("pressed");
                                // check for errors (missing fields)
                                if (!_store.get("title")) {_error.set("error", "notitle");}
                                else if (!_store.get("description")) {_error.set("error", "nodesc");}
                                else if (!_store.get("solution")) {_error.set("error", "nosol");}

                                if (!_error.get("error") && !_store.get("_id")){ 
                                        node.classList.add("invisible");
                                        spinner.spin(node.parentNode);
                                                                   
                                        // fill cdb document
                                        _store.set("date", [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]);
                                        // create document in couchdb and upload
                                        _store.sync(Config.get("db"), id)
                                        .then(function(){
                                                return _store.upload();
                                        })
                                        .then(function(){
                                                spinner.stop();
                                                node.classList.remove("invisible");
                                                _widget.closePopup();
                                        });
                                }
                        };
                        
                        // init
                        _widget.reset();
                        
                        return _widget;
                };
        });