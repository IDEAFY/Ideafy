/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "service/config", "Store", "Bind.plugin", "Event.plugin", "twocents/writetwocent", "twocents/twocentlist", "service/avatar", "service/utils", "Place.plugin"],
        function(Widget, Config, Store, Model, Event, WriteTwocent, TwocentList, Avatar, Utils, Place){
                
                return function MTQDetailsConstructor(){
                        
                        var mtqDetailUI = new Widget(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            model = new Store(),
                            twocentWriteUI = new WriteTwocent("connect"),
                            twoqTwocentList = new TwocentList("connect"),
                            domWrite;
                        
                        mtqDetailUI.plugins.addAll({
                                "labels" : new Model(labels),
                                "tqdetail" : new Model(model, {
                                        // set header title (user or user contact)
                                        setHeader : function(author){
                                                if (!author) this.innerHTML = labels.get("selecttq");
                                                else if (author === user.get("_id")) this.innerHTML = labels.get("mytqdetailheader");
                                                else this.innerHTML = labels.get("tqheaderprefix")+model.get("username")+labels.get("tqheadersuffix");      
                                        },
                                        // display twocents writing interface if applicable
                                        displayWriteTwocent : function(author){
                                            (!author || author === user.get("_id")) ? this.classList.add("invisible") : this.classList.remove("invisible");    
                                        },
                                        // display twocentlist if present
                                        displayTwocentList : function(twocents){
                                                 if (twocents && twocents.length){
                                                    // hide twocent write interface    
                                                    document.getElementById("connect-writetwocents").classList.add("invisible");
                                                 }        
                                        },
                                        // display number of twocents
                                        displayTwocentNB : function(twocents){
                                                var nb = twocents.length || 0;
                                                if (!nb) this.innerHTML = labels.get("noreplyyet");
                                                else if (nb === 1) this.innerHTML = nb + " " + labels.get("showonetcreply");
                                                else this.innerHTML = nb + labels.get("showtcrepliesafter");        
                                        },
                                        date : function date(date){
                                                if (date) this.innerHTML = Utils.formatDate(date);
                                        },
                                        setAuthor : function(username){
                                                if (username === user.get("username") && model.get("author")===user.get("_id")){
                                                        this.innerHTML = labels.get("youlbl");
                                                }
                                                else {
                                                        this.innerHTML = username;
                                                }
                                        },
                                        setWrotelbl : function(author){
                                                if (author === user.get("_id")){
                                                        this.innerHTML = labels.get("youwrotelbl");
                                                }
                                                else {
                                                        this.innerHTML = labels.get("ideawrotelbl");
                                                }        
                                        },
                                        setAvatar : function setAvatar(author){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        },
                                }),
                                "place" : new Place({"TwoQTwocentList": twoqTwocentList}),
                                "tqevent" : new Event(mtqDetailUI)       
                        });
                        
                        mtqDetailUI.template = '<div class="twocent-detail"><div class="header blue-dark"><span data-tqdetail="bind: setHeader, author"></span></div><div class = "detail-contents"><div class="detail-header"><div class="avatar" data-tqdetail="bind:setAvatar, author"></div><span class="author" data-tqdetail="bind:setAuthor,username"></span><span class="commentlbl" data-tqdetail="bind: setWrotelbl, author"></span><p data-tqdetail="bind:innerHTML,question"></p><span class="date" data-tqdetail="bind:date, creation_date"></span></div><div class="detail-body"></div><div class="detail-footer"><div class="tcbutton" data-tqevent="listen:mousedown, press; listen: mouseup, write"></div><div class="tcreplies" data-tqdetail = "bind: displayTwocentNB, twocents"></div></div><div id="connect-writetwocents" class="invisible" data-tqdetail="bind: displayWriteTwocent, author"></div><div id="connect-twocents" class="twocents" data-tqdetail="bind: displayTwocentList, twocents" data-place="place:TwoQTwocentList"></div></div></div>';
                       
                       
                       mtqDetailUI.press = function(event, node){
                                node.classList.add("pressed");        
                       };
                       
                       mtqDetailUI.write = function(event, node){
                                node.classList.remove("pressed");
                                document.getElementById("connect-writetwocents").classList.remove("invisible");       
                       };
                       
                       mtqDetailUI.hide = function hide(){
                                document.querySelector(".detail-contents").classList.add("invisible");
                                model.reset({});       
                       };
                       
                       mtqDetailUI.reset = function reset(content){
                                model.reset(content.value);
                                twocentWriteUI.reset(model.get("_id"));
                                twoqTwocentList.reset(model.get("_id"));
                                domWrite = mtqDetailUI.dom.querySelector("#connect-writetwocents");
                                twocentWriteUI.place(domWrite);      
                       };
                       
                       mtqDetailUI.place(document.createDocumentFragment()); // reply not displayed at first click                     
                        return mtqDetailUI;       
                };
        });
