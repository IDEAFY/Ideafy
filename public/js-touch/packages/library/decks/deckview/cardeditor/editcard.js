/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBDocument", "Bind.plugin", "Event.plugin", "Store", "service/utils"],
        function(Widget, Config, CouchDBDocument, Model, Event, Store, Utils){
           
           return function EditCardConstructor(){
                
                var editCard = new Widget(),
                    user = Config.get("user"),
                    labels = Config.get("labels"),
                    cardTemplate = {
                        "_id": "",
                        "default_lang": user.get("lang"),
                        "title": "",
                        "didYouKnow": "",
                        "deck": [],
                        "category": "",
                        "coefficient": 1,
                        "sources": [],
                        "created_by": user.get("_id"),
                        "created_on": [],
                        "picture_credit": "",
                        "type": null,
                        "picture_file": ""
                    },
                    model = new CouchDBDocument(),
                    _currentDataURL,
                    MIN_WIDTH = 87, MIN_HEIGHT = 87,
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
                     uploadCardPicture = function(){
                                var _url = '/upload',
                                    _fd = new FormData(),
                                    _type = "deckpic",
                                    _dataURL = _currentDataURL;
                                _fd.append("type", _type);
                                _fd.append("dir", model.get("deck")[0]);
                                _fd.append("filename", model.get("_id"));
                                _fd.append("dataString", _dataURL);
                                Utils.uploadFile(_url, _fd, null, function(result){
                                        console.log(result);
                                });
                      };
                
                editCard.plugins.addAll({
                        "label" : new Model(labels),
                        "model" : new Model(model, {
                                setTitle : function(title){
                                                if (title && title !== "") {
                                                        this.innerHTML = title.toUpperCase();
                                                        this.setAttribute("style", "color: white;");
                                                }
                                                else{
                                                        this.innerHTML = labels.get("cardtitle");
                                                        this.setAttribute("style", "color: whitesmoke;");
                                                }
                                },
                                formatTitle : function(type){
                                        switch(type){
                                                case 2:
                                                        this.setAttribute("style", "background: #5f8f28");
                                                        break;
                                                case 3:
                                                        this.setAttribute("style", "background: #bd262c");
                                                        break;
                                                case 4:
                                                        this.setAttribute("style", "background: #f27b3d");
                                                        break;
                                                default:
                                                        break;        
                                        }        
                                },
                                setPic : function(pic){
                                        var json, node = this, style;
                                        console.log(pic);
                                        if (pic.search("img/decks/") > -1){
                                                style =  "background-image: url('" + pic + "');background-repeat: no-repeat; background-position: center center; background-size: cover;";
                                                node.setAttribute("style", style);
                                        }
                                        else{
                                                json = {"dir":model.get("_id"), "filename":pic};
                                                Config.get("transport").request("GetFile", json, function(data){
                                                        node.setAttribute("style", "background-image: url('"+data+"');background-repeat: no-repeat; background-position: center center; background-size: cover;");   
                                                });        
                                        }
                                }

                        }),
                        "editevent" : new Event(editCard)
                });
                
                editCard.template = '<div class="cardpopup"><div class="card-detail"><div class="cd-header blue-dark" data-model="bind:formatTitle, type"><div name="title" data-model="bind: setTitle, title" data-editevent="listen: touchstart, clearDefault" contenteditable=true></div></div><div class="cd-picarea"><div class ="cardpicture" data-model="bind:setPic, picture_file"></div><div class="picinfo"><span class="cd-creditslbl"data-label="bind:innerHTML, picturecredit"></span><input type="text" class="input editcredit" data-model="bind:value, picture_credit"></div><button class="choosepic" data-label="bind:innerHTML, importpiclbl" data-editevent="listen: touchstart, press; listen:touchend, picturePreview"></button><button class="takepic" data-importevent="listen: touchstart, press; listen:touchend, cameraPreview" data-label="bind:innerHTML, importcameralbl"></button></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, dyknow"></span><textarea class="input enterdyknow" data-label="bind: placeholder, enterdyknow" data-model="bind:value,didYouKnow"></textarea><span class="cd-sourcelbl" data-label="bind:innerHTML, source"></span><textarea class="input entersources" data-model="bind: value, sources"></textarea></div><div class="cancelmail" data-editevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-editevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div></div>';
               
               editCard.reset = function reset(deckId, id, type){
                        if (id === "new"){
                                model.reset(cardTemplate);
                                model.set("deck", [deckId]);
                                if (type === "contexts"){
                                        model.set("type", 2);
                                        model.set("picture_file", "img/decks/context.png");
                                }
                                if (type === "problems"){
                                        model.set("type", 3);
                                        model.set("picture_file", "img/decks/problem.png");
                                }  
                                if (type === "techno"){
                                        model.set("type", 4);
                                        model.set("picture_file", "img/decks/techno.png");
                                }        
                        }
                        else{
                                
                        } 
               };
               
               editCard.clearDefault = function clearDefault(event, node){
                        var field = node.getAttribute("name");
                        if (model.get("field") === "") node.innerHTML = "";        
               };
               
               editCard.picturePreview = function(event, node){
                        var source = navigator.camera.PictureSourceType.PHOTOLIBRARY,
                            _img = new Image(),
                            _options = {quality:50, correctOrientation: true, sourceType: source},
                            onSuccess, onFail;
                        
                        onSuccess = function(imageData){
                                _img.src = imageData;
                                setTimeout(function(){
                                        cropImage(resizeImage(_img), function(result){
                                                var el = editCard.dom.querySelector(".cardpicture");
                                                el.setAttribute("style", "background-image: url('"+result+"')");
                                                _currentDataURL = result;
                                                model.set("picture_file", model.get("_id"));
                                                node.classList.remove("pressed");        
                                        });
                                }, 750);
                        };
                        
                        onFail = function(message){
                                alert("error: "+message);
                        };
                        
                        navigator.camera.getPicture(onSuccess, onFail, _options);
               };
               
               editCard.cameraPreview = function(event, node){ 
                        var _img = new Image(),
                            _options = {quality:50, correctOrientation: true},
                            onSuccess, onFail;;
                        
                        onSuccess = function(imageData){
                               _img.src = imageData;
                                setTimeout(function(){
                                        cropImage(resizeImage(_img), function(result){
                                                var el = editCard.dom.querySelector(".cardpicture");
                                                el.setAttribute("style", "background-image: url('"+result+"')");
                                                _currentDataURL = result;
                                                model.set("picture_file", model.get("_id"));
                                                node.classList.remove("pressed");        
                                        });
                                }, 750);
                        }
                        
                        onFail = function(message){
                                alert("error: "+message);
                                node.classList.remove("pressed");
                        }
                        
                        navigator.camera.getPicture(onSuccess, onFail, _options);       
                };
               
               editCard.press = function(event, node){
                        node.classList.add("pressed");        
               };
                
               editCard.cancel = function(event, node){
                        node.classList.remove("pressed");
                        editCard.dom.classList.add("invisible");        
               };
               
               // init
               model.setTransport(Config.get("transport"));
               
               CARDMODEL = model;
                
               return editCard;         
           };   
        });

