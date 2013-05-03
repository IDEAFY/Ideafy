/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Store", "Bind.plugin", "Event.plugin", "service/map", "service/utils", "service/avatar", "service/config", "twocents/writetwocent", "twocents/twocentlist", "Observable", "Promise", "CouchDBView", "Place.plugin"], 
        function(Widget, Store, Model, Event, Map, Utils, Avatar, Config, WriteTwocent, TwocentList, Observable, Promise, CouchDBView, Place){
                return function PublicDetailConstructor($action){
                //declaration
                        var  _widget = new Widget(),
                             _twocentWriteUI = new WriteTwocent(),
                             _publicTwocentList= new TwocentList("public"),
                             _labels = Config.get("labels"),
                             vote = new Store([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]),
                             _voted = false,
                             user = Config.get("user"),
                             ideaCDB = new CouchDBView(), // used to get idea details and synchronize with idea
                             ideaCDBUpdate, // store observer handle
                             transport = Config.get("transport"),
                             observer = Config.get("observer"),
                             _store = new Store(),
                             _dom = Map.get("public-detail"),
                             _domWrite,
                             _obs = new Observable();

                //setup
                        ideaCDB.setTransport(transport);
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "publicdetail" : new Model(_store, {
                                        // toggle header buttons right
                                        toggleRateEdit : function(authors){
                                            (authors.indexOf(user.get("_id"))>-1) ? this.setAttribute("href", "#public-edit") : this.setAttribute("href", "#public-favorites");       
                                        },
                                        // toggle header buttons left
                                        toggleTwocentShare : function(authors){
                                            (authors.indexOf(user.get("_id"))>-1) ? this.setAttribute("href", "#public-share") : this.setAttribute("href", "#public-2cents");       
                                        },
                                        // display twocents writing interface if applicable
                                        displayWriteTwocent : function(authors){
                                            (authors.indexOf(user.get("_id"))<0) ? this.classList.remove("invisible") : this.classList.add("invisible");    
                                        },
                                        // hide twocent write if twocents are present
                                        displayTwocentList : function(twocents){
                                                if (twocents && twocents.length){
                                                    // hide twocent write interface    
                                                    document.getElementById("public-writetwocents").classList.add("invisible");
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
                                                if (authors.length === 1 && authors[0]=== user.get("_id")){
                                                        this.innerHTML = _labels.get("youwrotelbl");
                                                }
                                                else if (authors.length >1) this.innerHTML = _labels.get("theywrotelbl")
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
                                        }
                                }),
                                "vote" : new Model(vote,{
                                        setIcon : function(active){
                                                var styleActive = "background: url('img/public/activeIdeaVote.png') no-repeat center center;",
                                                    styleInactive = "background: url('img/public/rateForList.png') no-repeat center center;";
                                                (active) ? this.setAttribute("style", styleActive) : this.setAttribute("style", styleInactive);
                                        }
                                }),
                                "place" : new Place({"PublicTwocentUI": _publicTwocentList}),
                                "publicdetailevent" : new Event(_widget)
                        });

                        _widget.template='<div class="public-idea"><div class="header blue-dark"><a href="#public-2cents" data-publicdetail="bind: toggleTwocentShare, authors" data-publicdetailevent="listen: touchstart, action" class="option left"></a><span data-label="bind: innerHTML, publicdetailsheadertitle"></span><a href="#public-favorites" data-publicdetail="bind: toggleRateEdit, authors" data-publicdetailevent="listen: touchstart, action" class="option right"></a></div><div id="idea-cache"></div><div class = "detail-contents"><div class="detail-header"><div class="avatar" data-publicdetail="bind:setAvatar, authors"></div><h2 data-publicdetail="bind:innerHTML,title"></h2><span class="date" data-publicdetail="bind:date, creation_date"></span><br><span class="author" data-publicdetail="bind:setAuthor,authornames"></span><span class="commentlbl" data-publicdetail="bind: setWrotelbl, authors"></span></div><div class="detail-body"><p data-publicdetail="bind:setDescription,description"></p><p data-publicdetail="bind:setSolution,solution"></p></div><div class="detail-footer"><div class ="rateIdea"><a class="item-acorn"></a><div class="rating" data-publicdetail="bind:setRating,votes"></div><div class="publicButton" data-publicdetail="bind:toggleVoteButton, votes" name="vote" data-publicdetailevent="listen: touchstart, press; listen: touchend, vote;" data-label="bind: innerHTML, votebuttonlbl"></div><div id="ratingPopup" class="popup"><ul class="acorns" data-vote="foreach"><li class="item-acorn" data-vote="bind: setIcon, active" data-publicdetailevent="listen: touchstart, previewVote; listen: touchend, castVote"></li></ul></div></div></div></div><div id="public-writetwocents" class="invisible" data-publicdetail="bind: displayWriteTwocent, authors"></div><div id="public-twocents" class="twocents" data-publicdetail="bind: displayTwocentList, twocents" data-place="place: PublicTwocentUI"></div></div>';
                
                //Public
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
                                        _publicTwocentList.reset(_store.get("_id"));
                                        _domWrite = document.getElementById("public-writetwocents");
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
                                if (name === "#public-2cents"){
                                        _twocentWriteUI.reset(_store.get("_id"));
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
                                                        // update polling list
                                                        Config.get("observer").notify("update-polling");
                                                        //cleanup 1- remove popup 2- hide vote button 3- reset vote store
                                                        document.getElementById("ratingPopup").classList.remove("appear");
                                                        vote.reset([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]);
                                                }
                                        });
                                }
                        };
                        
                        _widget.place(_dom);
                        

                //return
                        return _widget;
                };
        });