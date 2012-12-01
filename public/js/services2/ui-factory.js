define("Ideafy/SubMenu", ["Olives/OObject", "Olives/Model-plugin", "Amy/Control-plugin", "Config"],
        function(Widget, Model, Control, Config){
                
                function SubMenuConstructor($dom, $setWidget){

                        var _active = false,
                            toggleActive = function (state){
                                (state) ? $dom.setAttribute("style", "display : block;") : $dom.setAttribute("style", "display : none;");
                                _active = state;        
                            };
                            
                        // setup
                        this.plugins.addAll({
                                "label" : new Model(Config.get("labels")),
                                "menucontrol" : new Control(this)
                        });
                        
                        this.getState = function getState(){
                                return _active;
                        };
                        
                        this.toggleActive = function (state){
                                toggleActive(state);
                        };
                        
                        this.setCurrentWidget = function setCurrentWidget(event){
                                var ui = event.target.getAttribute("name");
                                if ($setWidget) {$setWidget(ui);}
                                setTimeout(function(){toggleActive(false);}, 500);
                        };
                        
                        this.alive($dom);     
                }
                
                return function SubMenuFactory($dom, $setWidget){
                        SubMenuConstructor.prototype = new Widget();
                        return new SubMenuConstructor($dom,$setWidget);
                };     
        });
        
define("Ideafy/ActionBar", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "CouchDBStore", "Promise"],
        function(Widget, Model, Event, Config, Store, CouchDBStore, Promise){
                function ActionBarConstructor($type, $parent, $data, $hide){
                
                        var buttons = new Store([]),
                            parentHeight = $parent.offsetHeight,
                            padding = 20,
                            margin = Math.floor((parentHeight-padding-51)/2)+51,
                            style = new Store({"margin": margin}),
                            user = Config.get("user"),
                            observer = Config.get("observer"),
                            buildButtons,
                            ui = this;
                        
                        this.plugins.addAll({
                                "buttons" : new Model(buttons, {
                                        setIcon : function(icon){
                                                this.setAttribute("style", "background-image:url('"+icon+"');");
                                        }
                                }),
                                "style" : new Model(style,{
                                        setPosition : function(mt){
                                                this.setAttribute("style", "margin-top:-"+ mt +"px;");
                                        }
                                }),
                                "action" : new Event(this)
                        });
                        
                        this.template = '<div class="actionbar" data-style="bind:setPosition, margin" data-action="listen:touchend, hide"><ul class="buttonlist" data-buttons="foreach"><li class="actionbutton" data-buttons ="bind:setIcon,icon" data-action="listen:touchstart, press; listen:touchend, action"></li></ul></div>';
                        
                        this.hide = function(event, node){
                                console.log("hide event");
                                $hide(this);        
                        };
                        
                        this.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        this.action = function(event, node){
                                var id = node.getAttribute("data-buttons_id"),
                                    action = buttons.get(id).name;
                                
                                event.stopPropagation();
                                node.classList.remove("pressed");
                                
                                
                                switch(action){
                                        case "delete":
                                                this.deleteItem().then(function(){
                                                        $hide(ui);
                                                });
                                                break;
                                        case "edit":
                                                this.editItem();
                                                break;
                                        case "replay":
                                                Config.get("observer").notify("replay-session", $data.sessionId);
                                                break;
                                        case "mail":
                                                this.mailItem();
                                        default:
                                                break;        
                                }
                        };
                        
                        buildButtons = function(type, data){
                                
                                switch (type){
                                        case "idea":
                                                // actions: edit, delete, email, share, replaysession, add to favorites ?
                                                console.log(user.toJSON(), data);
                                                // edit : allow edits if user is one of the authors
                                                // note: original idea is always saved with session
                                                if (data.authors.indexOf(user.get("_id"))>-1) buttons.alter("push", {name:"edit", icon:"img/wall/35modify.png"});
                                                
                                                // if idea is coming from a session display replaysession
                                                if (data.sessionId){
                                                        if (data.sessionReplay || data.authors.indexOf(user.get("_id"))>-1) buttons.alter("push", {name:"replay", icon:"img/library/25goToSession.png"});
                                                }
                                                
                                                // email -- if you can see it you can email it
                                                buttons.alter("push", {name: "mail", icon:"img/wall/35mail.png"});
                                                
                                                // if user has contacts or twitter/facebook/google profiles then share is ok
                                                if (user.get("connections") && user.get("connections").length){
                                                        buttons.alter("push", {name:"share", icon:"img/wall/35share.png"});
                                                }
                                                else if (user.get("facebook") || user.get("twitter") || user.get("gplus") || user.get("linkedin")){
                                                        buttons.alter("push", {name:"share", icon:"img/wall/35share.png"});
                                                }
                                                
                                                // if user is sole author, idea has not been shared and no twocents, then delete is ok
                                                if (data.authors.length === 1 && data.authors[0] === user.get("_id") && !data.twocents.length && !data.sharedwith.length) {
                                                        buttons.alter("push", {name: "delete", icon:"img/wall/35delete.png"});
                                                }
                                                
                                                
                                                
                                                break;
                                        default:
                                                break;
                                }
                        };
                        
                        this.deleteItem = function deleteItem(){
                                var promise = new Promise(),
                                    cdb = new CouchDBStore();
                                
                                cdb.setTransport(Config.get("transport"));
                                
                                switch($type){
                                        case "idea":
                                                cdb.sync(Config.get("db"), $data._id).then(function(){
                                                        cdb.remove();
                                                        promise.resolve();
                                                });
                                                break;
                                        default:
                                                break;        
                                }
                                
                                return promise;
                        };
                        
                        this.editItem = function editItem(){
                                // if type is "idea" we need to differentiate between public and private lists
                                switch($type){
                                        case "idea":
                                                (document.getElementById("public")) ? observer.notify("public-edit", $data._id) : observer.notify("library-edit", $data._id);
                                                break;
                                        default:
                                                break;        
                                } 
                        };
                        
                        this.mailItem = function mailItem(){
                                // if type is "idea" we need to differentiate between public and private lists
                                switch($type){
                                        case "idea":
                                                (document.getElementById("public")) ? observer.notify("public-sendmail", $data) : observer.notify("library-sendmail", $data);
                                                break;
                                        default:
                                                break;        
                                } 
                        };
                        
                        buildButtons($type, $data);
                        
                        //hide if no action is taken after 3s
                       // setTimeout(function(){$hide(ui);}, 30000);
                
                }
                
                return function ActionBarFactory($type, $parent, $data, $hide){
                        ActionBarConstructor.prototype = new Widget();
                        return new ActionBarConstructor($type, $parent, $data, $hide);
                };
        });

