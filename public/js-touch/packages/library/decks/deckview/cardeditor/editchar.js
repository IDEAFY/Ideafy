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
                                "age": null,
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
                                "picture_file": "img/decks/characters.png"
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
                                },
                                setAge : function(age){
                                        if (!age && age !== 0) {
                                                this.innerHTML = "";
                                                this.setAttribute("placeholder", "age");
                                        }
                                },
                                setFamilyStatus : function(couple){
                                        if (couple || couple === 0){
                                                this.selectedIndex = couple;
                                        }
                                },
                                setChildren : function(children){
                                        if (children || children === 0){
                                                this.selectedIndex = children;
                                        }
                                },
                                setSituation : function(details){
                                        if (details && details.length){
                                                this.selectedIndex = details[0];
                                        }
                                },
                                setLeisureName : function(leisure){
                                        var node = this, name = node.getAttribute("name");
                                        [0,1,2].forEach(function(i){
                                                if (leisure[i] && name.search(i)>0) node.value = leisure[i].name;
                                        });       
                                },
                                setLeisureDesc : function(leisure){
                                        var node = this, name = node.getAttribute("name");
                                        [0,1,2].forEach(function(i){
                                                if (leisure[i] && name.search(i)>0) node.value = leisure[i].comment;
                                        });        
                                },
                                setInterestName : function(interests){
                                        var node = this, name = node.getAttribute("name");
                                        [0,1,2].forEach(function(i){
                                                if (interests[i] && name.search(i)>0) node.value = interests[i].name;
                                        });       
                                },
                                setInterestDesc : function(interests){
                                        var node = this, name = node.getAttribute("name");
                                        [0,1,2].forEach(function(i){
                                                if (interests[i] && name.search(i)>0) node.value = interests[i].comment;
                                        });        
                                }
                        }),
                        "error" : new Model(error),
                        "editevent" : new Event(editCard)
                });
                
                editChar.template = '<div class="cardpopup editchar"><div class="card-detail"><div class="cd-header blue-dark"><div name="title" data-model="bind: setTitle, title" data-editevent="listen: touchstart, clearDefault; listen: blur, updateTitle" contenteditable=true></div></div><div class="cd-picarea"><div class="cardpicture" data-model="bind:setPic, picture_file"></div><button class="choosepic" data-label="bind:innerHTML, importpiclbl" data-editevent="listen: touchstart, press; listen:touchend, picturePreview"></button><button class="takepic" data-editevent="listen: touchstart, press; listen:touchend, cameraPreview" data-label="bind:innerHTML, importcameralbl"></button></div><table class="cardinfo"><tr class="charname"><th></th><td><input class="input" name="firstname" type="text" data-label="bind: placeholder,firstnameplaceholder" data-model="bind: value, firstname" data-editevent="listen: input, updateField"></td><td><input class="input" type="text" name="lastname" data-label="bind: placeholder,lastnameplaceholder" data-model="bind: value, lastname" data-editevent="listen: input, updateField"></td></tr><tr class="age"><th></th><td><input class="input" type="number" name="age" maxlength=3 size=4 data-model="bind: setAge, age; bind: value, age" data-editevent="listen: input, updateField"></td></tr><tr class="loc"><th></th><td><input class="input city" name="city" type="text" data-model="bind:value, address.city" data-editevent="listen:input, updateAddress"></td><td><input class="input" name="country" type="text" data-model="bind:value, address.country" data-editevent="listen:input, updateAddress"></td></tr><tr class="family"><th></th><td><select class="status" name="couple" data-model="bind: setFamilyStatus, family.couple" data-editevent="listen:change, updateFamily"><option data-label="bind:innerHTML, single"></option><option data-label="bind:innerHTML, married"></option><option data-label="bind:innerHTML, divorced"></option><option data-label="bind:innerHTML, widow"></option><option data-label="bind:innerHTML, relation"></option></select></td><td><select class="children" name="children" data-model="bind: setChildren, family.children" data-editevent="listen:change, updateFamily"><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8+</option></select><span>enfants</span></td></tr><tr class="occupation"><th></th><td><select class="status" name="situation" data-model="bind: setSituation, occupation.details" data-editevent="listen:change, updateJob"><option data-label="bind:innerHTML, student"></option><option data-label="bind:innerHTML, active"></option><option data-label="bind:innerHTML, retired"></option><option data-label="bind:innerHTML, unemployed"></option><option data-label="bind:innerHTML, stayathome"></option></select></td><td><textarea class="input" type="text" name="job" data-model="bind:value, occupation.description" data-label="bind:placeholder, jobtitle" data-editevent="listen:input, updateJob"></textarea></td></tr></table><div class="cd-contentarea"><legend data-label="bind:innerHTML, hobbieslbl"></legend><label data-label="bind:innerHTML, name"></label><label class="description" data-label="bind:innerHTML, comment"></label><input name="leisure0" class="input" type="text" data-model="bind: setLeisureName, leisure_activities" data-editevent="listen: input, updateLeisureName"><input class="input description" name="leisure0" type="text" data-model="bind: setLeisureDesc, leisure_activities" data-editevent="listen: input, updateLeisureDesc"><input name="leisure1" class="input" type="text"  data-model="bind: setLeisureName, leisure_activities" data-editevent="listen: input, updateLeisureName"><input class="input description" name="leisure1" type="text" data-model="bind: setLeisureDesc, leisure_activities" data-editevent="listen: input, updateLeisureDesc"><input class="input" name="leisure2" type="text" data-model="bind: setLeisureName, leisure_activities" data-editevent="listen: input, updateLeisureName"><input class="input description" name="leisure2" type="text" data-model="bind: setLeisureDesc, leisure_activities" data-editevent="listen: input, updateLeisureDesc"><legend data-label="bind:innerHTML, interestslbl"></legend><label data-label="bind:innerHTML, field"></label><label class="description" data-label="bind:innerHTML, comment"></label><input class="input" name="interest0" type="text" data-model="bind: setInterestName, interests" data-editevent="listen: input, updateInterestName"><input class="input description" name="interest0" type="text" data-model="bind: setInterestDesc, interests" data-editevent="listen: input, updateInterestDesc"><input class="input" name="interest1" type="text" data-model="bind: setInterestName, interests" data-editevent="listen: input, updateInterestName"><input class="input description" name="interest1" type="text" data-model="bind: setInterestDesc, interests" data-editevent="listen: input, updateInterestDesc"><input class="input" name="interest2" type="text" data-model="bind: setInterestName, interests" data-editevent="listen: input, updateInterestName"><input class="input description" name="interest2" type="text" data-model="bind: setInterestDesc, interests" data-editevent="listen: input, updateInterestDesc"></div><div class="cancelmail" data-editevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-editevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div></div>';
               
               editChar.reset = function reset(deckId, id){
                        var now = new Date();
                        _currentDataURL = null;
                        model.setTransport(Config.get("transport"));
                        if (id === "newcard"){
                                model.reset(charTemplate);
                                model.set("_id", "C:"+now.getTime());
                                model.set("created_on", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                model.set("deck", [deckId]);       
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

