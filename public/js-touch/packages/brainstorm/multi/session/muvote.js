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
                            _user = Config.get("user"),
                            _session = null, // the current session
                            _uploadInProgress = false, // to avoid conflicts between two upload requests triggered to quickly
                            _onEnd; // callback when voting is finished
                        
                        _widget.plugins.addAll({
                                "label" : new Model(_labels),
                                "model" : new Model(_vote, {
                                        setVisible : function(bool){
                                                (bool) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        },
                                        setButton : function(bool){
                                                (bool) ? this.setAttribute("style", "display: inline-block;") : this.setAttribute("style", "display:none;");        
                                        },
                                        displayVote : function(vote){
                                                var type = this.getAttribute("name"),
                                                    votes = _vote.get(type+"Votes") || [],
                                                    yes = this.querySelector(".yesvote"),
                                                    no = this.querySelector(".novote");
                                                
                                                if (vote){
                                                        (votes.indexOf(_user.get("_id")) > -1) ? no.classList.add("invisible") : yes.classList.add("invisible")
                                                }
                                                else{
                                                        yes.classList.remove("invisible");
                                                        no.classList.remove("invisible");
                                                }
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
                        
                        _widget.template = '<div class = "confirm invisible"><legend><span data-label="bind:innerHTML, decidemsg"></span><span class="unanimity" data-label="bind: innerHTML, unanimity"></span></legend><div class="votingitem" name="public" data-model="bind:setVisible,public; bind: displayVote, publicVote"><div class="sessionquestion" data-label="bind:innerHTML,setpublic"></div><div class = "votingbuttons" name="public"><span class="yesvote" data-model="bind:setReadonly, publicResult" data-event="listen: touchstart, push; listen: touchend, vote">Yes</span><span class="novote" data-event="listen: touchstart, push; listen: touchend, vote">No</span></div><div class="votingresult" data-model="bind: setResult, publicResult"></div></div><div class="votingitem" name = "replay" data-model="bind:setVisible,replay; bind: displayVote, replayVote"><div class="sessionquestion" data-label="bind:innerHTML,enablereplay"></div><div class = "votingbuttons" name="replay"><span class="yesvote" data-model="bind:setReadonly, replayResult" data-event="listen: touchstart, push; listen: touchend, vote">Yes</span><span class="novote" data-event="listen: touchstart, push; listen: touchend, vote">No</span></div><div class="votingresult" data-model="bind: setResult, replayResult"></div></div><div class="option left votebutton" data-event="listen:touchstart, press; listen:touchend, submit" data-model="bind:setButton, submit" data-label="bind: innerHTML, submitlbl">Submit</div><div class="option right votebutton" data-event="listen:touchstart, press; listen:touchend, skip" data-model="bind:setButton, skip" data-label="bind:innerHTML, skiplbl">Skip</div></div>';
                        
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
                                        
                                        // if vote is negative
                                        if (node.classList.contains("nolbl")){
                                                if(type === "public") _vote.set("publicResult", "private");
                                                if (type === "replay") _vote.set("replayResult", "rejected");
                                        }
                                        else{
                                                // vote is positive
                                                
                                                // set vote type to true (leader only)
                                                if (_vote.get("leader")){
                                                        _vote.set(type, true);
                                                        _vote.set("submit", true);
                                                }
                                                
                                                // add vote
                                                votes.push(_user.get("_id"));
                                                _vote.set(type+"Votes", votes);
                                                // if all participants have voted yes on an item, set its result to public || accepted
                                                if (votes.length === _session.get(participants).length+1){
                                                        if(type === "public") _vote.set("publicResult", "public");
                                                        if (type === "replay") _vote.set("replayResult", "accepted");
                                                }
                                        }
                                        node.classList.add("voted");
                                        _vote.set(type+"Vote", true); // voted !
                                        
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
                                var vote;
                                
                                // leader's position gets uploaded when he pushes the submit button
                                if (!vote.get("leader")){
                                         vote = _session.get("vote");
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
                                var vote = {};
                                node.classList.remove("pressed");
                                Map.get("cache").classList.remove("votingcache");
                                
                                // hide skip and submit buttons (once vote is in progress leader has to wait for other's feedback)
                                _vote.set("skip", false);
                                _vote.set("submit", false);
                                
                                // register vote
                                ["public", "replay"].forEach(function(type){
                                        if (_vote.get(type)){
                                                vote[type] = true;
                                                vote[type+"Votes"] = [_user.get("_id")];
                                        }
                                        _vote.set(type+"Vote", true); // once submit is pressed leader cannot vote anymore
                                });
                                _session.set("vote", vote);
                                _session.upload()
                                .then(function(){
                                        console.log("VOTE : leader upload successful");
                                }, function(err){
                                        console.log(err);
                                        //probably need some conflict handling here
                                });   
                        };
                        
                        _widget.skip = function(event, node){
                                node && node.classList.remove("pressed");
                                _widget.close();
                                _onEnd({visibility: "private", replay: false});
                        };
                        
                        _widget.close = function hide(){
                                Map.get("cache").classList.remove("votingcache");
                                _widget.dom.classList.add("invisible");
                                _session = null;        
                        };
                        
                        _widget.isActive = function isActive(){
                                return !(_session === null);        
                        };
                        
                        _widget.show = function show(){
                                Map.get("cache").classList.add("votingcache");
                                _widget.dom.classList.remove("invisible");        
                        };
                        
                        _widget.reset = function reset(session, callback){
                                _session = session;
                                _onEnd = callback;
                                
                                _vote.reset({});
                                // session vote {public: true, publicVote: false, publicVotes:[], publicResult:"accepted/rejected", replay: true; replayVote: false, replayVotes:[], replayResult:"accepted/rejected"}}
                                if (_session.get("vote")) {
                                        _vote.reset(_session.get("vote"));
                                }
                                if (_session.get("initiator").id === _user.get("_id")){
                                        _vote.set("leader", true);
                                        _vote.set("submit", false); // hide submit button until a vote has been cast
                                        _vote.set("skip", true); // show skip button
                                        // always dispaly both questions for leader
                                        _vote.set("public", true);
                                        _vote.set("replay", true);
                                        ["public", "replay"].forEach(function(type){
                                                _vote.set(type, false);
                                                _vote.set(type+"Vote", false);
                                                _vote.set(type+"Votes", []);
                                                _vote.set(type+"Result", "");
                                        });
                                }
                                else{
                                        _vote.set("leader", false);
                                        _vote.set("submit", false);
                                        _vote.set("skip", false);
                                }
                                _vote.set("publicVote", false); // user voted on public
                                _vote.set("replayVote", false); // user voted on private 
                                
                                _widget.show();
                                
                                // watch the vote value of session
                                _session.watchValue("vote", function(vote){
                                        var result = {};
                                        if (vote && vote.public && vote.replay){
                                                if (vote.publicResult && vote.replayResult){
                                                        (vote.publicResult) ? result.visibility = "public" : result.visibility = "private";
                                                        (vote.replayResult === "accepted") ? result.replay = true : result.replay = false;
                                                        setTimeout(function(){
                                                                _onEnd && _onEnd(result)
                                                        }, 3000);
                                                }
                                        }
                                        else if (vote && vote.public){
                                                result.replay = false;
                                                if (vote.publicResult) {
                                                        result.visibility = vote.publicResult;
                                                        result.replay = false;
                                                        setTimeout(function(){
                                                                _onEnd && _onEnd(result)
                                                        }, 3000);
                                                }      
                                        }
                                        else if (vote && vote.replay){
                                                result.visibility = "private";
                                                if (vote.replayResult){
                                                        (vote.replayResult === "accepted") ? result.replay = true : result.replay = false;
                                                        setTimeout(function(){
                                                                _onEnd && _onEnd(result)
                                                        }, 3000);
                                                }
                                        }
                                });    
                        };
                        VOTE = _vote;
                        VOTEUI = _widget;
                        return _widget;       
                }
        })
