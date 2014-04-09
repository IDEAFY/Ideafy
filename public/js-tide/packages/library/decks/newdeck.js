/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "CouchDBDocument", "lib/spin.min", "service/utils"],
        function(Widget, Map, Model, Event, Config, Store, Spinner, Utils){
                
                return function newConstructor($onEnd){
                        
                        var _widget = new Widget(),
                            _store = new Store({}),
                            _user = Config.get("user"),
                            _languages = new Store(Config.get("userLanguages")),
                            _resetLang = function(){
                                // set language to the user's language by default
                                var l = _user.get("lang").substring(0,2);
                                _store.set("default_lang", l);
                                _languages.loop(function(v,i){
                                        (v.name === l) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);       
                                });        
                            },
                            _transport = Config.get("transport"),
                            _labels = Config.get("labels"),
                            _error = new Store({"error": ""}),
                            spinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -8, left: 340}).spin(),
                            _currentDataURL,
                            MIN_WIDTH = 60, MIN_HEIGHT = 60,
                            resizeImage = function(img){
                                var _width, _height, canvas = document.createElement('canvas'), ctx = canvas.getContext("2d");
                                
                                // resize image if needed
                                _width = img.width;
                                _height = img.height;
                                if (_width<_height){
                                        _height *= MIN_WIDTH / _width;
                                        _width = MIN_WIDTH;
                                
                                }
                                else {
                                        _width *= MIN_HEIGHT / _height;
                                        _height = MIN_HEIGHT;
                                }
                            
                                canvas.width = _width;
                                canvas.height = _height;
                                ctx.drawImage(img, 0, 0, _width, _height);
                                return canvas.toDataURL("image/png");
                            },
                            cropImage = function(dataURL, onEnd){
                                var image = new Image(),
                                    canvas = document.createElement('canvas'),
                                    ctx = canvas.getContext('2d'),
                                    dw = MIN_WIDTH,
                                    dh = MIN_HEIGHT,
                                    sx, sy;
                                image.src = dataURL;
                                setTimeout(function(){
                                        canvas.width = dw;
                                        canvas.height = dh;
                                        sx = Math.floor(Math.max(0, (image.width-dw)/2));
                                        sy = Math.floor(Math.max(0, (image.height-dh)/2));
                                        ctx.drawImage(image, sx, sy, dw, dh, 0, 0, dw, dh);
                                        onEnd(canvas.toDataURL("image/png"));
                                }, 300);
                            },
                            uploadDeckIcon = function(){
                                var _url = '/upload',
                                    _fd = new FormData(),
                                    _type = "deckpic",
                                    _dir = "decks",
                                    _dataURL = _currentDataURL;
                                _fd.append("type", _type);
                                _fd.append("dir", _dir);
                                _fd.append("filename", _store.get("_id"));
                                _fd.append("dataString", _dataURL);
                                Utils.uploadFile(_url, _fd, null, function(result){
                                        console.log(result);
                                });
                            };
                            
                        _store.setTransport(Config.get("transport"));
                        // reset languages
                        _resetLang();
                        
                        _widget.plugins.addAll({
                                "newdeck" : new Model(_store,{
                                        displayLang : function(lang){
                                                var l=lang.substring(0,2);
                                                this.setAttribute("style", "background-image:url('img/flags/"+l+".png');");       
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
                                                        default:
                                                             this.innerHTML = error;
                                                }
                                                this.setAttribute("style", "color: #F27B3D;");
                                        }
                                }),
                                "newdeckevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div id="newdeck-popup"><div class = "header blue-dark"><span data-labels="bind: innerHTML, createdecklbl"></span><div class="close-popup" data-newdeckevent="listen:mousedown, cancel"></div></div><form class="form"><div class="idealang"><div class="currentlang" data-newdeck="bind: displayLang, default_lang" data-newdeckevent="listen: mouseup, showLang"></div><ul class="invisible" data-select="foreach"><li data-select="bind: setBg, name; bind: setSelected, selected" data-newdeckevent="listen: mousedown, selectFlag; listen: mouseup, setLang"></li></ul></div><input maxlength=40 type="text" class="input newideatitle" data-labels="bind:placeholder, decktitleplaceholder" data-newdeck="bind: value, title" data-newdeckevent="listen: input, resetError"><textarea class="description input" data-labels="bind:placeholder, deckdescplaceholder" data-newdeck="bind: value, description" data-newdeckevent="listen: input, resetError"></textarea><legend data-labels="bind: innerHTML, setdecklogo"></legend><div class="deckicon"><div class="decklogo"></div><span class="importbutton"><input type="file" enctype="multipart/form-data" accept = "image/gif, image/jpeg, image/png" data-newdeckevent="listen: mousedown, selectpress; listen: change, uploadnDisplay"><div data-labels="bind:innerHTML, importlbl" data-newdeckevent="listen: mousedown, press; listen: mouseup, release"></div></span></div><div class="newidea-footer"><span class="errormsg" data-errormsg="bind:setError, error"></span><div class="sendmail" data-newdeckevent="listen:mousedown, press; listen:mouseup, upload" data-labels="bind:innerHTML, savelbl">Save</div></div></form></div>';
                        
                        _widget.reset = function reset(edit){
                                _store.reset({
                                        "_id": "",
                                        "type": 9,
                                        "description": "",
                                        "default_lang": _user.get("lang"),
                                        "content": {"characters": ["newcard"], "contexts": ["newcard"], "problems": ["newcard"], "techno": ["newcard"]},
                                        "title": "",
                                        "version": 0,
                                        "date": [], // [YYYY, MM, DD]
                                        "picture_file": "",
                                        "translations": {},
                                        "created_by": _user.get("_id"),
                                        "author": _user.get("username"),
                                        "public": false,
                                        "sharedwith": []
                                });
                                _currentDataURL = null;       
                        };
                        
                        _widget.show = function show(){
                                _widget.reset();
                                document.querySelector("#library .cache").classList.add("appear");
                                _widget.dom.classList.add("appear");        
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
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
                                _store.set("default_lang", _languages.get(id).name);
                                _widget.dom.querySelector(".idealang ul").classList.add("invisible");        
                        };
                        
                        _widget.selectpress = function(event, node){
                                node.value = "";       
                        };
                        
                        _widget.release = function(event, node){
                                setTimeout(function(){
                                        node.classList.remove("pressed");
                                }, 300);
                        };
                        
                        _widget.uploadnDisplay = function(event, node){
                                var _reader = new FileReader(),
                                    _img = new Image(),
                                    el = _widget.dom.querySelector(".decklogo"),
                                    picSpinner = new Spinner({color:"#4d4d4d", lines:12, length: 12, width: 6, radius:10}).spin();
                                
                                el.setAttribute("style", "background-image: none;");
                                picSpinner.spin(el);
                                // first read the file to memory, once loaded resize and display upload button
                                _reader.onload = function(e) {
                                        _img.src = e.target.result;
                                        // timeout is needed to render image and obtain its dimensions
                                        setTimeout(function(){
                                                cropImage(resizeImage(_img), function(result){
                                                        el.setAttribute("style", "background-image: url('"+result+"')");
                                                        picSpinner.stop();
                                                        
                                                        _currentDataURL = result;
                                                        _store.set("picture_file", "decklogo");         
                                                });
                                                }, 300);
                                };
                                _reader.readAsDataURL(node.files[0]);
                        };
                        
                        _widget.closePopup = function closePopup(){
                                // hide window
                                _widget.dom.classList.remove("appear");
                                document.querySelector("#library .cache").classList.remove("appear");
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

                                if (!_error.get("error") && !_store.get("_id")){ 
                                        node.classList.add("invisible");
                                        spinner.spin(node.parentNode);
                                                                   
                                        // fill cdb document
                                        _store.set("_id", id);
                                        _store.set("date", [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]);
                                        
                                        // create document in couchdb and upload
                                        _store.sync(Config.get("db"), id)
                                        .then(function(){
                                                // upload deck logo if applicable
                                                if (_store.get("picture_file")){
                                                        uploadDeckIcon();
                                                }
                                                return _store.upload();
                                        })
                                        .then(function(){
                                                // notify deck widget of the new deck
                                                $onEnd("new", id);
                                                // add new deck to list of custom decks for this user
                                                var _decks = _user.get("custom_decks") || [];
                                                _decks.unshift(id);
                                                _user.set("custom_decks", _decks);
                                                return _user.upload();
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