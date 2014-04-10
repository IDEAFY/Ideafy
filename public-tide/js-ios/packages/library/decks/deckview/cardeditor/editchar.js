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
                                "comments": [],
                                "type": 1,
                                "deck": [],
                                "created_by": user.get("_id"),
                                "created_on": [],
                                "picture_file": "img/decks/characters.png",
                                "picture_credit": ""
                        },
                        model = new CouchDBDocument(),
                        charUpdates = {},
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
                
                editChar.plugins.addAll({
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
                                setCity : function(loc){
                                        var city = "";
                                        if (loc && loc.length){
                                                city = loc.split(",")[0].trim();
                                                this.value = city;
                                        }
                                        else{
                                                this.value = "";
                                        }       
                                },
                                setCountry: function(loc){
                                        var country = "";
                                        if (loc && loc.length){
                                                country = loc.split(',').slice(1,loc.length).join().trim();
                                                this.value = country;
                                        }
                                        else{
                                                this.value = "";
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
                                setChildrenlbl : function(children){
                                        (children && children === "1") ? this.innerHTML = labels.get("onechildlbl") : this.innerHTML = labels.get("childrenlbl");        
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
                                },
                                setComment: function(comments){
                                        var node = this, name = node.getAttribute("name");
                                        [0,1].forEach(function(i){
                                                if (comments && comments[i] && name.search(i)>0) node.value = comments[i];
                                        });        
                                }
                        }),
                        "error" : new Model(error),
                        "editevent" : new Event(editChar)
                });
                
                editChar.template = '<div class="cardpopup editchar"><div class="card-detail"><div class="cd-header blue-dark"><div name="title" data-model="bind: setTitle, title" data-editevent="listen: touchstart, clearDefault; listen: blur, updateTitle" contenteditable=true></div></div><div class="cd-picarea"><div class="cardpicture" data-model="bind:setPic, picture_file"></div><button class="choosepic" data-label="bind:innerHTML, importpiclbl" data-editevent="listen: touchstart, press; listen:touchend, picturePreview"></button><button class="takepic" data-editevent="listen: touchstart, press; listen:touchend, cameraPreview" data-label="bind:innerHTML, importcameralbl"></button><input class="input" type="text" name="picture_credit" data-label="bind: placeholder,picturecredit" data-model="bind: value, picture_credit" data-editevent="listen: input, updateField"></div><table class="cardinfo"><tr class="charname"><th></th><td><input class="input" name="firstname" type="text" data-label="bind: placeholder,firstnameplaceholder" data-model="bind: value, firstname" data-editevent="listen: input, updateField"></td><td><input class="input" type="text" name="lastname" data-label="bind: placeholder,lastnameplaceholder" data-model="bind: value, lastname" data-editevent="listen: input, updateField"></td></tr><tr class="age"><th></th><td><input class="input" type="number" name="age" maxlength=3 size=4 data-model="bind: setAge, age; bind: value, age"></td></tr><tr class="loc"><th></th><td><input class="input city" name="city" type="text" data-label="bind:placeholder, city" data-model="bind:setCity, location" data-editevent="listen:input, updateLocation"></td><td><input class="input" name="country" type="text" data-label="bind:placeholder, countrystate" data-model="bind:setCountry, location" data-editevent="listen:input, updateLocation"></td></tr><tr class="family"><th></th><td><select class="status" name="couple" data-model="bind: setFamilyStatus, family.couple" data-editevent="listen:change, updateFamily"><option data-label="bind:innerHTML, single"></option><option data-label="bind:innerHTML, married"></option><option data-label="bind:innerHTML, divorced"></option><option data-label="bind:innerHTML, widow"></option><option data-label="bind:innerHTML, relation"></option></select></td><td><select class="children" name="children" data-model="bind: setChildren, family.children" data-editevent="listen:change, updateFamily"><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8+</option></select><span data-model="bind:setChildrenlbl, family.children"></span></td></tr><tr class="occupation"><th></th><td><select class="status" name="situation" data-model="bind: setSituation, occupation.details" data-editevent="listen:change, updateJob"><option data-label="bind:innerHTML, student"></option><option data-label="bind:innerHTML, active"></option><option data-label="bind:innerHTML, retired"></option><option data-label="bind:innerHTML, unemployed"></option><option data-label="bind:innerHTML, stayathome"></option></select></td><td><textarea class="input" type="text" name="jobdesc" data-label="bind: placeholder, desc" data-model="bind:value, occupation.description" data-label="bind:placeholder, jobtitle" data-editevent="listen:input, updateJob"></textarea></td></tr></table><div class="cd-contentarea"><legend data-label="bind:innerHTML, hobbieslbl"></legend><input name="leisure0" class="input inputleft" type="text" data-label="bind:placeholder, name" data-model="bind: setLeisureName, leisure_activities" data-editevent="listen: input, updateLeisureName"><input class="input description" name="leisure0" type="text" data-label="bind:placeholder, desc" data-model="bind: setLeisureDesc, leisure_activities" data-editevent="listen: input, updateLeisureDesc"><input name="leisure1" class="input inputleft" type="text"  data-label="bind:placeholder, name" data-model="bind: setLeisureName, leisure_activities" data-editevent="listen: input, updateLeisureName"><input class="input description" name="leisure1" type="text" data-label="bind:placeholder, desc" data-model="bind: setLeisureDesc, leisure_activities" data-editevent="listen: input, updateLeisureDesc"><input class="input inputleft" name="leisure2" type="text" data-label="bind:placeholder, name" data-model="bind: setLeisureName, leisure_activities" data-editevent="listen: input, updateLeisureName"><input class="input description" name="leisure2" type="text" data-label="bind:placeholder, desc" data-label="bind:placeholder, name" data-model="bind: setLeisureDesc, leisure_activities" data-editevent="listen: input, updateLeisureDesc"><legend data-label="bind:innerHTML, interestslbl"></legend><input class="input inputleft" name="interest0" type="text" data-label="bind:placeholder, name" data-model="bind: setInterestName, interests" data-editevent="listen: input, updateInterestName"><input class="input description" name="interest0" type="text" data-label="bind:placeholder, desc" data-model="bind: setInterestDesc, interests" data-editevent="listen: input, updateInterestDesc"><input class="input inputleft" name="interest1" type="text" data-label="bind:placeholder, name" data-model="bind: setInterestName, interests" data-editevent="listen: input, updateInterestName"><input class="input description" name="interest1" type="text" data-label="bind:placeholder, desc" data-model="bind: setInterestDesc, interests" data-editevent="listen: input, updateInterestDesc"><input class="input inputleft" name="interest2" type="text" data-label="bind:placeholder, name" data-model="bind: setInterestName, interests" data-editevent="listen: input, updateInterestName"><input class="input description" name="interest2" type="text" data-label="bind:placeholder, desc" data-model="bind: setInterestDesc, interests" data-editevent="listen: input, updateInterestDesc"><legend data-label="bind:innerHTML, commentslbl"></legend><input class="input" name="comment0" type="text" data-label="bind:placeholder, addcomment" data-model="bind: setComment, comments" data-editevent="listen: input, updateComments"><input class="input" name="comment1" type="text" data-label="bind:placeholder, addcomment" data-model="bind: setComment, comments" data-editevent="listen: input, updateComments"></div><label class="editerror" data-error="bind:innerHTML, error"></label><div class="cancelmail" data-editevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-editevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl"></div></div></div>';
               
               editChar.reset = function reset(deckId, id){
                        var now = new Date();
                        _currentDataURL = null;
                        error.set("error", "");
                        charUpdates = {};
                        model.reset();
                        if (id === "newcard"){
                                model.reset(charTemplate);
                                model.set("_id", "C:"+now.getTime());
                                model.set("created_on", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                model.set("deck", [deckId]);       
                        }
                        else{
                                model.sync(Config.get("db"), id);        
                        } 
               };
               
               editChar.clearDefault = function clearDefault(event, node){
                        var field = node.getAttribute("name");
                        if (model.get(field) === "") node.innerHTML = "";        
               };
               
               editChar.updateTitle = function updateTitle(event, node){
                       var title = node.innerHTML;
                       title = title.charAt(0).toUpperCase() + title.slice(1);
                        model.set("title", title);        
               };
               
               editChar.picturePreview = function(event, node){
                        var source = navigator.camera.PictureSourceType.PHOTOLIBRARY,
                            _img = new Image(),
                            _options = {quality:50, correctOrientation: true, sourceType: source},
                            onSuccess, onFail,
                            picSpinner = new Spinner({color:"#4d4d4d", lines:12, length: 12, width: 6, radius:10}).spin(),
                            el = editChar.dom.querySelector(".cardpicture");
                        
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
               
               editChar.cameraPreview = function(event, node){ 
                        var _img = new Image(),
                            _options = {quality:50, correctOrientation: true},
                            onSuccess, onFail,
                            picSpinner = new Spinner({color:"#4d4d4d", lines:12, length: 12, width: 6, radius:10}).spin(),
                            el = editChar.dom.querySelector(".cardpicture");
                        
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
                        };
                        
                        navigator.camera.getPicture(onSuccess, onFail, _options);       
                };
               
               editChar.updateField = function(event, node){
                        var prop = node.getAttribute("name"), fn, ln, title;
                        charUpdates[prop] = node.value;
                };
                
                editChar.updateLocation = function(event, node){
                        var location = model.get("location"), city, country;
                        city = editChar.dom.querySelector("input[name='city']").value || "";
                        country = editChar.dom.querySelector("input[name='country']").value || "";
                        
                        (city && country) ? location = city+", "+country : location = city + country;
                        charUpdates.location = location;        
                };
                
                editChar.updateFamily = function(event, node){
                        var name = node.getAttribute("name"), family = model.get("family");
                        family[name] = node.selectedIndex;
                        charUpdates.family = family;
                };
                
                editChar.updateJob = function(event, node){
                        var occupation = model.get("occupation"), name = node.getAttribute("name"), value;
                        switch(name){
                                case "situation":
                                        occupation.details[0] = node.selectedIndex;
                                        break;
                                case "job":
                                        occupation.details[1] = node.value;
                                        break;
                                case "organization":
                                        occupation.details[2] = node.value;
                                        break;
                                default:
                                        occupation.description = node.value;        
                        }
                        charUpdates.occupation = occupation;      
                };
                
                editChar.updateLeisureName = function(event, node){
                        var name = node.getAttribute("name"), idx = name.charAt(name.length-1), leisure = model.get("leisure_activities");
                        leisure[idx].name = node.value;
                        charUpdates.leisure_activities = leisure;
                };
                
                editChar.updateLeisureDesc = function(event, node){
                        var name = node.getAttribute("name"), idx = name.charAt(name.length-1), leisure = model.get("leisure_activities");
                        leisure[idx].comment = node.value;
                        charUpdates.leisure_activities = leisure;               
                };
                
                editChar.updateInterestName = function(event, node){
                        var name = node.getAttribute("name"), idx = name.charAt(name.length-1), interests = model.get("interests");
                        interests[idx].name = node.value;
                        charUpdates.interests = interests;               
                };
                
                editChar.updateInterestDesc = function(event, node){
                        var name = node.getAttribute("name"), idx = name.charAt(name.length-1), interests = model.get("interests");
                        interests[idx].comment = node.value;
                        charUpdates.interests = interests;               
                };
               
               editChar.updateComments = function(event, node){
                        var name = node.getAttribute("name"), idx = name.charAt(name.length-1), comments = model.get("comments");
                        comments[idx] = node.value;
                        charUpdates.comments = comments;        
                };
                
               editChar.press = function(event, node){
                        node.classList.add("pressed");        
               };
               
               editChar.cancel = function(event, node){
                        $close();        
               };
               
               editChar.upload = function(event, node){
                       var now = new Date(), fn = model.get("firstname"), ln = model.get("lastname");
                       node.classList.remove("pressed");
                       error.set("error", "");
                       spinner.spin(node);
                       
                       // card needs a title -- if none set default, if not available display error
                       if (!model.get("title")) {
                               if (fn && ln){
                                       model.set("title", fn+" "+ln);
                               }
                               else if (fn || ln){
                                        model.set("title", fn+ln);        
                               }
                       }
                       if (!model.get("title")) {
                               error.set("error", labels.get("titlerequired"));
                       }
                       
                       if (!error.get("error")){
                                if (!model.get("_rev")){
                                        // editChar.checkValidity();
                                        model.sync(Config.get("db"), model.get("_id"))
                                        .then(function(){
                                                editChar.uploadCard();        
                                        });
                                }
                                else{
                                        model.set("last_modified", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                        editChar.uploadCard(node);
                                }
                        }
                        else{
                                spinner.stop();
                        } 
               };
               
               editChar.uploadCard = function uploadCard(node){
                       var prop;
                       
                       // if a new picture has been added upload it to the server
                       if (_currentDataURL){
                               uploadCardPicture();
                               model.set("picture_file", model.get("_id"));
                       }
                       
                       if (charUpdates !== {}){
                                for (prop in charUpdates){
                                        model.set(prop, charUpdates[prop]);
                                }        
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
                                
               
               MODEL = model;
               return editChar;         
           };  
        });

