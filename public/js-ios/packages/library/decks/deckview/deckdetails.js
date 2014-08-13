/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../../libs/olives"),
      emily = require("../../../../libs/emily"),
      CouchDBTools = require("../../../../libs/CouchDBTools"),
      Widget = olives.OObject,
      Config = require("../../../../services/config"),
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Store = emily.Store,
      CouchDBDocument = CouchDBTools.CouchDBDocument,
      CouchDBView = CouchDBTools.CouchDBView,
      Utils = require("../../../../services/utils"),
      Spinner = require("../../../../libs/spin.min");

module.exports = function DeckDetailsConstructor($update){
                 
                        var deckDetails = new Widget(),
                            deckModel = new Store(),
                            range = new Store({"max": 0}),
                            deckCards = new Store([]),
                            allCards = new CouchDBView(),
                            carouselSpinner = new Spinner({top:255, left: 297, lines: 8, radius: 6, color: "#cccccc"}).spin(),
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            _languages = new Store(Config.get("userLanguages")),
                            _resetLang = function(){
                                _languages.loop(function(v,i){
                                        (deckModel.get("default_lang") && (v.name === deckModel.get("default_lang").substring(0,2))) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);       
                                });        
                            },
                            _currentDeck,
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
                                    _dataURL = _currentDataURL;
                                _fd.append("type", _type);
                                _fd.append("dir", "decks");
                                _fd.append("filename", deckModel.get("_id"));
                                _fd.append("dataString", _dataURL);
                                Utils.uploadFile(_url, _fd, null, function(result){
                                        return result;
                                });
                            };
                        
                        
                        allCards.setTransport(Config.get("transport"));
                        
                        deckDetails.seam.addAll({
                                "labels": new Model(labels),
                                "range": new Model(range, {
                                        setCursorWidth : function(max){
                                                //how to set attribute on slider (shadowDOM)        
                                        }
                                }),
                                "cards": new Model(deckCards,{
                                        setStyle : function(style){
                                                //used to hide cards when viewing beginning or end of list
                                                if (style && style === "null"){
                                                        this.classList.add("invisible");               
                                                }
                                                else {
                                                        this.classList.remove("invisible");
                                                }
                                        },
                                        formatTitle : function(title){
                                                var id, node = this;
                                                if (title){
                                                        id = node.getAttribute("data-cards_id");
                                                        if (deckCards.get(id).type && deckCards.get(id).type !== 4) {
                                                                this.innerHTML = title.substring(0,1).toUpperCase()+title.substring(1).toLowerCase(); 
                                                        }
                                                        else{
                                                                this.innerHTML = title.toUpperCase();
                                                                this.setAttribute("style", "font-family:Helvetica;");
                                                        }
                                               }
                                        },
                                        setPic : function(pic){
                                                var json, node=this, picSpinner;
                                                if (pic && pic.search("img/decks/") > -1){
                                                        this.setAttribute("style", "background-image:url('"+pic+"');");
                                                }
                                                else if (pic){
                                                        picSpinner = new Spinner({color: "#657b99"}).spin(node);
                                                        json = {"dir":"cards", "filename":pic};
                                                        Config.get("transport").request("GetFile", json, function(data){
                                                                node.setAttribute("style", "background-image: url('"+data+"');");
                                                                picSpinner.stop();  
                                                        });        
                                                }
                                                else {
                                                        this.setAttribute("style", "background-image: none;");
                                                }
                                        }
                                 }),
                                "deckdetails" : new Model(deckModel, {
                                        displayLang : function(lang){
                                                var l;
                                                if (lang) {
                                                        deckDetails.dom.querySelector(".idealang").classList.remove("invisible");
                                                        l=lang.substring(0,2);
                                                        this.setAttribute("style", "background-image:url('img/flags/"+l+".png');");
                                                }
                                                else deckDetails.dom.querySelector(".idealang").classList.add("invisible");        
                                        },
                                        formatDate : function(date) {
                                                (date) ? this.innerHTML = Utils.formatDate(date) : this.innerHTML="";
                                        },
                                        setPic : function(picture){
                                                var json, node=this, picSpinner;
                                                if (picture === "") {
                                                        this.setAttribute("style", "background-image:url('img/connect/graygroup.png');");
                                                }
                                                else if (picture === "img/logo.png"){
                                                        this.setAttribute("style", "background-image:url('img/logo.png');");        
                                                }
                                                else if (picture === "decklogo"){
                                                        picSpinner = new Spinner({color: "#657b99"}).spin(node);
                                                        json = {"dir":"decks", "filename":deckModel.get("_id")};
                                                        Config.get("transport").request("GetFile", json, function(data){
                                                                node.setAttribute("style", "background-image: url('"+data+"');");
                                                                picSpinner.stop();   
                                                        });
                                                }
                                        },
                                        edit : function(uid){
                                                if (uid === user.get("_id")){
                                                        this.setAttribute("contenteditable", true);
                                                        this.classList.add("editable");
                                                }
                                                else{
                                                        this.setAttribute("contenteditable", false);
                                                        this.classList.remove("editable");
                                                }       
                                        }
                                }),
                                "select" : new Model (_languages, {
                                        setBg : function(name){
                                                if (name){
                                                        this.setAttribute("style", "background-image:url('img/flags/"+name+".png');");
                                                }
                                        },
                                        setSelected : function(selected){
                                                (selected) ? this.classList.add("selected") : this.classList.remove("selected");        
                                        } 
                                }),
                                "carouselevent" : new Event(deckDetails),
                                "editevent" : new Event(deckDetails)        
                        });
                        
                        deckDetails.template = '<div class="deckdetails"><div class="deckinfo"><div class="deckheader"><div class="idealang invisible"><div class="currentlang" data-deckdetails="bind: displayLang, default_lang" data-editevent="listen: touchstart, showLang"></div><ul class="invisible" data-select="foreach"><li data-select="bind: setBg, name; bind: setSelected, selected" data-editevent="listen: touchstart, selectFlag; listen: touchend, setLang"></li></ul></div><div class="decklogo" data-deckdetails="bind: setPic, picture_file" data-editevent="listen: touchstart, editPic; listen: touchend, changePic"></div><p><h2 data-deckdetails="bind:innerHTML, title; bind: edit, created_by" data-editevent="listen:input, displayButtons"></h2><span data-labels="bind:innerHTML, designedby"></span><span data-deckdetails="bind: innerHTML, author"></span></p><span class="date" data-deckdetails="bind:formatDate,date"></span></div><div class="deckbody"><p class="deckdescription" data-deckdetails="bind: innerHTML, description; bind: edit, created_by" data-editevent="listen:input, displayButtons"></p><div class="cancelmail invisible" data-editevent="listen:touchstart, press; listen:touchend, cancel" data-labels="bind:innerHTML, cancellbl"></div><div class="sendmail invisible" data-editevent="listen:touchstart, press; listen:touchend, upload" data-labels="bind:innerHTML, savelbl">Save</div></div></div><div class="deckcarousel"><div class="innercarousel"></div><ul data-cards="foreach"><li data-cards="bind: setStyle,style"><div class="card"><div class="cardpicture" data-cards="bind:setPic,picture_file"></div><div class="cardtitle" data-cards="bind: formatTitle, title"></div></div></li></ul><input class="deckslider invisible" type="range" value=0 min=0 data-range="bind: max, max; bind: setCursorWidth, max" data-carouselevent="listen: input, updateCards"></div></div>';
                        
                        deckDetails.displayCards = function displayCards(id){
                                var i, arr = [], slider = deckDetails.dom.querySelector(".deckslider");
                                for(i=0;i<5;i++){
                                        (allCards.get(id-2+i))?arr[i]=allCards.get(id-2+i).value : arr[i] = {style: "null"};
                                }
                                deckCards.reset(arr);
                                (deckCards.getNbItems()) ? slider.classList.remove("invisible") : slider.classList.add("invisible");
                        };
                        
                        deckDetails.updateCards = function(event, node){
                                deckDetails.displayCards(node.value);        
                        };
                        
                        deckDetails.displayButtons = function(event, node){
                                deckDetails.dom.querySelector(".cancelmail").classList.remove("invisible");
                                deckDetails.dom.querySelector(".sendmail").classList.remove("invisible");       
                        };
                        
                        deckDetails.hideButtons = function(){
                                deckDetails.dom.querySelector(".cancelmail").classList.add("invisible");
                                deckDetails.dom.querySelector(".sendmail").classList.add("invisible");        
                        };
                        
                        deckDetails.editPic = function(event, node){
                                if (deckModel.get("created_by") === user.get("_id")){
                                        node.setAttribute("style", "background-image: url('img/brainstorm/reload.png')");
                                }        
                        };
                        
                        deckDetails.showLang = function(event, node){
                                deckDetails.dom.querySelector(".idealang ul").classList.remove("invisible");        
                        };
                        
                        deckDetails.selectFlag = function(event, node){
                                var id;
                                event.stopPropagation();
                                event.preventDefault();
                                id = parseInt(node.getAttribute("data-select_id"), 10);
                                _languages.loop(function(v,i){
                                        (id === i) ? _languages.update(i, "selected", true) : _languages.update(i, "selected", false);
                                });                
                        };
                        
                        deckDetails.setLang = function(event, node){
                                var id;
                                event.stopPropagation();
                                event.preventDefault();
                                id = node.getAttribute("data-select_id");
                                deckModel.set("default_lang", _languages.get(id).name);
                                if (deckModel.get("default_lang") !== _currentDeck.default_lang.substring(0,2)){
                                        deckDetails.displayButtons();
                                }
                                else{
                                        deckDetails.hideButtons();        
                                }
                                deckDetails.dom.querySelector(".idealang ul").classList.add("invisible");        
                        };
                        
                        deckDetails.changePic = function(event, node){
                                if (deckModel.get("created_by") === user.get("_id")){
                                        var source = navigator.camera.PictureSourceType.PHOTOLIBRARY,
                                              _img = new Image(),
                                              _options = {quality:50, correctOrientation: true, sourceType: source},
                                              onSuccess, onFail,
                                              picSpinner = new Spinner({color:"#4d4d4d", lines:12, length: 12, width: 6, radius:10}).spin();
                        
                                        onSuccess = function(imageData){
                                                _img.src = imageData;
                                                node.setAttribute("style", "background-image: none");
                                                picSpinner.spin(node);
                                                setTimeout(function(){
                                                        cropImage(resizeImage(_img), function(result){
                                                                node.setAttribute("style", "background-image: url('"+result+"')");
                                                                picSpinner.stop();
                                                                _currentDataURL = result;
                                                                deckDetails.displayButtons();       
                                                        });
                                                }, 750);
                                        };
                        
                                        onFail = function(message){
                                                alert("error: "+message);
                                        };
                        
                                        navigator.camera.getPicture(onSuccess, onFail, _options);
                                }       
                        };
                        
                        deckDetails.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        deckDetails.cancel = function(event, node){
                                var deck = JSON.parse(deckModel.toJSON());
                                deckModel.reset(_currentDeck);
                                deckDetails.hideButtons();
                                node.classList.remove("pressed");
                        };
                        
                        deckDetails.upload = function(event, node){
                                var deckCDB = new CouchDBDocument(),
                                    title = deckDetails.dom.querySelector(".deckheader h2").innerHTML,
                                    description = deckDetails.dom.querySelector(".deckdescription").innerHTML,
                                    uploadSpinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -6, left: 30}).spin(node);
                                node.classList.add("invisible");
                                deckCDB.setTransport(Config.get("transport"));
                                
                                deckCDB.sync(Config.get("db"), deckModel.get("_id"))
                                .then(function(){
                                        var now = new Date();
                                        // if there is a new logo upload it to the server
                                        if (_currentDataURL){
                                                uploadDeckIcon();
                                                deckCDB.set("picture_file", "decklogo");
                                        } 
                                        deckCDB.set("title", title);
                                        deckCDB.set("description", description); 
                                        deckCDB.set("last_updated", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                        return deckCDB.upload();       
                                })
                                .then(function(){
                                        $update("updated", deckCDB.get("_id"));
                                        deckDetails.hideButtons();
                                        node.classList.remove("pressed");
                                        uploadSpinner.stop();                
                                });
                                
                                // if there is a new logo upload it to the server
                                if (_currentDataURL){
                                        uploadDeckIcon();
                                        
                                }      
                        };
                        
                        deckDetails.reset = function reset(deck){
                                var slider = deckDetails.dom.querySelector(".deckslider");
                                
                                // hide slider
                                slider.classList.add("invisible");
                                
                                deckDetails.dom.querySelector(".cancelmail").classList.add("invisible");
                                deckDetails.dom.querySelector(".sendmail").classList.add("invisible");
                                _currentDataURL = null;
                                
                                // force deck picture reset
                                deckModel.set("picture_file", "");
                                
                                deckModel.reset(deck);
                                _resetLang();
                                
                                // reset carousel
                                deckCards.reset([]);
                                
                                // keep a 'local' copy of the deck
                                _currentDeck = JSON.parse(deckModel.toJSON());
                                
                                //reset card range
                                range.set("max", 0);
                                // launch carousel spinner
                                carouselSpinner.spin(deckDetails.dom.querySelector(".deckcarousel"));
                                // get all cards.
                                allCards.reset([]);
                                allCards.sync(Config.get("db"), "library", "_view/cards", {key: '"'+ deckModel.get("_id")+'"'}).then(function(){
                                        carouselSpinner.stop();
                                        if (allCards.getNbItems()) range.set("max", allCards.getNbItems()-1);
                                        // try to sort by title...
                                        allCards.unsync();
                                        allCards.alter("sort", function(x,y){
                                                var a = x.value.title, b = y.value.title;
                                                if (a<b) return -1;
                                                if (a>b) return 1;
                                                if (a===b) return 0;
                                        });    
                                        
                                        // init card set with three cards
                                        deckDetails.displayCards(0);
                                });
                        };
                        
                        return deckDetails;
};