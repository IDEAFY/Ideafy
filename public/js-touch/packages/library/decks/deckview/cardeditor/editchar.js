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
                                formatName : function(firstname){
                                        if (firstname) {
                                                this.innerHTML = firstname.substring(0,1).toUpperCase()+firstname.substring(1).toLowerCase()+"  "+cardDetails.get("lastname").toUpperCase(); 
                                        }       
                                },
                                setFamily : function(family){
                                        var couple = family.couple,
                                            children = family.children,
                                            res1, res2;
                                                
                                        if (couple === 0) {res1 = labels.get("singlelbl");}
                                        else if (couple === 1) {res1 = labels.get("marriedlbl");}
                                        else if (couple === 2) {res1 = labels.get("divorcedlbl");}
                                        else if (couple === 3) {res1 = labels.get("widowlbl");}
                                                
                                        if (children === 0) {res2 = "";}
                                        else{
                                                if (cardDetails.get("age") < 20){
                                                        (children === 1) ? res2 = children + labels.get("onesiblinglbl") : res2 = children + labels.get("siblingslbl");
                                                }
                                                else {
                                                        (children === 1) ? res2 = children + labels.get("onechildlbl") : res2 = children + labels.get("childrenlbl");
                                                }
                                        res2=", "+res2;
                                        }
                                        this.innerHTML = res1 + res2;
                                },
                                setLeisure : function(hobbies){
                                        var res = "<ul>", i;
                                        if (hobbies && hobbies.length){
                                                for (i=0; i<hobbies.length; i++){
                                                        if (hobbies[i].comment){
                                                                res+="<li>"+hobbies[i].name+" ("+hobbies[i].comment+")</li>";
                                                        }
                                                        else {
                                                                res+="<li>"+hobbies[i].name+"</li>";        
                                                        }
                                                }
                                                this.innerHTML = res+"</ul>";
                                        }
                                        else{
                                                this.innerHTML = "";
                                        } 
                                },
                                setInterests : function(interests){
                                        var res = "<ul>", i;
                                        if (interests && interests.length){
                                                for (i=0; i<interests.length; i++){
                                                        if (interests[i].comment){
                                                                res+="<li>"+interests[i].name+" ("+interests[i].comment+")</li>";
                                                        }
                                                        else {
                                                                res+="<li>"+interests[i].name+"</li>";
                                                        }
                                                }
                                                this.innerHTML = res+"</ul>";
                                        }
                                        else{
                                                this.innerHTML = "";
                                        } 
                                },
                                setComments : function(comments){
                                        var res = "<ul>", i;
                                        if (comments && comments.length){
                                                for (i=0; i<comments.length; i++){
                                                        res+="<li>"+comments[i]+"</li>";
                                                }
                                                this.innerHTML = res+"</ul>";        
                                        }
                                        else {
                                                this.innerHTML = "";
                                        }        
                                }
                        }),
                        "error" : new Model(error),
                        "editevent" : new Event(editCard)
                });
                
                editChar.template = '<div class="cardpopup editchar"><div class="card-detail"><div class="cd-header blue-dark"><div name="title" data-model="bind: setTitle, title" data-editevent="listen: touchstart, clearDefault; listen: blur, updateTitle" contenteditable=true></div></div><div class="cd-picarea"><div class="cardpicture" data-model="bind:setPic, picture_file"></div><button class="choosepic" data-label="bind:innerHTML, importpiclbl" data-editevent="listen: touchstart, press; listen:touchend, picturePreview"></button><button class="takepic" data-editevent="listen: touchstart, press; listen:touchend, cameraPreview" data-label="bind:innerHTML, importcameralbl"></button></div><table class="cardinfo"><tr><th data-label="bind:innerHTML, firstnameplaceholder"></th><td><input class="input" name="firstname" type="text" data-profile="bind: value, firstname" data-editprofileevent="listen: input, updateField"></td></tr><tr><th data-label="bind:innerHTML, lastnameplaceholder"></th><td><input class="input" type="text" name="lastname" data-profile="bind: value, lastname" data-editprofileevent="listen: input, updateField"></td></tr></table><label data-label="bind:innerHTML, age"></label><input class="input" type="number" name="age" maxlength=3 size=4 data-profile="bind: value, age" data-editprofileevent="listen: input, updateField"></div><div class="postal"><label class="streetaddress" data-label="bind:innerHTML, mailaddress"></label><input class="streetaddress input" name="street1" type="text" data-label="bind:placeholder, street" data-profile="bind:value, address.street1" data-editprofileevent="listen:input, updateAddress"><div class="city"><label data-label="bind:innerHTML, city"></label><input class="input city" name="city" type="text" data-profile="bind:value, address.city" data-editprofileevent="listen:input, updateAddress"></div><div class="zipstate"><div class="state"><label data-label="bind:innerHTML, state"></label><input class="input" name="state" placeholder="" type="text" data-profile="bind:value, address.state" data-editprofileevent="listen:input, updateAddress"></div><div class="zip"><label data-label="bind:innerHTML, zip"></label><input class="input" name="zip" placeholder="" type="text" data-profile="bind:value, address.zip" data-editprofileevent="listen:input, updateAddress"></div></div><label data-label="bind:innerHTML, country"></label><input class="input" name="country" type="text" data-profile="bind:value, address.country" data-editprofileevent="listen:input, updateAddress"></div><label data-label="bind:innerHTML, myfamily"></label><div class="family"><select class="status" name="couple" data-profile="bind: setFamilyStatus, family.couple" data-editprofileevent="listen:change, updateFamily"><option data-label="bind:innerHTML, single"></option><option data-label="bind:innerHTML, married"></option><option data-label="bind:innerHTML, divorced"></option><option data-label="bind:innerHTML, widow"></option><option data-label="bind:innerHTML, relation"></option></select><select class="children" name="children" data-profile="bind: setChildren, family.children" data-editprofileevent="listen:change, updateFamily"><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8+</option></select><label data-label="bind:innerHTML, children"></label></div><label data-label="bind:innerHTML, myoccupation"></label><div class="job"><select class="status" name="situation" data-profile="bind: setSituation, occupation.situation" data-editprofileevent="listen:change, updateJob"><option data-label="bind:innerHTML, student"></option><option data-label="bind:innerHTML, active"></option><option data-label="bind:innerHTML, retired"></option><option data-label="bind:innerHTML, unemployed"></option><option data-label="bind:innerHTML, stayathome"></option></select><div class="jobdesc"><label data-label="bind:innerHTML, jobtitle"></label><input class="input" type="text" name="job" data-profile="bind:value, occupation.job" data-label="bind:placeholder, jobtitle" data-editprofileevent="listen:input, updateJob"></div><div class="org"><label data-label="bind:innerHTML, organization"></label><input class="input" name="organization" type="text" data-profile="bind:value, occupation.organization" data-label="bind:placeholder,organization" data-editprofileevent="listen:input, updateJob"></div></div></div><div class="cd-contentarea"><legend data-label="bind:innerHTML, hobbieslbl"></legend><label data-label="bind:innerHTML, name"></label><label class="description" data-label="bind:innerHTML, comment"></label><input name="leisure0" class="input" type="text" data-profile="bind: setLeisureName, leisure_activities" data-editprofileevent="listen: input, updateLeisureName"><input class="input description" name="leisure0" type="text" data-profile="bind: setLeisureDesc, leisure_activities" data-editprofileevent="listen: input, updateLeisureDesc"><input name="leisure1" class="input" type="text"  data-profile="bind: setLeisureName, leisure_activities" data-editprofileevent="listen: input, updateLeisureName"><input class="input description" name="leisure1" type="text" data-profile="bind: setLeisureDesc, leisure_activities" data-editprofileevent="listen: input, updateLeisureDesc"><input class="input" name="leisure2" type="text" data-profile="bind: setLeisureName, leisure_activities" data-editprofileevent="listen: input, updateLeisureName"><input class="input description" name="leisure2" type="text" data-profile="bind: setLeisureDesc, leisure_activities" data-editprofileevent="listen: input, updateLeisureDesc"><legend data-label="bind:innerHTML, interestslbl"></legend><label data-label="bind:innerHTML, field"></label><label class="description" data-label="bind:innerHTML, comment"></label><input class="input" name="interest0" type="text" data-profile="bind: setInterestName, interests" data-editprofileevent="listen: input, updateInterestName"><input class="input description" name="interest0" type="text" data-profile="bind: setInterestDesc, interests" data-editprofileevent="listen: input, updateInterestDesc"><input class="input" name="interest1" type="text" data-profile="bind: setInterestName, interests" data-editprofileevent="listen: input, updateInterestName"><input class="input description" name="interest1" type="text" data-profile="bind: setInterestDesc, interests" data-editprofileevent="listen: input, updateInterestDesc"><input class="input" name="interest2" type="text" data-profile="bind: setInterestName, interests" data-editprofileevent="listen: input, updateInterestName"><input class="input description" name="interest2" type="text" data-profile="bind: setInterestDesc, interests" data-editprofileevent="listen: input, updateInterestDesc"></div><div class="cancelmail" data-editevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-editevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div></div>';
               
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

