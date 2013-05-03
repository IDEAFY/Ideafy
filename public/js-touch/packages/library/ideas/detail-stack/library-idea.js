/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Store", "Bind.plugin", "Event.plugin", "service/map", "service/utils", "service/avatar", "service/config", "twocents/writetwocent", "twocents/twocentlist", "Observable", "Promise", "CouchDBView"], 
        function(Widget, Store, Model, Event, Map, Utils, Avatar, Config, WriteTwocent, TwocentList, Observable, Promise, CouchDBView){
                return function IdeaDetailConstructor($action){
                //declaration
                        var  _widget = new Widget(),
                             _twocentList = new TwocentList("library"),
                             _twocentWriteUI = new WriteTwocent("library"),
                             _labels = Config.get("labels"),
                             vote = new Store([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]),
                             _voted = false,
                             user = Config.get("user"),
                             ideaCDB = new CouchDBView(), // used to get idea details and synchronize with idea
                             ideaCDBUpdate, // store observer handle
                             transport = Config.get("transport"),
                             observer = Config.get("observer"),
                             _store = new Store(),
                             _shareList = new Store([]),
                             _dom = Map.get("ideas-detail"),
                             _domWrite = Map.get("library-writetwocents"),
                             _obs = new Observable();

                //setup
                        ideaCDB.setTransport(transport);
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "ideadetail" : new Model(_store, {
                                        // toggle header buttons right
                                        toggleRateEdit : function(authors){
                                            (authors.indexOf(user.get("_id"))>-1) ? this.setAttribute("href", "#library-edit") : this.setAttribute("href", "#library-favorites");       
                                        },
                                        // toggle header buttons left
                                        toggleTwocentShare : function(authors){
                                            (authors.indexOf(user.get("_id"))>-1) ? this.setAttribute("href", "#library-share") : this.setAttribute("href", "#library-2cents");       
                                        },
                                        // display twocents writing interface if applicable
                                        displayWriteTwocent : function(authors){
                                            (authors.indexOf(user.get("_id"))<0) ? this.classList.remove("invisible") : this.classList.add("invisible");    
                                        },
                                        // display twocentlist if present
                                        displayTwocentList : function(twocents){
                                                 if (twocents && twocents.length){
                                                    // hide twocent write interface    
                                                    document.getElementById("library-writetwocents").classList.add("invisible");
                                                 }        
                                        },
                                        date : function date(date){
                                                if (date) this.innerHTML = Utils.formatDate(date);
                                        },
                                        setAuthor : function(authornames){
                                                if (authornames === user.get("username") && _store.get("authors").indexOf(user.get("_id"))>-1){
                                                        this.innerHTML = _labels.get("youlbl");
                                                }
                                                else {
                                                        this.innerHTML = authornames;
                                                }
                                        },
                                        setWrotelbl : function(authors){
                                                if (authors.length === 1 && authors[0] === user.get("_id")){
                                                        this.innerHTML = _labels.get("youwrotelbl");
                                                }
                                                else if (authors.length > 1) this.innerHTML = _labels.get("theywrotelbl")
                                                else {
                                                        this.innerHTML = _labels.get("ideawrotelbl");
                                                }        
                                        },
                                        setAvatar : function setAvatar(authors){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar(authors);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        },
                                        hideRating : function(id){
                                                if (id.search("I:WELCOME") > -1) this.classList.add("invisible")
                                                else this.classList.remove("invisible")        
                                        },
                                        setRating : function setRating(votes) {
                                                if (votes.length === 0) {this.innerHTML = "";}
                                                else {
                                                        this.innerHTML = Math.round(votes.reduce(function(x,y){return x+y;})/votes.length*100)/100;
                                                }
                                        },
                                        setDescription : function setDescription(desc){
                                                this.innerHTML = desc.replace("\n", "<br>");        
                                        },
                                        setSolution : function setSolution(sol){
                                                this.innerHTML = sol.replace("\n", "<br>");        
                                        },
                                        // display a vote button or the number of votes on an idea
                                        toggleVoteButton : function(votes){
                                                var idea = _store.get("_id"),
                                                    authors = _store.get("authors"); 
                                                // hide rating popup if present
                                                document.getElementById("ratingPopup").classList.remove("appear");  
                                                // check if user has already voted on this idea or if user is author
                                                if (user.get("rated_ideas").indexOf(idea)<0 && authors.indexOf(user.get("_id"))<0 && !_voted)
                                                {
                                                        this.setAttribute("name", "vote");
                                                        this.innerHTML = _labels.get("votebuttonlbl");
                                                        this.classList.remove("votes");
                                                        this.classList.add("publicButton");
                                                }
                                                else{
                                                        _voted = true;
                                                        this.classList.remove("publicButton");
                                                        this.setAttribute("name", "voted");
                                                        if (votes.length === 0){
                                                                this.innerHTML = "("+_labels.get("novotesyet")+")";
                                                        }
                                                        else if (votes.length === 1){
                                                                this.innerHTML = "("+ _labels.get("onevote")+")";
                                                        }
                                                        else{
                                                                this.innerHTML = "("+votes.length + " "+_labels.get("votes")+")";
                                                        }
                                                        this.classList.add("votes");
                                                }               
                                        },
                                        setSharedWith : function(sharedwith){
                                                // do not display sharedwith field for welcome idea
                                                if ((_store.get("_id").search("I:WELCOME")) < 0 && sharedwith && sharedwith.length){
                                                        this.classList.remove("invisible");
                                                        (sharedwith.length === 1)?this.innerHTML = _labels.get("sharedwith")+"<b><u>"+1+_labels.get("ideafyer")+"</u></b>":this.innerHTML = _labels.get("sharedwith")+"<b><u>"+sharedwith.length+_labels.get("ideafyer")+"</u></b>";
                                                }
                                                else this.classList.add("invisible");
                                        }
                                }),
                                "share" : new Model(_shareList),
                                "vote" : new Model(vote,{
                                        setIcon : function(active){
                                                var styleActive = "background: url('img/public/activeIdeaVote.png') no-repeat center center;",
                                                    styleInactive = "background: url('img/public/rateForList.png') no-repeat center center;";
                                                (active) ? this.setAttribute("style", styleActive) : this.setAttribute("style", styleInactive);
                                        }
                                }),
                                "ideadetailevent" : new Event(_widget)
                        });

                        _widget.template='<div class="library-idea"><div class="header blue-dark"><a href="#library-2cents" data-ideadetail="bind: toggleTwocentShare, authors" data-ideadetailevent="listen: touchstart, action" class="option left"></a><span data-label="bind: innerHTML, ideadetailsheadertitle"></span><a href="#library-favorites" data-ideadetail="bind: toggleRateEdit, authors" data-ideadetailevent="listen: touchstart, action" class="option right"></a></div><div id="idea-cache" class="invisible"></div><div class = "detail-contents"><div class="detail-header"><div class="avatar" data-ideadetail="bind:setAvatar, authors"></div><h2 data-ideadetail="bind:innerHTML,title"></h2><span class="date" data-ideadetail="bind:date, creation_date"></span><br><span class="author" data-ideadetail="bind:setAuthor,authornames"></span><span class="commentlbl" data-ideadetail="bind: setWrotelbl, authors"></span></div><div class="detail-body"><p data-ideadetail="bind:setDescription,description"></p><p data-ideadetail="bind:setSolution,solution"></p></div><div class="detail-footer"><div class="sharedwith invisible" data-ideadetail="bind: setSharedWith, sharedwith" data-ideadetailevent="listen:touchstart, displayList"></div><div id="sharelist" class="autocontact invisible"><div class="autoclose" data-ideadetailevent="listen:touchstart,close"></div><ul data-share="foreach"><li data-share="bind:innerHTML, value.username"></li></ul></div><div class ="rateIdea" data-ideadetail="bind:hideRating, id"><a class="item-acorn"></a><div class="rating" data-ideadetail="bind:setRating,votes"></div><div class="publicButton" data-ideadetail="bind: toggleVoteButton, votes" name="vote" data-ideadetailevent="listen: touchstart, press; listen: touchend, vote;" data-label="bind: innerHTML, votebuttonlbl"></div><div id="ratingPopup" class="popup"><ul class="acorns" data-vote="foreach"><li class="item-acorn" data-vote="bind: setIcon, active" data-ideadetailevent="listen: touchstart, previewVote; listen: touchend, castVote"></li></ul></div></div></div></div><div id="library-writetwocents" class="invisible" data-ideadetail="bind: displayWriteTwocent, authors"></div><div id="library-twocents" class="twocents" data-ideadetail="bind: displayTwocentList, twocents"></div></div>';
                
                //library
                        _widget.reset = function reset(viewStore, index){
                                var id = viewStore.get(index).id,
                                    promise = new Promise();
                                
                                // reset voting popup
                                vote.reset([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]);
                                
                                // synchronize with idea
                                _widget.getIdea(id).then(function(){
                                        // when clicking on a new idea -- reset _voted param to false, idea store and pass idea's id to twocents
                                        _voted = false;
                                        _twocentWriteUI.reset(_store.get("_id"));
                                        _twocentList.reset(_store.get("_id"));
                                        _domWrite = document.getElementById("library-writetwocents");
                                        _twocentWriteUI.place(_domWrite);
                                        promise.fulfill();        
                                });
                                return promise;
                        };
                        
                        _widget.getIdea = function getIdea(id){
                                
                                var promise = new Promise();
                                // reset store observer if needed
                                if (ideaCDBUpdate){
                                        ideaCDB.unwatch(ideaCDBUpdate);
                                }
                                
                                // reinitialize couchdbstore
                                ideaCDB.unsync();
                                ideaCDB.reset();
                                
                                ideaCDB.sync(Config.get("db"), "ideas", "_view/all", {key:'"'+id+'"', include_docs:true}).then(function(){
                                        _store.reset(ideaCDB.get(0).doc);
                                        ideaCDBUpdate = ideaCDB.watch("updated", function(){
                                                _store.reset(ideaCDB.get(0).doc);        
                                        });
                                        promise.fulfill();      
                                });
                                return promise;       
                        };
                        
                        _widget.action = function(event, node){
                                var name = node.getAttribute("href");
                                if (name === "#library-2cents"){
                                         _twocentWriteUI.reset(_store.get("id"));
                                         _domWrite.classList.remove("invisible");
                                }
                                else $action(name);       
                        };
                        
                        _widget.edit = function(){
                             _stack.getStack().show("#public-edit");     
                        };
                        
                        _widget.press = function(event, node){
                                node.classList.add("pressed");        
                        };
                        
                        _widget.vote = function(event, node){
                                if (!_voted){
                                        //display voting popup
                                        document.getElementById("ratingPopup").classList.add("appear");
                                }
                                node.classList.remove("pressed");
                        };
                        
                        _widget.previewVote = function(event, node){
                             var i=0, idx = node.getAttribute("data-vote_id");
                             vote.loop(function(v,i){
                                     (i<=idx) ? vote.update(i, "active", true):vote.update(i, "active",false);        
                             });            
                        };
                        
                        _widget.castVote = function(event, node){
                                var grade = parseInt(node.getAttribute("data-vote_id"))+1,
                                    id = _store.get("_id"),
                                    json = {id : id, vote: grade, voter: user.get("_id")};
                                
                                // prevent multiple votes on the same idea -- if request fails or before database is updated 
                                if (!_voted){
                                        _voted = true;
                                        transport.request("Vote", json, function(result){
                                                if (result !== "ok"){
                                                        console.log(result, "something went wrong, please try again later");
                                                        _voted = false;
                                                }
                                                else {
                                                        alert(Config.get("labels").get("thankyou"));
                                                        
                                                        //cleanup 1- remove popup 2- hide vote button 3- reset vote store
                                                        document.getElementById("ratingPopup").classList.remove("appear");
                                                        vote.reset([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]);
                                                }
                                        });
                                }
                        };
                        
                        _widget.close = function close(event, node){
                                node.parentNode.classList.add("invisible");         
                        };
                        
                        _widget.displayList = function(event, node){
                                transport.request("GetUserNames", {list: _store.get("sharedwith")}, function(result){
                                        _shareList.reset(result);
                                        document.getElementById("sharelist").classList.remove("invisible");      
                                });  
                        };
                        
                        _widget.place(_dom);
                        TwocentList.setTarget(_dom.querySelector("#library-twocents"));

                //return
                        return _widget;
                };
        });