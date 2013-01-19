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
                            twocentWriteUI = new WriteTwocent(),
                            twocentList = new TwocentList(),
                            domWrite;
                        
                        mtcDetailUI.plugins.addAll({
                                "labels" : new Model(labels),
                                "tcdetail" : new Model(model, {
                                        // display twocents writing interface if applicable
                                        displayWriteTwocent : function(author){
                                            (author === user.get("_id")) ? this.classList.add("invisible") : this.classList.remove("invisible");    
                                        },
                                        // display twocentlist if present
                                        displayTwocentList : function(twocents){
                                                 if (twocents && twocents.length){
                                                    // hide twocent write interface    
                                                    document.getElementById("connect-writetwocents").classList.add("invisible");
                                                 }        
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
                                })        
                        });
                        
                        mtcDetailUI.template = '<div class="twocent-detail"><div class="header blue-dark"><span data-label="bind: innerHTML, ideadetailsheadertitle"></span></div><div class = "detail-contents"><div class="detail-header"><div class="avatar" data-tcdetail="bind:setAvatar, author"></div><span class="author" data-tcdetail="bind:setAuthor,username"></span><span class="commentlbl" data-tcdetail="bind: setWrotelbl, author"></span><p data-tcdetail="bind:innerHTML,question"></p><span class="date" data-tcdetail="bind:date, creation_date"></span></div><div class="detail-body"></div><div class="detail-footer"></div></div><div id="connect-writetwocents" class="invisible" data-tcdetail="bind: displayWriteTwocent, author"></div><div id="connect-twocents" class="twocents" data-tcdetail="bind: displayTwocentList, twocents"></div></div>';
                       
                       
                       mtcDetailUI.reset = function reset(type, content){
                                ui.set("type", type);
                                model.reset(content.value);
                                
                                console.log(model.toJSON());
                                domWrite = document.getElementById("connect-writetwocents");
                                twocentWriteUI.place(domWrite);        
                       };
                                              
                        return mtcDetailUI;       
                };
        });
