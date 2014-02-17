/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "CouchDBDocument", "lib/spin.min", "service/utils", "Promise"],
        function(Widget, Map, Model, Event, Config, Store, Spinner, Utils, Promise){
                
                return function newIdeaConstructor(){
                
                        var _widget = new Widget(),
                              _transport = Config.get("transport"),
                              _languages = new Store(Config.get("userLanguages")),
                              _user = Config.get("user"),
                              _cat = Config.get("cat"),
                              _store = new Store(Config.get("ideaTemplate")),
                              _attachment = new Store({
                                    custom : false,
                                    category : "",
                                    name : "",
                                    type : "",
                                    fileName : "",
                                    authors : [_user.get("_id")],
                                    authornames : _user.get("username"),
                                    docId: "",
                                    rating: null,
                                    twocents:[]
                            }),
                            _alist = new Store([]),
                            _progress = new Store({"status": null}),
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
                            spinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -8, left: 340}).spin(),
                            aspinner = new Spinner({color:"#657b99", lines:8, length: 6, width: 3, radius:6, top: -2, left: -2}).spin();
                            
                        _store.setTransport(_transport);
                        _attachment.setTransport(_transport);
                        
                        // reset languages
                        _resetLang();
                        
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
                                        },
                                        setAttachmentCat : function(attachments){
                                                var custom = _user.get("categories") || [], arr, i, l, key,
                                                      res = "<option selected disabled style='display:none;'>"+_labels.get("choosecat")+"</option>";
                                                for (i=0, l=_cat.length; i<l;i++){
                                                        key = _cat[i];
                                                        res+="<option>"+_labels.get(key)+"</option>";
                                                }
                                                if (custom.length){
                                                        for (i=0, l=custom.length; i<l;i++){
                                                                res+="<option>"+custom[i]+"</option>";
                                                        }
                                                }
                                                res+="<option>"+_labels.get("other")+"</option>";
                                                this.innerHTML = res;
                                        }
                                }),
                                "attach": new Model(_attachment, {
                                        show : function(bool){
                                                (bool) ? this.setAttribute("style", "display:inline-block;") : this.setAttribute("style", "display:none;");
                                        },
                                        setContent : function(type){
                                                var node = this;
                                                switch(type){
                                                         case "file":
                                                                node.innerHTML = _attachment.get("fileName");
                                                                break;
                                                        default:
                                                                node.innerHTML = _attachment.get("name");
                                                        break;
                                                }        
                                        },
                                        setName : function(name){
                                                this.value = name;
                                        },
                                        resetCat : function(cat){
                                                var node = this;
                                                if (cat === "") {
                                                        node.selectedIndex = 0;
                                                        [1,2,3,4,5,6].forEach(function(val){
                                                                node.classList.remove("acolor"+val);
                                                                node.classList.add(".acolor");
                                                        });
                                                }
                                        }    
                                }),
                                "progress": new Model(_progress, {
                                        showStatus : function(status){
                                                (status) ? this.setAttribute("value", status) : this.setAttribute("value", 0) ;
                                        },
                                        showVal : function(status){
                                                (status) ? this.innerHTML = status + "%" : this.innerHTML = "";
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
                        
                        _widget.template = '<div><div class = "header blue-dark"><span data-labels="bind: innerHTML, createidealbl"></span><div class="close-popup" data-newideaevent="listen:mousedown, cancel"></div></div><form class="form"><div class="idealang"><div class="currentlang" data-newidea="bind: displayLang, lang" data-newideaevent="listen: mouseup, showLang"></div><ul class="invisible" data-select="foreach"><li data-select="bind: setBg, name; bind: setSelected, selected" data-newideaevent="listen: mousedown, selectFlag; listen: mouseup, setLang"></li></ul></div><input maxlength=40 type="text" class="input newideatitle" data-labels="bind:placeholder, ideatitleplaceholder" data-newidea="bind: value, title" data-newideaevent="listen: input, resetError"><textarea class="description input" data-labels="bind:placeholder, ideadescplaceholder" data-newidea="bind: value, description" data-newideaevent="listen: input, resetError"></textarea><textarea class="solution input" data-labels="bind:placeholder, ideasolplaceholder" data-newidea="bind: value, solution" data-newideaevent="listen: input, resetError"></textarea><legend class="a-legend" data-labels="bind:innerHTML, alegend"></legend><div class="attachments"><select class="acolor" data-newidea="bind:setAttachmentCat, attachments" data-attach="bind:resetCat, category" data-newideaevent="listen: change, selectCat"></select><input maxlength=18 type="text" placeholder="Enter category" class="input custom-cat" data-attach="bind:show, custom" data-newideaevent="listen:input, setCat"><input maxlength=36 type="text" placeholder="Enter name" class="input a-name" data-attach="bind:setName, name" data-newideaevent="listen: input, setName"><ul class="a-list" data-alist="foreach" style="display:none"><li data-alist="bind:setBg, category"><label class="a-type" data-alist="bind:setType, type"></label><label class="a-name" data-alist="bind:innerHTML, name"></label><div class="a-del" data-newideaevent="listen:mousedown, removeAttachment"></div></li></ul><ul class="a-tools" data-attach="bind:show, category"><li class="toolbox-button"><div class="upload-button" name="upload" data-newideaevent="listen:mousedown, press; listen:mouseup, release"><input type="file" class="a-input" data-newideaevent="listen:mouseup, check;listen:change, uploadFile"></div><legend data-labels="bind:innerHTML, filelbl"></legend></li><li class="toolbox-button" style="display:none"><div class="importpic-button" name="import" data-newideaevent="listen:mousedown, press"></div><legend data-labels="bind:innerHTML, imagelbl"></legend></li><li class="toolbox-button" style="display:none"><div class="drawingtool-button" name="drawing" data-newideaevent="listen:mousedown, press"></div><legend data-labels="bind:innerHTML, drawinglbl">Drawing</legend></li></ul><div class="a-preview invisible"><div class="a-content" data-attach="bind:setContent, type"></div><progress class="uploadbar" data-progress="bind:showStatus, status" max=100></progress><div class="uploadval" data-progress="bind:showVal, status"></div><div class="a-button a-confirm" data-attach="bind:show, uploaded" data-newideaevent="listen:mousedown, press; listen: mousedown, aconfirm; listen:mouseup, release">&#10003</div><div class="a-button a-cancel" data-attach="bind:show, uploaded" data-newideaevent="listen:mousedown, press; listen:mousedown, acancel">&#10007</div></div></div><div class="visibility-input"><input class="visibility-slider" type="range" min=0 max=1 value =1 data-newideaevent="listen:change, toggleVisibility" data-wbtools="bind:setReadonly, readonly"><div class="private" data-newidea="bind: setVisibility, visibility"></div></div><div class="newidea-footer"><div class="publicwarning invisible" data-newidea="bind: setWarning, visibility" data-newideaevent="listen:mousedown, closeWarning"><div data-labels="bind: innerHTML, publicwarning"></div><div class="close-warning"></div></div><span class="errormsg" data-errormsg="bind:setError, error"></span><div class="sendmail" data-newideaevent="listen:mousedown, press; listen:mouseup, upload" data-labels="bind:innerHTML, publishlbl">Publish</div></div></form></div>';
                        
                        _widget.render();
                        _widget.place(Map.get("newidea-popup"));
                        
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
                        
                        _widget.selectCat = function(event, node){
                                var cats = Config.get("cat");
                                // if "other" is selected display category input field, else set attachment category value
                                if (node.value ===  node.lastChild.innerHTML){
                                        _attachment.set("custom", true);
                                        for (i=1, l=cats.length; i<=l;i++){
                                                node.classList.remove("acolor"+i); 
                                        };
                                        node.classList.add("acolor");       
                                }
                                else{
                                        node.classList.remove("acolor");
                                        if (_error.get("error") === "noacat") _error.set("error", "");
                                        _attachment.set("custom", false);
                                        _attachment.set("category", cats[node.selectedIndex-1]);
                                        for (i=1, l=cats.length; i<=l;i++){
                                                (node.selectedIndex === i) ? node.classList.add("acolor"+i) : node.classList.remove("acolor"+i);        
                                        };  
                                } 
                        };
                        
                        _widget.setCat = function(event, node){
                                if (_error.get("error") === "noacat" && node.value) _error.set("error", "");
                                _attachment.set("category", node.value);     
                        };
                        
                        _widget.setName = function(event, node){
                                if (_error.get("error") === "noaname" && node.value ) _error.set("error", "");
                                _attachment.set("name", node.value);
                        };
                        
                        _widget.check = function(event, node){
                                node.parentNode.classList.remove("pressed");
                                if (node.files.length) _widget.uploadFile('change', node);
                        };
                        
                        _widget.uploadFile = function(event, node){
                                var _reader = new FileReader(),
                                       _fd = new FormData(),
                                       _now = new Date(),
                                       _id = _store.get("_id") || "I:"+_now.getTime(),
                                       _url = '/upload',
                                       _type = "afile",
                                       _dir = "ideas/"+_id,
                                       fileName = "";
                               
                               if (node.files && node.files.length){
                                       fileName = node.files[0].name;
                                        _store.set("_id", _id);
                                        _widget.dom.querySelector(".a-preview").classList.remove("invisible");
                                        
                                        _attachment.set("fileName", fileName);
                                        _attachment.set("docId", _id);
                                        _attachment.set("type", "file");
                                        if (!_attachment.get("name")) _attachment.set("name", fileName);
                                                               
                                        _reader.onloadend = function(e){
                                                _fd.append("type", _type);
                                                _fd.append("dir", _dir);
                                                _fd.append("userfile", node.files[0]);
                                                _fd.append("filename", fileName);
                                                Utils.uploadFile(_url, _fd, _progress, function(result){
                                                        _attachment.set("uploaded", true);
                                                });
                                        };
                                
                                        _reader.readAsBinaryString(node.files[0]);
                                }
                        };
                        
                        _widget.resetAttachment = function(){
                                // unsync if applicable
                                _attachment.unsync();
                                
                                // clear attachment
                                _attachment.reset({
                                        custom : false,
                                        category : "",
                                        name : "",
                                        type : "",
                                        fileName : "",
                                        authors : [_user.get("_id")],
                                        authornames : [_user.get("username")],
                                        docId: "",
                                        rating: null,
                                        twocents: []
                                });
                                
                                // release buttons
                                _widget.dom.querySelector(".a-confirm").classList.remove("pressed");
                                _widget.dom.querySelector(".a-cancel").classList.remove("pressed");
                               
                                // hide a-preview window
                                _widget.dom.querySelector(".a-preview").classList.add("invisible");        
                        };
                        
                        _widget.deleteAttachmentFile = function(fileName){
                                /*var json={type:"idea"},
                                      promise = new Promise();
                                
                                json.file = _store.get("_id") +"/"+fileName;
                                _transport.request("DeleteAttachment", json, function(res){
                                        (res === "ok") ? promise.fulfill() : promise.reject() ;       
                                });
                                
                                return promise;
                                */
                               return Utils.deleteAttachmentFile("idea", _store.get("_id"), fileName);      
                        };
                        
                        _widget.deleteAttachmentDoc = function(docId){
                                /*
                                var promise = new Promise(),
                                      cdb = new Store();
                                cdb.setTransport(_transport);
                                cdb.sync(Config.get("db"), docId)
                                .then(function(){
                                        return _widget.deleteAttachmentFile(cdb.get("fileName"));       
                                })
                                .then(function(){
                                        return cdb.remove();
                                })
                                .then(function(){
                                        promise.fulfill();
                                });
                                
                                return promise;
                                */
                               return Utils.deleteAttachmentDoc(docId);        
                        };
                        
                        _widget.removeAttachment = function(event, node){
                                var idx = parseInt(node.getAttribute("data-alist_id"), 10),
                                      docId = _alist.get(idx).docId;
                                
                                _alist.alter("splice", idx, 1);
                                _widget.deleteAttachmentDoc(docId);
                        };
                        
                        _widget.aconfirm = function(event, node){
                                var now = new Date(),
                                      id = "A:"+now.getTime();
                                
                                // Attachment needs a name and a category to be uploaded
                               
                               if (_attachment.get("name") && _attachment.get("category")){
                                        aspinner.spin(node);
                                
                                _attachment.sync(Config.get("db"), id)
                                        .then(function(err){
                                                if (err) console.log(err);
                                                return _attachment.upload();
                                        })
                                        .then(function(){
                                                // add to attachment list
                                                _alist.alter("unshift" , {
                                                        docId : id,
                                                        type : _attachment.get("type"),
                                                        category : _attachment.get("category"),
                                                        name : _attachment.get("name"),
                                                        fileName : _attachment.get("fileName"),
                                                        authornames : _attachment.get("authornames")
                                                });
                               
                                                // stop spinner
                                                aspinner.stop(); 
                                        
                                                // reset attachment
                                                _widget.resetAttachment();           
                                        });
                                }
                                else if (!_attachment.get("name")){
                                        _error.set("error", "noaname");       
                                }
                                else{
                                        _error.set("error", "noacat");       
                                }                                 
                        };
                        
                        _widget.acancel = function(event, node){
                                var file = _attachment.get("fileName");
                                
                                _widget.deleteAttachmentFile(file);
                                
                                // reset attachment
                                _widget.resetAttachment();   
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
                                
                                if (node.getAttribute("name") === "upload"){
                                        node.firstChild.click();
                                }
                        };
                        
                        _widget.release = function(event, node){
                                node.classList.remove("pressed");
                        };
                        
                        _widget.clearAttachments = function(){
                                // reset _attachment and delete file from server if applicable
                                if (_attachment.get("fileName")) _widget.deleteAttachmentFile(_attachment.get("fileNname"));
                                _widget.resetAttachment();
                                
                                // reset _alist
                                if (_alist.getNbItems()){
                                        _alist.loop(function(v,i){
                                                console.log(v);
                                                _widget.deleteAttachmentDoc(v.docId)
                                                .then(function(){
                                                        delCount++;
                                                        console.log(delCount);      
                                                });
                                        });    
                                }; 
                         };
                        
                        _widget.closePopup = function closePopup(){
                                var delCount = 0;
                                // hide window
                                document.getElementById("newidea-popup").classList.remove("appear");
                                document.getElementById("cache").classList.remove("appear");
                                
                                // reset _attachment and delete file from server if applicable
                                if (_attachment.get("fileName")) _widget.deleteAttachmentFile(_attachment.get("fileNname"));
                                _widget.resetAttachment();
                                
                                // reset _store and _error
                                _store.unsync();
                                _store.reset(Config.get("ideaTemplate"));
                                _resetLang();
                                _error.reset({"error":""});
                                _alist.reset([]);
                                
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
                                if (_alist.getNbItems()) _widget.clearAttachments();
                                _widget.closePopup();   
                        };
                        
                        _widget.upload = function(event, node){
                                var now = new Date(),
                                    id = _store.get("_id") || "I:"+now.getTime(),
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
                        
                        ["added", "updated", "deleted"].forEach(function(val){
                                _alist.watch(val, function(){
                                        var node = _widget.dom.querySelector(".a-list");
                                        (_alist.getNbItems()) ? node.setAttribute("style", "display:block;") : node.setAttribute("style", "display:none;");
                                });       
                        });
                        
                        return _widget;
                };
        });