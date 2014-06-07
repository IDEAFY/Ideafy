 /*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "Place.plugin", "service/config", "CouchDBDocument", "lib/spin.min", "service/utils", "Promise", "attach/add"],
        function(Widget, Map, Model, Event, Place, Config, Store, Spinner, Utils, Promise, AddAttachment){
                
                return new function newIdeaConstructor(){
                
                        var _widget = new Widget(),
                              _addAttachmentUI = new AddAttachment(),
                              _transport = Config.get("transport"),
                              _languages = new Store(Config.get("userLanguages")),
                              _user = Config.get("user"),
                              _observer = Config.get("observer"),
                              _store = new Store(Config.get("ideaTemplate")),
                              _alist = new Store([]),
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
                            
                        _store.setTransport(_transport);
                        
                        // reset languages
                        _user.watchValue("lang", function(){
                                _resetLang();
                        });
                        
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
                                "alist": new Model(_alist, {
                                        setType : function(type){
                                                var node = this;
                                                switch(type){
                                                        case "pic":
                                                                break;
                                                        case "drawing":
                                                                break; 
                                                        default:
                                                                node.setAttribute("style",  "background-image:url('img/brainstorm/importDisable100.png');");
                                                                break;
                                                }
                                        },
                                        setBg : function(cat){
                                                var colors = Config.get ("catColors"), node =this;
                                                
                                                node.setAttribute("style", "background-color: transparent;");
                                                
                                                Config.get("cat").forEach(function(val, idx){
                                                        if (val === cat) node.setAttribute("style","background-color:"+ colors[idx]);
                                                });
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
                                "place" : new Place({"AddAttachment": _addAttachmentUI}),
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
                                                        case "noaname":
                                                                this.innerHTML = _labels.get("noaname");
                                                                break;
                                                        case "noacat":
                                                                this.innerHTML = _labels.get("noacat");
                                                                break;
                                                        default:
                                                             this.innerHTML = error;
                                                }
                                                this.setAttribute("style", "color: #F27B3D;");
                                        }
                                }),
                                "newideaevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id="newidea-popup"><div class = "header blue-dark"><span data-labels="bind: innerHTML, createidealbl"></span><div class="close-popup" data-newideaevent="listen:touchstart, cancel"></div></div><form class="form"><div class="idealang"><div class="currentlang" data-newidea="bind: displayLang, lang" data-newideaevent="listen: touchstart, showLang"></div><ul class="invisible" data-select="foreach"><li data-select="bind: setBg, name; bind: setSelected, selected" data-newideaevent="listen: touchstart, selectFlag; listen: touchend, setLang"></li></ul></div><input maxlength=40 type="text" class="input newideatitle" data-labels="bind:placeholder, ideatitleplaceholder" data-newidea="bind: value, title" data-newideaevent="listen: input, resetError"><textarea class="description input" data-labels="bind:placeholder, ideadescplaceholder" data-newidea="bind: value, description" data-newideaevent="listen: input, resetError"></textarea><textarea class="solution input" data-labels="bind:placeholder, ideasolplaceholder" data-newidea="bind: value, solution" data-newideaevent="listen: input, resetError"></textarea><legend class="a-legend" data-labels="bind:innerHTML, alegend"></legend><div data-place="place:AddAttachment"></div><ul class="a-list" data-alist="foreach" style="display:none"><li data-alist="bind:setBg, category"><label class="a-type" data-alist="bind:setType, type"></label><label class="a-name" data-alist="bind:innerHTML, name"></label><div class="a-del" data-newideaevent="listen:touchstart, removeAttachment"></div></li></ul><div class="visibility-input"><input class="visibility-slider" type="range" min=0 max=1 value =1 data-newideaevent="listen:change, toggleVisibility" data-wbtools="bind:setReadonly, readonly"><div class="private" data-newidea="bind: setVisibility, visibility"></div></div><div class="newidea-footer"><div class="publicwarning invisible" data-newidea="bind: setWarning, visibility"><div data-labels="bind: innerHTML, publicwarning"></div><div class="close-warning" data-newideaevent="listen:touchstart, closeWarning"></div></div><span class="errormsg" data-errormsg="bind:setError, error"></span><div class="sendmail" data-newideaevent="listen:touchstart, press; listen:touchend, upload" data-labels="bind:innerHTML, publishlbl">Publish</div></div></form></div>';
                        
                        _widget.reset = function(){
                                document.getElementById("cache").classList.add("appear");
                                
                                _store.reset({
                                        "title": "",
                                        "sessionId": "",
                                        "sessionReplay": false,
                                        "authors": [],
                                        "description": "",
                                        "solution": "",
                                        "creation_date": [],
                                        "character": "",
                                        "problem": "",
                                        "lang": "en-us",
                                        "context": "",
                                        "techno": [],
                                        "type": 6,
                                        "sharedwith": [],
                                        "modification_date": [],
                                        "inspired_by": "",
                                        "visibility": "private",
                                        "votes": [],
                                        "rating": "",
                                        "authornames": "",
                                        "twocents": [],
                                        "attachments":[]
                                });
                                _resetLang();
                                _error.reset({"error":""});
                                _alist.reset([]);
                                
                                _widget.resetAttachment();
                                
                                //reset visibility slider
                                _widget.dom.querySelector(".visibility-slider").value = 1;
                                
                                // hide flag list
                                _widget.dom.querySelector(".idealang ul").classList.add("invisible");
                                
                                // display popup
                                _widget.dom.classList.add("appear");
                                         
                       };
                        
                        _widget.showLang = function(event, node){
                                event.stopPropagation();
                                event.preventDefault();
                                _widget.dom.querySelector(".idealang ul").classList.remove("invisible");        
                        };
                        
                        _widget.selectFlag = function(event, node){
                                var id;
                                event.stopPropagation();
                                event.preventDefault();
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
                        
                        _widget.resetAttachment = function(){
                                _addAttachmentUI.reset("new", "idea", _alist);
                        };
                        
                        _widget.removeAttachment = function(event, node){
                                var idx = parseInt(node.getAttribute("data-alist_id"), 10),
                                      docId = _alist.get(idx).docId;
                                
                                _alist.alter("splice", idx, 1);
                                Utils.deleteAttachmentDoc(docId);
                        };
                        
                        _widget.toggleVisibility = function(event, node){
                                if (node.value === "1"){
                                        _store.set("visibility", "private");
                                }
                                else {
                                        _store.set("visibility", "public");
                                }
                        };
                        
                        _widget.closeWarning = function(event, node){
                                node.parentNode.classList.add("invisible");        
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                                _widget.dom.querySelector(".publicwarning").classList.add("invisible");
                        };
                        
                        _widget.release = function(event, node){
                                node.classList.remove("pressed");
                        };
                        
                        _widget.clearAttachments = function(){
                                // reset _attachment and delete file from server if applicable
                                if (_addAttachmentUI.getFileName()) Utils.deleteAttachmentFile(_addAttachmentUI.getFileName());
                                
                                // reset _alist
                                if (_alist.getNbItems()){
                                        _alist.loop(function(v,i){
                                                Utils.deleteAttachmentDoc(v.docId)
                                                .then(function(){
                                                        return true;     
                                                });
                                        });    
                                };
                                
                                _addAttachmentUI.reset(); 
                         };
                        
                        _widget.closePopup = function closePopup(){
                                // hide window
                                document.getElementById("newidea-popup").classList.remove("appear");
                                document.getElementById("cache").classList.remove("appear");
                                
                                // reset attachment UI and delete file from server if applicable
                                if (_addAttachmentUI.getFileName()) Utils.deleteAttachmentFile(_store.get("_id"), _addAttachmentUI.getFileName());
                                _widget.resetAttachment();
                                
                                // if upload request in progress abort it
                                _addAttachmentUI.abortReq();
                                
                                // reset _store and _error
                                _store.unsync();
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
                                if (_alist.getNbItems()) _widget.clearAttachments();
                                _widget.closePopup();   
                        };
                        
                        _widget.upload = function(event, node){
                                var now = new Date(),
                                    id = _addAttachmentUI.getDocId() || "I:"+now.getTime(),
                                    att = _store.get("attachments") || [],
                                    timer;
                                    
                                node.classList.remove("pressed");
                                // check for errors (missing fields)
                                if (!_store.get("title")) {_error.set("error", "notitle");}
                                else if (!_store.get("description")) {_error.set("error", "nodesc");}
                                else if (!_store.get("solution")) {_error.set("error", "nosol");}

                                if (!_error.get("error")){ 
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
                                        
                                        // add attachments to idea
                                        if (_alist.getNbItems()){
                                                _alist.loop(function(v, i){
                                                        att.push(v);                
                                                });
                                                att.sort(function(x,y){
                                                        if (x.category > y.category) return 1;
                                                        else if (x.category < y.category) return -1;
                                                        else {
                                                                if (x.name > y.name) return 1;
                                                                else return -1; 
                                                        }        
                                                });
                                                _store.set("attachments", att);
                                        }
                                        
                                        // create document in couchdb and upload
                                        _store.sync(Config.get("db"), id)
                                        .then(function(){
                                                return _store.upload();
                                        })
                                        .then(function(){
                                                if (_store.get("visibility") === "public"){
                                                        _observer.notify("NewIdea", id, "public");
                                                        _transport.request("UpdateUIP", {"userid": _user.get("_id"), "type": _store.get("type"), "docId": id, "docTitle": _store.get("title")}, function(result){
                                                                if (result !== "ok") console.log(result);
                                                                spinner.stop();
                                                                node.classList.remove("invisible");
                                                                _widget.closePopup();
                                                                clearInterval(timer);
                                                        });       
                                                }
                                                else{
                                                        _observer.notify("NewIdea", id);
                                                        spinner.stop();
                                                        node.classList.remove("invisible");
                                                        _widget.closePopup();
                                                        clearInterval(timer);
                                                }
                                        });
                                }
                        };
                        
                        ["added", "updated", "deleted"].forEach(function(val){
                                _alist.watch(val, function(){
                                        var node = _widget.dom.querySelector(".a-list");
                                        (_alist.getNbItems()) ? node.setAttribute("style", "display:block;") : node.setAttribute("style", "display:none;");
                                });       
                        });
                        
                        return _widget;
                };
        });