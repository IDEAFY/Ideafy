/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Store", "CouchDBDocument", "Bind.plugin", "Event.plugin", "twocents/writetwocent", "twocents/twocentlist", "Place.plugin", "service/utils"],
        function(Widget, Config, Store, CouchDBDocument, Model, Event, WriteTwocent, TwocentList, Place, Utils){
                
                function AttachmentConstructor($type){
                       
                        // declaration
                        var ui = this,
                             _attachmentTwocentListUI = new TwocentList("attach"),
                             _twocentWriteUI = new WriteTwocent("attach"),
                            cdb = new CouchDBDocument(),
                            labels = Config.get("labels"),
                            transport = Config.get("transport"),
                            user = Config.get("user"),
                            vote = new Store([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]),
                            _voted = false;
                        
                        cdb.setTransport(transport);
                        // define plugins and methods
                        ui.plugins.addAll({
                                "labels" : new Model(Config.get("labels")),
                                "attach" : new Model(cdb,{
                                        setCat : function(cat){
                                                var cats = Config.get("cat"), colors = Config.get("catColors"), idx = cats.indexOf(cat);
                                                if (idx > -1) {
                                                        this.innerHTML = labels.get(cat);
                                                        this.setAttribute("style", "color:" + colors[idx]);
                                                }
                                                else{
                                                        this.innerHTML = cat;
                                                        this.setAttribute("sytle", "color: #404040");
                                                }
                                        },
                                        displayTwocentList : function(twocents){
                                                (twocents && twocents.length) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                        },
                                        setDate : function(id){
                                                var stamp = parseInt(id.replace("A:", ""), 10),
                                                      date = new Date(stamp);
                                                console.log("stamp", date);
                                                this.innerHTML = date.toLocaleDateString();
                                        },
                                        showVoting : function(id){
                                                var arr = user.get("rated_a") || [], authors = cdb.get("authors");
                                                if (authors.indexOf(user.get("_id")) > -1){
                                                        this.classList.add("invisible");
                                                }
                                                else{
                                                        (arr.indexOf(id) > -1) ? this.classList.add("invisible") : this.classList.remove("invisible");
                                                }
                                        },
                                        showRating : function(votes){
                                                var votingEl = ui.dom.querySelector(".a-vote");
                                                this.classList.add("invisible");
                                                if (votes && votes.length && votingEl.classList.contains("invisible")){
                                                        this.classList.remove("invisible");
                                                }
                                        },
                                        displayRating : function(votes){
                                                if (votes && votes.length){
                                                        this.innerHTML =   Math.round(votes.reduce(function(x,y){return (x+y);})/votes.length*100)/100;      
                                                }        
                                        }
                                }),
                                "vote" : new Model(vote,{
                                        setIcon : function(active){
                                                var styleActive = "background-image: url('img/public/activeIdeaVote.png');",
                                                    styleInactive = "background-image: url('img/public/rateForList.png');";
                                                (active) ? this.setAttribute("style", styleActive) : this.setAttribute("style", styleInactive);
                                        }
                                }),
                                "place": new Place({"LibraryTwocentUI" : _attachmentTwocentListUI}),
                                "attachevent" : new Event(ui)        
                        });
                        
                        ui.template = '<div class = "attachment-screen invisible"><div class="close-popup" data-attachevent = "listen:mousedown, close"></div><div class="attach-header" data-attach="bind:innerHTML, name"></div><div class="attach-body"><div class="a-type" data-attach="bind:setType, type"></div><div class="a-left"><div class="a-name" data-attach="bind:innerHTML, name"></div><div class="a-contrib"><span class="a-span" data-labels="bind: innerHTML, contrib"></span><span class="a-author" data-attach="bind: innerHTML, authornames"></span></div><div class="a-date" data-attach="bind:setDate, _id"></div></div><div class="a-cat" data-attach="bind:setCat, category"></div><div class="a-rating invisible" data-attach="bind:showRating, votes"><span data-attach="bind:displayRating, votes"></span></div><div class="a-vote" data-attach="bind:showVoting, _id"><legend data-labels="bind:innerHTML, rateit"></legend><ul class="acorns" data-vote="foreach"><li class="item-acorn" data-vote="bind: setIcon, active" data-attachevent="listen: mousedown, previewVote; listen: mouseup, castVote"></li></ul></div></div><div id="attach-writetwocents"></div><div div id="attach-twocents" class="twocents" data-attach="bind:displayTwocentList, twocents" data-place="place:LibraryTwocentUI"></div></div>';
                        
                        ui.reset = function reset(id){
                                // complete UI build (twocents) and display
                                var _domWrite = ui.dom.querySelector("#attach-writetwocents");
                                
                                _twocentWriteUI.reset(id);
                                _attachmentTwocentListUI.reset(id);
                                
                                ui.dom.classList.remove("invisible");
                                _twocentWriteUI.place(_domWrite);
                                
                                // retrieve attachment document form database
                                cdb.unsync();
                                cdb.reset({});
                                cdb.sync(Config.get("db"), id)
                                .then(function(){
                                        console.log(cdb.toJSON());
                                }, function(err){console.log(err);});
                        };
                        
                        ui.close = function(event, node){
                               ui.dom.classList.add("invisible");
                               document.querySelector(".cache").classList.remove("appear");
                        };
                        
                        ui.previewVote = function(event, node){
                             var i=0, idx = node.getAttribute("data-vote_id");
                             vote.loop(function(v,i){
                                     (i<=idx) ? vote.update(i, "active", true):vote.update(i, "active",false);        
                             });            
                        };
                        
                        ui.castVote = function(event, node){
                                var grade = parseInt(node.getAttribute("data-vote_id"))+1,
                                    id = cdb.get("_id"),
                                    json = {id : id, vote: grade, voter: user.get("_id")};
                                
                                // prevent multiple votes on the same idea -- if request fails or before database is updated 
                                if (!_voted){
                                        _voted = true;
                                        transport.request("Vote", json, function(result){
                                                var ra = user.get("rated_a") || [];
                                                if (result !== "ok"){
                                                        console.log(result, "something went wrong, please try again later");
                                                        _voted = false;
                                                }
                                                else {
                                                        // update user store locally to keep consistency
                                                        ra.unshift(id);
                                                        user.set("rated_a", ra);
                                                        alert(Config.get("labels").get("thankyou"));
                                                        
                                                        // hide voting interface and display rating
                                                        ui.dom.querySelector(".a-vote").classList.add("invisible");
                                                        ui.dom.querySelector(".a-rating").classList.remove("invisible");
                                                        
                                                        //cleanup 
                                                        vote.reset([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]);
                                                }
                                        });
                                }
                        };
                }
                
                return function TwocentListFactory($type){
                        AttachmentConstructor.prototype = new Widget();
                        return new AttachmentConstructor($type);
                };
        });
