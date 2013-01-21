/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Connect/MTCDetails", ["Olives/OObject", "Config", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "WriteTwocent", "TwocentList", "Ideafy/Avatar", "Ideafy/Utils"],
        function(Widget, Config, Store, Model, Event, WriteTwocent, TwocentList, Avatar, Utils){
                
                return function MTCDetailsConstructor($type){
                        //$type can be TC (twocents) or TQ (twoquestion)
                        
                        var mtcDetailUI = new Widget(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            model = new Store(), 
                            ui = new Store({type: $type}),
                            twocentWriteUI = new WriteTwocent("connect"),
                            twocentList = new TwocentList(),
                            domWrite;
                        
                        mtcDetailUI.plugins.addAll({
                                "labels" : new Model(labels),
                                "tcdetail" : new Model(model, {
                                        // set header title (user or user contact)
                                        setHeader : function(author){
                                                if (!author) this.innerHTML = labels.get("selecttq")
                                                else if (author === user.get("_id")) this.innerHTML = labels.get("mytqdetailheader")
                                                else this.innerHTML = labels.get("tqheaderprefix")+model.get("username")+labels.get("tqheadersuffix")        
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
                                                if (!nb) this.innerHTML = labels.get("noreplyyet")
                                                else if (nb === 1) this.innerHTML = nb + " " + labels.get("showonetcreply")
                                                else this.innerHTML = nb + "showtcrepliesafter";        
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
                                "tcevent" : new Event(mtcDetailUI)       
                        });
                        
                        mtcDetailUI.template = '<div class="twocent-detail"><div class="header blue-dark"><span data-tcdetail="bind: setHeader, author"></span></div><div class = "detail-contents"><div class="detail-header"><div class="avatar" data-tcdetail="bind:setAvatar, author"></div><span class="author" data-tcdetail="bind:setAuthor,username"></span><span class="commentlbl" data-tcdetail="bind: setWrotelbl, author"></span><p data-tcdetail="bind:innerHTML,question"></p><span class="date" data-tcdetail="bind:date, creation_date"></span></div><div class="detail-body"></div><div class="detail-footer"><div class="tcbutton" data-tcevent="listen:touchstart, press; listen: touchend, write"></div><div class="tcreplies" data-tcdetail = "bind: displayTwocentNB, twocents"></div></div></div><div id="connect-writetwocents" class="invisible" data-tcdetail="bind: displayWriteTwocent, author"></div><div id="connect-twocents" class="twocents" data-tcdetail="bind: displayTwocentList, twocents"></div></div>';
                       
                       
                       mtcDetailUI.press = function(event, node){
                                node.classList.add("pressed");        
                       };
                       
                       mtcDetailUI.write = function(event, node){
                                node.classList.remove("pressed");
                                document.getElementById("connect-writetwocents").classList.remove("invisible");       
                       };
                       
                       mtcDetailUI.hide = function hide(){
                                document.querySelector(".detail-contents").classList.add("invisible");
                                model.reset({});       
                       };
                       
                       mtcDetailUI.reset = function reset(type, content){
                                ui.set("type", type);
                                model.reset(content.value);
                                twocentWriteUI.reset(model.get("_id"));
                                twocentList.reset(model.get("_id"), "connect");
                                domWrite = document.getElementById("connect-writetwocents");
                                twocentWriteUI.place(domWrite);        
                       };
                                              
                        return mtcDetailUI;       
                };
        });
