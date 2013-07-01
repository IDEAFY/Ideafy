/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBDocument", "Bind.plugin", "Event.plugin", "Store", "service/utils", "lib/spin.min"],
        function(Widget, Config, CouchDBDocument, Model, Event, Store, Utils, Spinner){
           
           return function EditCharConstructor($update, $close){
                
                var editChar = new Widget(),
                    user = Config.get("user"),
                    labels = Config.get("labels"),
                    charTemplate = {
                                "_id": "",
                                "default_lang": user.get("lang"),
                                "title": "",
                                "gender": 0,
                                "age": 0,
                                "firstname": "",
                                "lastname": "",
                                "location": "",
                                "occupation": {
                                        "description": "",
                                        "details": [1,"",""]
                                },
                                "family": {"couple": 0, "children": 0},
                                "leisure_activities": [{"name": "", "comment": ""}, {"name": "", "comment": ""}, {"name": "", "comment": ""}],
                                "interests": [{"name": "", "comment": ""}, {"name": "", "comment": ""}, {"name": "", "comment": ""}],
                                "comments": null,
                                "type": 1,
                                "deck": [],
                                "created_by": user.get("_id"),
                                "created_on": [],
                                "picture_file": ""
                        },
                        model = new CouchDBDocument(charTemplate),
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
                                        console.log(result);
                                });
                        },
                        spinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -7, left: 28}).spin();

                editChar.plugins.addAll({
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
                
                editChar.template = '<div class="cardpopup"><div class="card-detail"><div class="cd-header blue-dark"><div name="title" data-model="bind: setTitle, title" data-editevent="listen: touchstart, clearDefault; listen: blur, updateTitle" contenteditable=true></div></div><div class="cd-picarea"><div class="cardpicture" data-model="bind:setPic, picture_file"></div><div class="cardinfo"><p><span class="cd-agelbl"></span><span data-carddetails="bind:innerHTML, age">age</span><span class="agesuffix" data-label="bind:innerHTML, agelbl"></span><br/><span class="cd-locationlbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, location"></span><br/><span class="cd-joblbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, occupation.description"></span><br/><span class="cd-familylbl"></span><span class="cd-info" data-carddetails="bind: setFamily, family"></span><br/><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit"></span></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, hobbieslbl">Hobbies</span><p class = "charinfo" data-carddetails="bind:setLeisure, leisure_activities">hobbies</p><span class="contentTitle" data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "charinfo" data-carddetails="bind: setInterests, interests">Centers of interest</p><span class="contentTitle" data-label="bind: innerHTML, commentslbl">Comments</span><p class = "charinfo" data-carddetails="bind:setComments, comments"></p></div><div class="cancelmail" data-editevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-editevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div></div>';
               
               editChar.reset = function reset(deckId, id){
                        var now = new Date();
                        _currentDataURL = null;
                        model.setTransport(Config.get("transport"));
                        if (id === "new"){
                                model.reset(charTemplate);
                                model.set("_id", "C:"+now.getTime());
                                model.set("created_on", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                model.set("deck", [deckId]);
                                model.set("picture_file", "img/decks/character.png");       
                        }
                        else{
                                model.sync(Config.get("db"), id)
                                .then(function(){
                                        console.log("card synchronized :", model.toJSON());
                                });        
                        } 
               };
               
               editChar.clearDefault = function clearDefault(event, node){
                        var field = node.getAttribute("name");
                        if (model.get(field) === "") node.innerHTML = "";        
               };
               
               editChar.updateTitle = function updateTitle(event, node){
                        model.set("title", node.innerHTML);        
               };
               
               editChar.cancel = function(event, node){
                        $close();        
               };
                                
               return editChar;         
           };   
        });

