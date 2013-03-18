/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "service/map", "service/utils", "service/avatar", "service/config", "twocents/writetwocent", "twocents/twocentlist", "Observable"], 
        function(Widget, Store, Model, Event, Map, Utils, Avatar, Config, WriteTwocent, TwocentList, Observable){
                return function PublicDetailConstructor($action){
                //declaration
                        var  _widget = new Widget(),
                             _twocentWriteUI = new WriteTwocent(),
                             _twocentList = new TwocentList(),
                             _labels = Config.get("labels"),
                             vote = new Store([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]),
                             _voted = false,
                             user = Config.get("user"),
                             transport = Config.get("transport"),
                             observer = Config.get("observer"),
                             _store = new Store(),
                             _dom = Map.get("public-detail"),
                             _domWrite,
                             _obs = new Observable();

                //setup
                        
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
                                                if (authornames === user.get("username") && _store.get("doc").authors.indexOf(user.get("_id"))>-1){
                                                        this.innerHTML = _labels.get("youlbl");
                                                }
                                                else {
                                                        this.innerHTML = authornames;
                                                }
                                        },
                                        setWrotelbl : function(authors){
                                                if (authors.length === 1 && authors[0]===user.get("_id")){
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
                                        setRating : function setRating(rating) {
                                                // this is necessary because the rating data is not supplied by the lucene design do --> to be investigated
                                                if (rating === undefined) {
                                                        var _id = this.getAttribute("data-listideas_id"),
                                                            _arr = _store.get(_id).doc.votes;
                                                        if (_arr.length === 0) this.innerHTML = ""
                                                        else {
                                                                this.innerHTML = Math.round(_arr.reduce(function(x,y){return x+y;})/_arr.length*100)/100;
                                                        }
                                                }
                                                else this.innerHTML = Math.round(rating*100)/100;
                                        },
                                        // display a vote button or the number of votes on an idea
                                        toggleVoteButton : function(votes){
                                                var idea = _store.get("id"),
                                                    authors = _store.get("doc").authors;
                                                
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
                                "publicdetailevent" : new Event(_widget)
                        });

                        _widget.template='<div class="public-idea"><div class="header blue-dark"><a href="#public-2cents" data-publicdetail="bind: toggleTwocentShare, doc.authors" data-publicdetailevent="listen: touchstart, action" class="option left"></a><span data-label="bind: innerHTML, publicdetailsheadertitle"></span><a href="#public-favorites" data-publicdetail="bind: toggleRateEdit, doc.authors" data-publicdetailevent="listen: touchstart, action" class="option right"></a></div><div class = "detail-contents"><div class="detail-header"><div class="avatar" data-publicdetail="bind:setAvatar, doc.authors"></div><h2 data-publicdetail="bind:innerHTML,doc.title"></h2><span class="date" data-publicdetail="bind:date, doc.creation_date"></span><br><span class="author" data-publicdetail="bind:setAuthor,doc.authornames"></span><span class="commentlbl" data-publicdetail="bind: setWrotelbl, doc.authors"></span></div><div class="detail-body"><p data-publicdetail="bind:innerHTML,doc.description"></p><p data-publicdetail="bind:innerHTML,doc.solution"></p></div><div class="detail-footer"><div class ="rateIdea"><a class="item-acorn"></a><div class="rating" data-publicdetail="bind:setRating,value.rating"></div><div class="publicButton" data-publicdetail="bind:toggleVoteButton, doc.votes" name="vote" data-publicdetailevent="listen: touchstart, press; listen: touchend, vote;" data-label="bind: innerHTML, votebuttonlbl"></div><div id="ratingPopup" class="popup"><ul class="acorns" data-vote="foreach"><li class="item-acorn" data-vote="bind: setIcon, active" data-publicdetailevent="listen: touchstart, previewVote; listen: touchend, castVote"></li></ul></div></div></div></div><div id="public-writetwocents" class="invisible" data-publicdetail="bind: displayWriteTwocent, doc.authors"></div><div id="public-twocents" class="twocents" data-publicdetail="bind: displayTwocentList, doc.twocents"></div></div>';
                
                //Public
                        _widget.reset = function reset(viewStore, index){
                                // when clicking on a new idea -- reset _voted param to false, idea store and pass idea's id to twocents
                                _voted = false;
                                _store.reset(viewStore.get(index));
                                _twocentWriteUI.reset(_store.get("id"));
                                _twocentList.reset(_store.get("id"), "public");
                                _domWrite = document.getElementById("public-writetwocents");
                                _twocentWriteUI.place(_domWrite);
                                
                                // watch viewStore for changes regarding this idea and update model accordingly
                                viewStore.watch("updated", function(idx, value){
                                        if (idx === parseInt(index)){
                                            _store.reset(value);        
                                        }
                                });
                        };
                        
                        _widget.action = function(event, node){
                                var name = node.getAttribute("href");
                                if (name === "#public-2cents"){
                                        console.log("twocents action");
                                         _twocentWriteUI.reset(_store.get("id"));
                                         console.log(_domWrite);
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
                                    id = _store.get("id"),
                                    json = {id : id, vote: grade, voter: user.get("_id")};
                                
                                // prevent multiple votes on the same idea -- if request fails or before database is updated 
                                if (!_voted){
                                        _voted = true;
                                        transport.request("Vote", json, function(result){
                                                if (result != "ok"){
                                                        console.log(result, "something went wrong, please try again later");
                                                        _voted = false;
                                                }
                                                else {
                                                        alert(Config.get("labels").get("thankyou"));
                                                        
                                                        //cleanup 1- remove popup 2- hide vote button 3- reset vote store
                                                        document.getElementById("ratingPopup").classList.remove("appear");
                                                        _node = _dom.querySelector("publicButton");;
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