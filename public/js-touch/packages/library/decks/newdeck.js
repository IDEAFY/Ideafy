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
                        
                        _widget.plugins.addAll({
                                "newdeck" : new Model(_store),
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
                        
                        _widget.template = '<div id="newdeck-popup"><div class = "header blue-dark"><span data-labels="bind: innerHTML, createdecklbl"></span><div class="close-popup" data-newdeckevent="listen:touchstart, cancel"></div></div><form class="form"><input maxlength=40 type="text" class="input newideatitle" data-labels="bind:placeholder, decktitleplaceholder" data-newdeck="bind: value, title" data-newdeckevent="listen: input, resetError"><textarea class="description input" data-labels="bind:placeholder, deckdescplaceholder" data-newdeck="bind: value, description" data-newdeckevent="listen: input, resetError"></textarea><legend>Select a deck icon</legend><div class="deckicon"><div class="decklogo"></div><div class="importbutton" data-newdeckevent="listen: touchstart, press; listen:touchend, picturePreview" data-labels="bind:innerHTML, importpiclbl"></div></div><div class="newidea-footer"><span class="errormsg" data-errormsg="bind:setError, error"></span><div class="sendmail" data-newdeckevent="listen:touchstart, press; listen:touchend, upload" data-labels="bind:innerHTML, savelbl">Save</div></div></form></div>';
                        
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
                                document.getElementById("cache").classList.add("appear");
                                _widget.dom.classList.add("appear");        
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        _widget.picturePreview = function(event, node){
                                var source = navigator.camera.PictureSourceType.PHOTOLIBRARY,
                                    _img = new Image(),
                                    _options = {quality:50, correctOrientation: true, sourceType: source},
                                    onSuccess, onFail;
                        
                                onSuccess = function(imageData){
                                        _img.src = imageData;
                                        setTimeout(function(){
                                                cropImage(resizeImage(_img), function(result){
                                                        var el = _widget.dom.querySelector(".decklogo");
                                                        el.setAttribute("style", "background-image: url('"+result+"')");
                                                        _currentDataURL = result;
                                                        _store.set("picture_file", "decklogo");
                                                        node.classList.remove("pressed");        
                                                });
                                        }, 750);
                                };
                        
                                onFail = function(message){
                                        alert("error: "+message);
                                };
                        
                                navigator.camera.getPicture(onSuccess, onFail, _options);
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