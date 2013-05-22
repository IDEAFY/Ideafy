/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "Store"],
        function(Widget, Map, Model, Event, Config, Store){
                
                return function MuVoteConstructor(){
                
                        var _widget = new Widget(),
                            _labels = Config.get("labels"),
                            _vote = new Store(),
                            _user = Config.get("users"),
                            _session = null, // the current session
                            _uploadInProgress = false, // to avoid conflicts between two upload requests triggered to quickly
                            _onEnd; // callback when voting is finished
                        
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "model" : new Model(_vote, {
                                        setVisible : function(bool){
                                                (bool) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        },
                                        setLabel : function(pVote){
                                                
                                        },
                                        setResult : function(result){
                                                if (result){
                                                        this.innerHTML = _labels.get(result);
                                                }
                                                else{
                                                        this.innerHTML = "";
                                                }
                                        }
                                }),
                                "event" : new Event(_widget)
                        });
                        
                        _widget.template = '<div class = "confirm"><legend data-label="bind:innerHTML, decidemsg"></legend><span class="unanimity" data-label="bind: innerHTML, unanimity"></span><div class="votingItem" data-model="bind:setVisible,public"><p class="sessionquestion" data-label="bind:innerHTML,setpublic"></p><div class = "votingbuttons" name="public"><span class="yesvote" data-model="bind:setReadonly, publicResult" data-event="listen: touchstart, push; listen: touchend, vote">Yes</span><span class="novote" data-event="listen: touchstart, push; listen: touchend, vote">No</span></div><div class="votingresult" data-model="bind: setResult, publicResult"></div></div><div class="votingItem" data-model="bind:setVisible,replay"><p class="sessionquestion" data-label="bind:innerHTML,enablereplay"></p></div><div class="option left" data-event="listen:touchstart, press; listen:touchend, submit" data-model="bind:setVisible, leader" data-label="bind: innerHTML, submitlbl">Submit</div><div class="option right" data-event="listen:touchstart, press; listen:touchend, skip" data-model="bind:setVisible, leader" data-label="bind:innerHTML, skiplbl">Skip</div></div>';
                        
                        _widget.press = function(event, node){
                                event.stopPropagation();
                                node.classList.add("pressed");
                        };
                        
                        _widget.push = function(event, node){
                                // only act on touchstart events if vote is not decided (i.e.e rejected) and if user has not alredy voted on topic
                                var p = node.parentNode,
                                    type = p.getAttribute("name");
                                if (!_vote.get(type+"Vote") && !_vote.get(type+"Result")){
                                        node.setAttribute("style", "-webkit-box-shadow: 0px 0px 2px #657B99;");        
                                }
                        };
                        
                        _widget.vote = function vote(event, node){
                                var p = node.parentNode,
                                    type = p.getAttribute("name");
                                
                                // remove pushed style
                                node.setAttribute("style", "-webkit-box-shadow: none;");
                                
                                // handle vote if not voted yet
                                if (!_vote.get(type+"Vote")){
                                        var votes = _vote.get(type+"Votes");
                                        _vote.set(type+"Vote", true); // voted !
                                        
                                        // if vote is negative
                                        if (node.classList.contains("nolbl")){
                                                if(type === "public") _vote.set("publicResult", "private");
                                                if (type === "replay") _vote.set("replayResult", "rejected");
                                        }
                                        else{
                                                // if vote is positive
                                                votes.push(_user.get("_id"));
                                                _votes.set(type+"Votes", votes);
                                                // if all participants have voted yes on an item, set its result to public || accepted
                                                if (votes.length === _session.get(partipants).length+1){
                                                        if(type === "public") _vote.set("publicResult", "public");
                                                        if (type === "replay") _vote.set("replayResult", "accepted");
                                                }
                                        
                                        // upload vote to database
                                        if (!_uploadInProgress){
                                                _widget.uploadVote();
                                        }
                                        else{
                                                setTimeout(_widget.uploadVote, 3000);
                                        }
                                }        
                        };
                        
                        _widget.uploadVote = function uploadVote(){
                                var vote = _session.get("vote");
                                
                                // leader's position gets uploaded when he pushes the submit button
                                if (!vote.get("leader")){
                                        _uploadInProgress = true;
                                        if (vote.public){
                                                vote.publicVotes = _vote.get("publicVotes");
                                                vote.publicResult = _vote.get("publicResult");
                                        }
                                        if (vote.replay){
                                                vote.replayVotes = _vote.get("replayVotes");
                                                vote.replayResult = _vote.get("publicResult");
                                        }
                                        _session.set("vote", vote);
                                        _session.upload()
                                        .then(function(){
                                                console.log("upload ok");
                                                _uploadInProgress = false;
                                         }, function(conflict){
                                                 console.log(conflict);
                                         })
                                }       
                        };
                        
                        _widget.submit = function(event, node){
                                node.classList.remove("pressed");
                                Map.get("cache").classList.remove("appear");   
                        };
                        
                        _widget.skip = function(event, node){
                                node && node.classList.remove("pressed");
                                _widget.close();
                        };
                        
                        _widget.close = function hide(){
                                Map.get("cache").classList.remove("appear");
                                _widget.dom.classList.add("invisible");
                                _session = null;        
                        };
                        
                        _widget.isActive = function isActive(){
                                return !(_session === null);        
                        };
                        
                        _widget.show = function show(){
                                Map.get("cache").classList.add("appear");
                                _widget.dom.classList.remove("invisible");        
                        };
                        
                        _widget.reset = function reset(session, callback){
                                _session = session;
                                _onEnd = callback;
                                
                                // session vote {public: true, publicVote: false, publicVotes:[], publicResult:"accepted/rejected", replay: true; replayVote: false, replayVotes:[], replayResult:"accepted/rejected"}}
                                _vote.reset(_session.get("vote"));
                                if (_session.get("initiator").id === _user.get("_id")){
                                        _vote.set("leader", true);
                                }
                                _vote.set("publicVote", false); // user voted on public
                                _vote.set("replayVote", false); // user voted on private 
                                
                                _widget.show();     
                        };
                        
                        _session.watchValue("vote", function(){
                                var result = {};
                                if (vote.public && vote.replay){
                                        if (vote.publicResult && vote.replayResult){
                                                (vote.publicResult) ? result.visibility = "public" : result.visibility = "private";
                                                (vote.replayResult === "accepted") ? result.replay = true : result.replay = false;
                                                setTimeout(function(){
                                                        _onEnd && _onEnd(result)
                                                }, 3000);
                                                
                                        }
                                }
                                else if (vote.public){
                                        result.replay = false;
                                        if (vote.publicResult) {
                                                result.visibility = vote.publicResult;
                                                setTimeout(function(){
                                                        _onEnd && _onEnd(result)
                                                }, 3000);
                                        }      
                                }
                                else if (vote.replay){
                                        result.visibility = "private";
                                        if (vote.replayResult){
                                                (vote.replayResult === "accepted") ? result.replay = true : result.replay = false;
                                                setTimeout(function(){
                                                        _onEnd && _onEnd(result)
                                                }, 3000);
                                        }
                                }
                         });
                        
                        return _widget;       
                }
        })
