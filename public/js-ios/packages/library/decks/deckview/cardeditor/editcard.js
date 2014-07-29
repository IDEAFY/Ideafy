/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "CouchDBDocument", "Bind.plugin", "Event.plugin", "Store", "service/utils", "lib/spin.min"],
        function(Widget, Config, CouchDBDocument, Model, Event, Store, Utils, Spinner){
           
           return function EditCardConstructor($update, $close){
                
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
                    error = new Store({error: ""}),
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
                                    _type = "cardpic",
                                    _dir = "cards",
                                    _dataURL = _currentDataURL;
                                _fd.append("type", _type);
                                _fd.append("dir", _dir);
                                _fd.append("filename", model.get("_id"));
                                _fd.append("dataString", _dataURL);
                                Utils.uploadFile(_url, _fd, null, function(result){
                                        if (result.response !== "ok"){
                                                console.log(result);
                                        }
                                });
                      },
                    spinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -7, left: 28}).spin();
                
                model.setTransport(Config.get("transport"));
                
                editCard.plugins.addAll({
                        "label" : new Model(labels),
                        "model" : new Model(model, {
                                setTitle : function(title){
                                                if (title && title !== "" && title !== "<br>") {
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
                                setSources : function(sources){
                                        if (sources && sources.length){
                                                (sources instanceof Array) ? this.innerHTML = sources.join(", ") : this.innerHTML = sources;
                                        }
                                        else{
                                                this.innerHTML = "";
                                        }        
                                },
                                setPic : function(pic){
                                        var json, node = this, style;
                                        if (pic && pic.search("img/decks/") > -1){
                                                style = "background-image:url('" + pic + "');background-repeat: no-repeat; background-position: center center; background-size: cover;";
                                                node.setAttribute("style", style);
                                        }
                                        else if (pic){
                                                json = {"dir":"cards", "filename":pic};
                                                Config.get("transport").request("GetFile", json, function(data){
                                                        node.setAttribute("style", "background-image: url('"+data+"');background-repeat: no-repeat; background-position: center center; background-size: cover;");   
                                                });        
                                        }
                                }

                        }),
                        "error" : new Model(error),
                        "editevent" : new Event(editCard)
                });
                
                editCard.template = '<div class="cardpopup editcard"><div class="card-detail"><div class="cd-header blue-dark" data-model="bind:formatTitle, type"><div name="title" data-model="bind: setTitle, title" data-editevent="listen: touchstart, clearDefault; listen: blur, updateTitle" contenteditable=true></div></div><div class="cd-picarea"><div class ="cardpicture" data-model="bind:setPic, picture_file"></div><div class="picinfo"><span class="cd-creditslbl"data-label="bind:innerHTML, credits"></span><input type="text" class="input editcredit" data-label="bind: placeholder, picturecredit" data-model="bind:value, picture_credit"></div><button class="choosepic" data-label="bind:innerHTML, importpiclbl" data-editevent="listen: touchstart, press; listen:touchend, picturePreview"></button><button class="takepic" data-editevent="listen: touchstart, press; listen:touchend, cameraPreview" data-label="bind:innerHTML, importcameralbl"></button></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, dyknow"></span><textarea class="input enterdyknow" data-label="bind: placeholder, enterdyknow" data-model="bind:value,didYouKnow"></textarea><span class="cd-sourcelbl" data-label="bind:innerHTML, source"></span><textarea class="input entersources" data-label="bind: placeholder, dyknowsources" data-model="bind: value, sources"></textarea></div><label class="editerror" data-error="bind:innerHTML, error"></label><div class="cancelmail" data-editevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-editevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div></div>';
               
               editCard.reset = function reset(deckId, id, type){
                        var now = new Date();
                        _currentDataURL = null;
                        error.set("error", "");
                        model.reset();
                        if (id === "newcard"){
                                model.reset(cardTemplate);
                                model.set("_id", "C:"+now.getTime());
                                model.set("created_on", [now.getFullYear(), now.getMonth(), now.getDate()]);
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
                                        model.set("picture_file", "img/decks/technology.png");
                                }        
                        }
                        else{
                                model.sync(Config.get("db"), id);        
                        } 
               };
               
               editCard.changeType = function changeType(idx){
                        switch(idx){
                                case 1:
                                        model.set("type", 2);
                                        model.set("picture_file", "img/decks/context.png");
                                        break;
                                case 2:
                                        model.set("type", 3);
                                        model.set("picture_file", "img/decks/problem.png");
                                        break;
                                case 3:
                                        model.set("type", 4);
                                        model.set("picture_file", "img/decks/technology.png");
                                        break;
                                default:
                                        model.set("type", 2);
                                        model.set("picture_file", "img/decks/context.png");
                                        break;
                        }        
               };
               
               editCard.clearDefault = function clearDefault(event, node){
                        var field = node.getAttribute("name");
                        if (model.get(field) === "") node.innerHTML = "";        
               };
               
               editCard.updateTitle = function updateTitle(event, node){
                       var title = node.innerHTML;
                       (model.get("type") === 4) ? title = title.toUpperCase() : title = title.charAt(0).toUpperCase() + title.slice(1);
                        model.set("title", title);        
               };
               
               editCard.picturePreview = function(event, node){
                        var source = navigator.camera.PictureSourceType.PHOTOLIBRARY,
                            _img = new Image(),
                            _options = {quality:50, correctOrientation: true, sourceType: source},
                            onSuccess, onFail,
                            picSpinner = new Spinner({color:"#4d4d4d", lines:12, length: 12, width: 6, radius:10}).spin(),
                            el = editCard.dom.querySelector(".cardpicture");
                        
                        onSuccess = function(imageData){
                                _img.src = imageData;
                                el.setAttribute("style", "background-image: none");
                                picSpinner.spin(el);
                                setTimeout(function(){
                                        cropImage(resizeImage(_img), function(result){
                                                el.setAttribute("style", "background-image: url('"+result+"')");
                                                picSpinner.stop();
                                                _currentDataURL = result;
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
                            onSuccess, onFail,
                            picSpinner = new Spinner({color:"#4d4d4d", lines:12, length: 12, width: 6, radius:10}).spin(),
                            el = editCard.dom.querySelector(".cardpicture");
                        
                        onSuccess = function(imageData){
                                _img.src = imageData;
                                el.setAttribute("style", "background-image: none");
                                picSpinner.spin(el);
                                setTimeout(function(){
                                        cropImage(resizeImage(_img), function(result){
                                                el.setAttribute("style", "background-image: url('"+result+"')");
                                                _currentDataURL = result;
                                                picSpinner.stop();
                                                node.classList.remove("pressed");        
                                        });
                                }, 750);
                        };
                        
                        onFail = function(message){
                                alert("error: "+message);
                                node.classList.remove("pressed");
                        };
                        
                        navigator.camera.getPicture(onSuccess, onFail, _options);       
                };
               
               editCard.press = function(event, node){
                        node.classList.add("pressed");        
               };
                
               editCard.cancel = function(event, node){
                        node.classList.remove("pressed");
                        $close();
                        model.unsync();
                        model.reset({});       
               };
               
               editCard.upload = function(event, node){
                       var now = new Date();
                       node.classList.remove("pressed");
                       error.set("error", "");
                       spinner.spin(node);
                       
                       if (!model.get("title") || model.get("title") === "<br>") {
                               error.set("error", labels.get("titlerequired"));
                       }
                       if (!error.get("error")){
                                if (!model.get("_rev")){
                                        // editCard.checkValidity();
                                        model.sync(Config.get("db"), model.get("_id"))
                                        .then(function(){
                                                editCard.uploadCard();        
                                        });
                                }
                                else{
                                        model.set("last_modified", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                        editCard.uploadCard(node);
                                }
                        }
                        else{
                                spinner.stop();
                        }  
               };
               
               editCard.uploadCard = function uploadCard(node){
                       
                       // if a new picture has been added upload it to the server
                       if (_currentDataURL){
                               uploadCardPicture();
                               model.set("picture_file", model.get("_id"));
                       }
                       
                       // upload card to database
                        model.upload()
                        .then(function(){
                                return $update(model.get("type"), model.get("_id"));
                        })
                        .then(function(){
                                spinner.stop();
                                $close();
                                model.unsync();
                                model.reset({});
                        });
               };
               
               return editCard;         
           };   
        });

