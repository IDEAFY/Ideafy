 /**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "CouchDBDocument", "lib/spin.min"],
        function(Widget, Map, Model, Event, Config, Store, Spinner){
                
                return function newIdeaConstructor(){
                
                        var _widget = new Widget(),
                            _store = new Store(Config.get("ideaTemplate")),
                            _languages = new Store(Config.get("userLanguages")),
                            _user = Config.get("user"),
                            _resetLang = function(){
                                // set language to the user's language by default
                                var l = _user.get("lang").substring(0,2);
                                _store.set("lang", l);
                                _languages.loop(function(v,i){
                                        (v.name === l) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);       
                                });        
                            },
                            _labels = Config.get("labels"),
                            _error = new Store({"error": ""}),
                            spinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -8, left: 340}).spin();
                            
                        // CouchDBStore setup    
                        _store.setTransport(Config.get("transport"));
                        
                        // reset languages
                        _resetLang();
                        
                        
                        // Widget setup
                        _widget.plugins.addAll({
                                "newidea" : new Model(_store, {
                                        displayLang : function(lang){
                                                var l=lang.substring(0,2);
                                                this.setAttribute("style", "background-image:url('img/flags/"+l+".png');");       
                                        },
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
                                "newideaevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div><div class = "header blue-dark"><span data-labels="bind: innerHTML, createidealbl"></span><div class="close-popup" data-newideaevent="listen:touchstart, cancel"></div></div><form class="form"><div class="idealang"><div class="currentlang" data-newidea="bind: displayLang, lang" data-newideaevent="listen: touchstart, showLang"></div><ul class="invisible" data-select="foreach"><li data-select="bind: setBg, name; bind: setSelected, selected" data-newideaevent="listen: touchstart, selectFlag; listen: touchend, setLang"></li></ul></div><input maxlength=40 type="text" class="input newideatitle" data-labels="bind:placeholder, ideatitleplaceholder" data-newidea="bind: value, title" data-newideaevent="listen: input, resetError"><textarea class="description input" data-labels="bind:placeholder, ideadescplaceholder" data-newidea="bind: value, description" data-newideaevent="listen: input, resetError"></textarea><textarea class="solution input" data-labels="bind:placeholder, ideasolplaceholder" data-newidea="bind: value, solution" data-newideaevent="listen: input, resetError"></textarea><div class="visibility-input"><input class="visibility-slider" type="range" min=0 max=1 value =1 data-newideaevent="listen:change, toggleVisibility" data-wbtools="bind:setReadonly, readonly"><div class="private" data-newidea="bind: setVisibility, visibility"></div></div><div class="newidea-footer"><div class="publicwarning invisible" data-labels="bind: innerHTML, publicwarning" data-newidea="bind: setWarning, visibility"></div><span class="errormsg" data-errormsg="bind:setError, error"></span><div class="sendmail" data-newideaevent="listen:touchstart, press; listen:touchend, upload" data-labels="bind:innerHTML, publishlbl">Publish</div></div></form></div>';
                        
                        _widget.render();
                        _widget.place(Map.get("newidea-popup"));
                        
                        _widget.showLang = function(event, node){
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
                        
                        _widget.toggleVisibility = function(event, node){
                                if (node.value === "1"){
                                        _store.set("visibility", "private");
                                }
                                else {
                                        _store.set("visibility", "public");
                                }
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                                _widget.dom.querySelector(".publicwarning").classList.add("invisible");
                        };
                        
                        _widget.closePopup = function closePopup(){
                                // hide window
                                document.getElementById("newidea-popup").classList.remove("appear");
                                document.getElementById("cache").classList.remove("appear");
                                document.getElementById("cache").classList.add("invisible");
                                // reset _store and _error
                                _store.unsync();
                                _store.reset(Config.get("ideaTemplate"));
                                _resetLang();
                                _error.reset({"error":""});
                                
                                //reset visibility slider
                                _widget.dom.querySelector(".visibility-slider").value = 1;
                                
                                // hide flag list
                                _widget.dom.querySelector(".idealang ul").classList.add("invisible");       
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
                                    id = "I:"+now.getTime(),
                                    timer;
                                    
                                node.classList.remove("pressed");
                                // check for errors (missing fields)
                                if (!_store.get("title")) {_error.set("error", "notitle");}
                                else if (!_store.get("description")) {_error.set("error", "nodesc");}
                                else if (!_store.get("solution")) {_error.set("error", "nosol");}

                                if (!_error.get("error") && !_store.get("_id")){ 
                                        node.classList.add("invisible");
                                        spinner.spin(node.parentNode);
                                        timer = setInterval(function(){
                                                if (_error.get("error") === _labels.get("uploadinprogress")){
                                                        _error.set("error", _labels.get("uploadinprogress")+"...");
                                                }
                                                else _error.set("error", _labels.get("uploadinprogress"));
                                        }, 100);
                                                                   
                                        // fill cdb document
                                        _store.set("authors", [_user.get("_id")]);
                                        _store.set("authornames", _user.get("username"));
                                        _store.set("creation_date", [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]);
                                        
                                        // create document in couchdb and upload
                                        _store.sync(Config.get("db"), id)
                                        .then(function(){
                                                return _store.upload();
                                        })
                                        .then(function(){
                                                if (_store.get("visibility") === "public"){
                                                        Config.get("transport").request("UpdateUIP", {"userid": _user.get("_id"), "type": _store.get("type"), "docId": id, "docTitle": _store.get("title")}, function(result){
                                                                if (result !== "ok") console.log(result);
                                                                spinner.stop();
                                                                node.classList.remove("invisible");
                                                                _widget.closePopup();
                                                                clearInterval(timer);
                                                        });       
                                                }
                                                else{
                                                        spinner.stop();
                                                        node.classList.remove("invisible");
                                                        _widget.closePopup();
                                                        clearInterval(timer);
                                                }
                                        });
                                }
                        };
                        
                        return _widget;
                };
        });