define("Ideafy/AvatarList", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Ideafy/Utils", "Store"],
        function(Widget, Model, Event, Config, Utils, Store){
                
                function AvatarListConstructor($ids, $files){

                        var _store = new Store([]);
                            _avatars = Config.get("avatars"); 
                        // setup
                        this.plugins.addAll({
                                "avatar" : new Model(_store, {
                                        setAvatar : function(img){
                                                this.setAttribute("style", "background-image: url('"+img+"');");
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        // set template
                        this.template='<ul data-avatar="foreach"><li data-avatar="bind: setAvatar, img; bind: name, id"></li></ul>'
                        
                        // init
                        for (i=0; i<$ids.length; i++){
                                if ($ids[i] === Config.get("user").get("_id")){
                                        _store.alter("push", {id:$ids[i], img: Config.get("avatar")});
                                }
                                else if (_avatars.get($ids[i])){
                                        _store.alter("push", {id:$ids[i], img:_avatars.get($ids[i])});       
                                }
                                else {
                                        if ($files[i].search("img/avatars")>-1)  _store.alter("push", {id:$ids[i], img:$files[i]});
                                        else{
                                                Config.get("transport").request("GetAvatar", {id: $ids[i], file:$files[i]}, function(result){
                                                        if (!result.error){
                                                                _store.alter("push", {id: $ids[i], img: result});
                                                        }
                                                });
                                        }
                                }
                        }
                             
                }
                
                return function AvatarListFactory($ids, $files){
                        AvatarListConstructor.prototype = new Widget();
                        return new AvatarListConstructor($ids,$files);
                };     
        });
        
define("Ideafy/Avatar", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "Ideafy/Utils"],
        function(Widget, Model, Event, Config, Store, Utils){
                
                function AvatarConstructor($array){

                        var _store = new Store([]),
                            _avatars = Config.get("avatars"),
                            _id = $array[0]; 
                        
                        // setup
                        this.plugins.addAll({
                                "avatar" : new Model(_store, {
                                        setStyle : function(img){
                                                this.setAttribute("style", "background-image: url('"+img+"');");
                                        }
                                }),
                                "event" : new Event(this)
                        });
                        
                        // set template
                        this.template='<div class="avatar" data-avatar="bind: setStyle, img"></div>'
                        
                        // init
                        if ($array.length>1) _store.set("img", "img/avatars/deedee6.png")
                        else if (_id === Config.get("user").get("_id")) _store.set("img", Config.get("avatar"))
                        else if (_avatars.get(_id)) _store.set("img", _avatars.get(_id))
                        else {
                                Utils.getAvatarById(_id).then(function(){
                                        _store.set("img", _avatars.get(_id));
                                });
                        }
                             
                }
                
                return function AvatarFactory($id){
                        AvatarConstructor.prototype = new Widget();
                        return new AvatarConstructor($id);
                };     
        });
        

define("Ideafy/CardPopup", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store"],
        function(Widget, Model, Event, Config, Store){
                
                function CardPopupConstructor($close){

                        var cardDetails = new Store(),
                            labels = Config.get("labels"),
                            _dom, // the node to which to attach the popup
                            position = {x:0, y:0}, // position of the popup
                            charTemplate = '<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark"> <span data-carddetails="bind: formatName, firstname"></span><div class="close-popup" data-popupevent="listen:touchstart, close"></div></div><div class="cd-picarea"><div class="cardpicture" data-carddetails="bind:setPic, picture_file"></div><div class="cardinfo"><p><span class="cd-agelbl"></span><span data-carddetails="bind:innerHTML, age">age</span><span class="agesuffix" data-label="bind:innerHTML, agelbl"></span><br/><span class="cd-locationlbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, location"></span><br/><span class="cd-joblbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, occupation.description"></span><br/><span class="cd-familylbl"></span><span class="cd-info" data-carddetails="bind: setFamily, family"></span><br/><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit"></span></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, hobbieslbl">Hobbies</span><p class = "dyknow" data-carddetails="bind:setLeisure, leisure_activities">hobbies</p><span class="contentTitle" data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "dyknow" data-carddetails="bind: setInterests, interests">Centers of interest</p><span class="contentTitle" data-label="bind: innerHTML, commentslbl">Comments</span><p class = "dyknow" data-carddetails="bind:setComments, comments">Comments</p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>',
                            defaultTemplate = '<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark"> <span data-carddetails="bind: formatTitle, title"></span><div class="close-popup" data-popupevent="listen:touchstart, close"></div></div><div class="cd-picarea"><div class="cardpicture" data-carddetails="bind:setPic, picture_file"></div><div class="cardinfo"><p><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit">Picture credits</span><br/><span class="cd-sourcelbl" data-label="bind:innerHTML, source">Source : </span><span class="cd-info" data-carddetails="bind: innerHTML, sources"></span></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, dyknow"></span><p class = "dyknow" data-carddetails="bind:innerHTML,didYouKnow"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>',
                            storyTemplate = '<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark story"> <div class="storytitlelbl" data-label="bind:innerHTML, storytitlelbl"></div><div class="storytitle"><span data-label="bind:innerHTML, cdtitlelbl"></span> <span data-carddetails="bind: formatTitle, title"></span></div><div class="close-popup" data-popupevent="listen:touchstart, close"></div></div><div class="cd-contentarea story"><span class="contentTitle" data-label="bind: innerHTML, scenariodesclbl"></span><p class = "dyknow" data-carddetails="bind:innerHTML,story"></p><span class="contentTitle" data-label="bind: innerHTML, soldesclbl"></span><p class = "dyknow" data-carddetails="bind:innerHTML,solution"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>';
                            
                        // setup
                        this.plugins.addAll({
                                "label" : new Model(labels),
                                "carddetails" : new Model(cardDetails,{
                                        setPosition : function(position){
                                                if (position){
                                                        this.setAttribute("style", "left:"+position.x+"px; top:"+position.y+"px;");
                                                }        
                                        },
                                        setCaret : function(caret){
                                                var top, y= cardDetails.get("position").y;
                                                (y > 340)? top = 240 : top = 60;
                                                (caret) ? this.setAttribute("style", "display: inline-block; margin-top:"+top+"px;") : this.setAttribute("style", "display: none;");     
                                        },
                                        setPic : function(pic){
                                                if (pic){
                                                        this.setAttribute("style", "background-image:url('"+pic+"');");
                                                }
                                                else {
                                                        this.setAttribute("style", "background-image: none;")
                                                }
                                        },
                                        formatTitle : function(title){
                                                if (title) {
                                                        this.innerHTML = title.substring(0,1).toUpperCase()+title.substring(1).toLowerCase(); 
                                                        }       
                                        },
                                        formatName : function(firstname){
                                                if (firstname) {
                                                        this.innerHTML = firstname.substring(0,1).toUpperCase()+firstname.substring(1).toLowerCase()+"  "+cardDetails.get("lastname").substring(0,1).toUpperCase()+cardDetails.get("lastname").substring(1).toLowerCase(); 
                                                        }       
                                        },
                                        setFamily : function(family){
                                                var couple = family.couple,
                                                    children = family.children,
                                                    res1, res2;
                                                
                                                if (couple === 0) res1 = labels.get("singlelbl")
                                                else if (couple === 1) res1 = labels.get("marriedlbl")
                                                else if (couple === 2) res1 = labels.get("divorcedlbl")
                                                else if (couple === 3) res1 = labels.get("widowlbl")
                                                
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
                                                var res = "<ul>";
                                                if (hobbies && hobbies.length){
                                                        for (i=0; i<hobbies.length; i++){
                                                                res+="<li>"+hobbies[i].name+" ("+hobbies[i].comment+")</li>";
                                                        }
                                                        this.innerHTML = res+"</ul>";
                                                               
                                                }
                                                else{
                                                        this.innerHTML = "";
                                                } 
                                        },
                                        setInterests : function(interests){
                                                var res = "<ul>";
                                                if (interests && interests.length){
                                                        for (i=0; i<interests.length; i++){
                                                                res+="<li>"+interests[i].name+" ("+interests[i].comment+")</li>";
                                                        }
                                                        this.innerHTML = res+"</ul>";
                                                }
                                                else{
                                                        this.innerHTML = "";
                                                } 
                                        },
                                        setComments : function(comments){
                                                var res = "<ul>";
                                                if (comments && comments.length){
                                                        for (i=0; i<comments.length; i++){
                                                                res+="<li>"+comments[i]+")</li>";
                                                        }
                                                        this.innerHTML = res+"</ul>";        
                                                }
                                                else {
                                                        this.innerHTML = "";
                                                }        
                                        }
                                }),
                                "popupevent" : new Event(this)
                        });
                        
                        this.close = function(event, node){
                                _dom.classList.add("invisible");
                                $close();
                        };
                        
                        this.reset = function reset(card, position, caret, dom){
                                // set the dom
                                _dom = dom;
                                this.template = "";
                                // get card info
                                cardDetails.reset(JSON.parse(card));
                                // assign popup position and caret type
                                cardDetails.set("position", position);
                                (caret === "left") ? cardDetails.set("caret", {left:true, right: false}) : cardDetails.set("caret", {left:false, right: true});
                                
                                if (cardDetails.get("type") === 1) this.template = charTemplate
                                else if (cardDetails.get("type") === 5) this.template = storyTemplate
                                else this.template = defaultTemplate;
                                
                                this.render();
                                this.place(_dom);
                                _dom.classList.remove("invisible");
                                        
                        };     
                }
                
                return function CardPopupFactory($close){
                        CardPopupConstructor.prototype = new Widget();
                        return new CardPopupConstructor($close);
                };     
        });

define("Ideafy/NewIdea", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "CouchDBStore"],
        function(Widget, Map, Model, Event, Config, Store){
                
                return function newIdeaConstructor(){
                
                        var _widget = new Widget(),
                            _store = new Store(Config.get("ideaTemplate")),
                            _user = Config.get("user"),
                            _labels = Config.get("labels"),
                            _error = new Store({"error": ""});
                            
                        _store.setTransport(Config.get("transport"));
                        
                        _widget.plugins.addAll({
                                "newidea" : new Model(_store, {
                                        setVisibility : function(visibility){
                                                if (visibility === "private"){
                                                        this.classList.remove("public");
                                                        this.innerHTML = _labels.get("privatelbl");
                                                }
                                                else{
                                                        this.classList.add("public");
                                                        this.innerHTML = _labels.get("publiclbl");        
                                                }
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
                                                        default:
                                                             this.innerHTML = "";
                                                }
                                        }
                                }),
                                "newideaevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div><div class = "header blue-dark"><div class="option left" data-newideaevent="listen:touchstart, press; listen:touchend, cancel" data-labels="bind: innerHTML, cancellbl">Cancel</div><span data-labels="bind: innerHTML, createidealbl"></span><div class="option right" data-newideaevent="listen:touchstart, press; listen:touchend, upload" data-labels="bind:innerHTML, oklbl">Ok</div></div><form class="form"><p><input maxlength=40 type="text" class="input newideatitle" data-labels="bind:placeholder, ideatitleplaceholder" data-newidea="bind: value, title"></p><p><textarea class="description input" data-labels="bind:placeholder, ideadescplaceholder" data-newidea="bind: value, description"></textarea></p><p><textarea class="solution input" data-labels="bind:placeholder, ideasolplaceholder" data-newidea="bind: value, solution"></textarea></p><p><span class="errormsg" data-errormsg="bind:setError, error"></span><span class="visibility" data-labels="bind:innerHTML, privatelbl" data-newideaevent="listen: touchstart, press; listen:touchend,toggleVisibility" data-newidea="bind: setVisibility, visibility"></span></p></form></div>';
                        
                        _widget.render();
                        _widget.place(Map.get("newidea-popup"));
                        
                        _widget.toggleVisibility = function(event, node){
                                var vis = _store.get("visibility");
                                node.classList.remove("pressed");
                                (vis === "public") ? _store.set("visibility", "private") : _store.set("visibility", "public");
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        _widget.cancel = function(event, node){
                                node.classList.remove("pressed");
                                // hide window
                                document.getElementById("newidea-popup").classList.remove("appear");
                                document.getElementById("cache").classList.remove("appear");
                                // reset _store and _error
                                _store.unsync();
                                _store.reset(Config.get("ideaTemplate"));
                                _error.reset({"error":""});       
                        };
                        
                        _widget.upload = function(event, node){
                                var now = new Date(),
                                    id = "I:"+now.getTime();
                                    
                                // check for errors (missing fields)
                                if (!_store.get("title")) _error.set("error", "notitle");
                                else if (!_store.get("description")) _error.set("error", "nodesc");
                                else if (!_store.get("solution")) _error.set("error", "nosol");

                                if (!_error.get("error") && !_store.get("_id                               ")){                                
                                        // fill cdb document
                                        _store.set("authors", [_user.get("_id")]);
                                        _store.set("authornames", _user.get("username"));
                                        _store.set("creation_date", [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]);
                                
                                        // create document in couchdb and upload
                                        _store.sync(Config.get("db"), id);
                                        setTimeout(function(){
                                                _store.upload();
                                                node.classList.remove("pressed");
                                                // hide window
                                                document.getElementById("newidea-popup").classList.remove("appear");
                                                document.getElementById("cache").classList.remove("appear");
                                                // reset _store and _error
                                                _store.unsync();
                                                _store.reset(Config.get("ideaTemplate"));
                                                _error.reset({"error":""});
                                        }, 200);
                                }  
                        };
                        
                        return _widget;
                };
                
        });
        
define("Ideafy/Help", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store"],
        function(Widget, Map, Model, Event, Config, Store){
                
                return new function HelpConstructor(){
                
                        var _widget = new Widget(),
                            _labels = Config.get("labels"),
                            _content = new Store({"html":""});
                        
                        _widget.plugins.addAll({
                                "help" : new Model(_content),
                                "helpevent" : new Event(_widget)
                        });
                        
                        _widget.template = '<div><div class="help-doctor" data-helpevent="listen:touchstart, close"></div><div class="help-screen" data-help="bind:innerHTML,html"></div></div>';
                        
                        _widget.render();
                        _widget.place(Map.get("help-popup"));
                        
                        _widget.setContent = function setContent(label){
                                _content.set("html", _labels.get(label));        
                        };
                        
                        _widget.close = function(event, node){
                                // hide window
                                document.getElementById("help-popup").classList.remove("appear");
                                document.getElementById("cache").classList.remove("appear");
                        };
                        
                        return _widget;
                };
                
        })
        
define("Ideafy/Confirm", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store"],
        function(Widget, Map, Model, Event, Config, Store){
                
                function ConfirmConstructor($parent, $question, $onDecision){
                
                        var _labels = Config.get("labels"),
                                _widget = this,
                            _content = new Store({"question":""});
                        
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "confirm" : new Model(_content),
                                "confirmevent" : new Event(this)
                        });
                        
                        _widget.template = '<div class = "confirm"><div class="help-doctor"></div><p class="confirm-question" data-confirm="bind:innerHTML,question"></p><div class="option left" data-confirmevent="listen:touchstart, press; listen:touchend, ok" data-label="bind: innerHTML, continuelbl">Continue</div><div class="option right" data-confirmevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl">Cancel</div></div>';
                        
                        _widget.press = function(event, node){
                                event.stopPropagation();
                                node.classList.add("pressed");
                        };
                        
                        _widget.ok = function(event, node){
                                node.classList.remove("pressed");
                                $onDecision(true);    
                        };
                        
                        _widget.cancel = function(event, node){
                                node && node.classList.remove("pressed");
                                $onDecision(false);
                        };
                        
                        _widget.close = function close(){
                                $parent.removeChild($parent.lastChild);       
                        };
                        
                        _content.set("question", $question);
                        _widget.render();
                        _widget.place($parent);
                        
                        setTimeout(function(){_widget.close;}, 15000);
                        
                }
                        
                return function ConfirmFactory($parent, $question, $onDecision){
                        ConfirmConstructor.prototype = new Widget();
                        return new ConfirmConstructor($parent, $question, $onDecision);
                };
        })
