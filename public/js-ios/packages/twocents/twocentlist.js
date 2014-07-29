/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "CouchDBDocument", "Store", "Promise", "service/utils", "Bind.plugin", "Event.plugin", "twocents/twocentreplylist", "twocents/writetwocent", "twocents/writetwocentreply", "service/avatar"],
        function(Widget, Config, CouchDBDocument, Store, Promise, Utils, Model, Event, TwocentReplyList, WriteTwocent, WriteTwocentReply, Avatar){
                
                function TwocentListConstructor($view){
                       
                        // declaration
                        var ui = this,
                            cdb = new CouchDBDocument(),
                            labels = Config.get("labels"),
                            store = new Store([]),
                            transport = Config.get("transport"),
                            user = Config.get("user"),
                            $id,
                            view = $view;
                        
                        cdb.setTransport(transport);
                        // define plugins and methods
                        ui.plugins.addAll({
                                "labels" : new Model(Config.get("labels")),
                                "twocents" : new Model(store, {
                                        date : function date(date){
                                                if (date) {this.innerHTML = Utils.formatDate(date);}
                                        },
                                        setFirstName : function(firstname){
                                                var id;
                                                if (firstname){
                                                        if (firstname !== user.get("firstname")){
                                                                this.innerHTML = firstname;
                                                        }
                                                        else {
                                                                id = this.getAttribute("data-twocents_id");
                                                                (store.get(id).author === user.get("_id")) ? this.innerHTML = Config.get("labels").get("youlbl"): this.innerHTML = firstname;
                                                        }
                                                }
                                        },
                                        setCommentlbl : function(firstname){
                                                var id;
                                                if (firstname){
                                                        if (firstname !== user.get("firstname")){
                                                                this.innerHTML = labels.get("twocentcommentlbl");
                                                        }
                                                        else {
                                                                id = this.getAttribute("data-twocents_id");
                                                                (store.get(id).author === user.get("_id")) ? this.innerHTML = labels.get("youcommentedlbl"): this.innerHTML = labels.get("twocentcommentlbl");
                                                        }
                                                }
                                        },
                                        setVisible : function(author){
                                                if (author){
                                                        (author === user.get("_id")) ? this.setAttribute("style", "display: block;") : this.setAttribute("style", "display: none;");
                                                }
                                        },
                                        setInVisible : function(author){
                                                if (author){
                                                        (author === user.get("_id")) ? this.setAttribute("style", "display: none;") : this.setAttribute("style", "display: block;");
                                                }
                                        },
                                        deleteOK : function(replies){
                                                var tc;
                                                //Author cannot delete a twocent if there are already replies from other users
                                                if (replies && replies.length>0){
                                                        this.setAttribute("style", "display: none;");
                                                }
                                                else{
                                                        //check if user is actual author
                                                        tc = this.getAttribute("data-twocents_id");
                                                        (user.get("_id") === store.get(tc).author) ? this.setAttribute("style", "display: block;") : this.setAttribute("style", "display: none;");         
                                                }       
                                        },
                                        toggleHideButton : function(replies){
                                                if (!replies || !replies.length) this.classList.add("invisible");
                                                else {
                                                         this.classList.remove("invisible");
                                                         if (replies.length === 1){
                                                                this.innerHTML = Config.get("labels").get("showonetcreply");
                                                        }
                                                        else{
                                                                this.innerHTML = Config.get("labels").get("showtcrepliesbefore")+replies.length+Config.get("labels").get("showtcrepliesafter");
                                                        } 
                                               }      
                                        },
                                        displayReplies : function(replies){
                                                var tc, _ui, frag;
                                                if (!replies || !replies.length){
                                                        this.classList.add("invisible");}
                                                else {
                                                        tc = this.getAttribute("data-twocents_id");
                                                        _ui = new TwocentReplyList(replies, $id, tc, view);
                                                        frag = document.createDocumentFragment();
                                                        _ui.render();
                                                        _ui.place(frag);
                                                        
                                                        if (this.hasChildNodes()){
                                                                this.replaceChild(frag, this.firstChild);
                                                        }
                                                        else {
                                                                this.appendChild(frag);
                                                        }
                                                        this.classList.remove("invisible");
                                                }    
                                        },
                                        setAvatar : function setAvatar(author){
                                                var _frag, _ui;
                                                if (author){
                                                        _frag = document.createDocumentFragment();
                                                        _ui = new Avatar([author]);
                                                        _ui.place(_frag);
                                                        (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                                }
                                        }
                                }),
                                "twocentevent" : new Event(ui)        
                        });
                        
                        ui.template = '<ul class="twocentList" data-twocents="foreach"><li class="twocent"><div class="twocentHeader"><div class="twocentAvatar" data-twocents="bind: setAvatar, author"></div><div class="twocentAuthor"data-twocents="bind: setFirstName, firstname"></div><span class="commentLabel" data-twocents="bind: setCommentlbl, firstname"></span><br/><div class="twocentDate date" data-twocents="bind: date, date"></div><div class="twocentMenu"><div class="twocentButton twocentEditButton" data-twocents="bind: setVisible, author" data-twocentevent="listen: touchstart, edit"></div><div class="twocentButton twocentDeleteButton" data-twocents="bind: deleteOK, replies" data-twocentevent="listen: touchstart, deleteTwocent"></div><div class="twocentButton twocentReplyButton" data-twocents="bind: setInVisible, author" data-twocentevent="listen: touchstart, reply"></div></div></div><div class="twocentBody"><p class="twocentMessage" data-twocents="bind: innerHTML, message"></p><div class="repliesButton hideReplies" name="hide" data-twocents="bind: toggleHideButton, replies" data-twocentevent="listen: touchstart, toggleReplies" data-labels="bind:innerHTML, hidetwocentreplies"></div></div><div class="writePublicTwocentReply invisible"></div><div class="displayReplies" data-twocents="bind: displayReplies, replies"></div></li></ul>';
                        
                        ui.edit = function(event, node){
                                var id = node.getAttribute("data-twocents_id"),
                                    currentUI = ui.dom.children[id],
                                    writeUI = new WriteTwocent(),
                                    frag = document.createDocumentFragment(),
                                    cancel = function cancel(){
                                            ui.dom.replaceChild(currentUI, writeUI.dom);        
                                    };
                                    
                                writeUI.reset($id, store.get(id), id, cancel);
                                writeUI.render();
                                writeUI.place(frag);
                                // replace current twocent with writeUI
                                ui.dom.replaceChild(frag, currentUI);       
                        };
                        
                        ui.reset = function reset(id){
                                var promise = new Promise();
                                $id = id;
                                store.reset([]);
                                cdb.unsync();
                                cdb.reset({});
                                // retrieve twocents data from couchdb
                                cdb.sync(Config.get("db"), $id)
                                .then(function(){
                                        var tc = cdb.get("twocents") || [];
                                        if (tc.length) {store.reset(cdb.get("twocents"));}
                                        cdb.watchValue("twocents", function(value){
                                                store.reset(value);        
                                        });
                                        promise.fulfill();
                                }, function(err){console.log(err);});
                                return promise;
                        };
                        
                        ui.deleteTwocent = function(event, node){
                                var position = node.getAttribute("data-twocents_id"),
                                    json = {docId: $id, type: "delete", position: position, twocent:{author: user.get("_id")}};
                                
                                //should we ask for confirmation??
                                alert("Are you sure?");
                                
                                transport.request("WriteTwocent", json, function(result){
                                        if (result !== "ok"){
                                                alert(Config.get("labels").get("somethingwrong"));        
                                        }               
                                });      
                        };
                        
                        ui.reply = function(event, node){
                                var position = node.getAttribute("data-twocents_id"),
                                    parent = ui.dom.querySelector(".writePublicTwocentReply[data-twocents_id='"+position+"']"),
                                    writeUI = new WriteTwocentReply(parent),
                                    frag = document.createDocumentFragment();
                                    
                                    writeUI.reset($id, position);
                                    writeUI.render();
                                    writeUI.place(frag);
                                    
                                    if (!parent.hasChildNodes()){
                                            parent.appendChild(frag);
                                    }
                                    parent.classList.remove("invisible");                          
                        };
                        
                        ui.toggleReplies = function(event, node){
                                var position = node.getAttribute("data-twocents_id"),
                                    replies = store.get(position).replies,
                                    name = node.getAttribute("name"),
                                    dom = ui.dom.querySelector(".displayReplies[data-twocents_id='"+position+"']"); 
                                       
                                if (name === "show"){
                                        // show twocent replies
                                        dom.classList.remove("invisible");
                                        // toggle button to hide mode
                                        node.setAttribute("name", "hide");
                                        node.classList.remove("showReplies");
                                        node.classList.add("hideReplies");
                                }
                                else {
                                        // hide twocent replies
                                        dom.classList.add("invisible");
                                        // toggle button to show mode
                                        node.setAttribute("name", "show");
                                        node.classList.remove("hideReplies");
                                        node.classList.add("showReplies");
                                }
                        };
                }
                
                return function TwocentListFactory($view){
                        TwocentListConstructor.prototype = new Widget();
                        return new TwocentListConstructor($view);
                };
        });
