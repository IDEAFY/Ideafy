/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["OObject", "Store", "Bind.plugin", "Event.plugin", "service/utils", "service/config", "twocents/writetwocentreply", "service/avatar"],
        function(Widget, Store, ModelPlugin, EventPlugin, Utils, Config, WriteTwocentReply, Avatar){
                
                function TwocentReplyListConstructor($data, $id, $tc, $view){
                        
                        var store = new Store($data),
                            ui = this,
                            avatars,
                            user = Config.get("user"),
                            labels = Config.get("labels"),
                            transport = Config.get("transport");
                        
                        ui.plugins.addAll({
                                "reply": new ModelPlugin(store, {
                                        date : function date(date){
                                               if (date){
                                                       this.innerHTML = Utils.formatDate(date);
                                               }
                                        },
                                        setFirstname : function(firstname){
                                               var id = this.getAttribute("data-reply_id");
                                               this.innerHTML = firstname;
                                               if (store.get(id).author === user.get("_id")){
                                                        this.innerHTML = labels.get("youlbl");
                                                }
                                        },
                                        setReplylbl : function(firstname){
                                               var id = this.getAttribute("data-reply_id");
                                               this.innerHTML = labels.get("twocentreplycommentlbl");
                                               if (store.get(id).author === user.get("_id")){
                                                        this.innerHTML = labels.get("yourepliedlbl");
                                                }
                                        },
                                        setAvatar : function setAvatar(author){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);   
                                        },
                                        setVisible : function(author){
                                                (author && author === user.get("_id")) ? this.setAttribute("style", "display: block;") : this.setAttribute("style", "display: none;");
                                        },
                                        setInVisible : function(author){
                                                (author && author === user.get("_id")) ? this.setAttribute("style", "display: none;") : this.setAttribute("style", "display: block;");
                                        }
                                  }),
                                  "replyevent" : new EventPlugin(ui),
                                  "labels": new ModelPlugin(labels)
                        });
                        
                   ui.template = '<ul class="replies" data-reply="foreach"><li class="twocentReply"><div class="twocentHeader"><div class="replyAvatar" data-reply="bind:setAvatar, author"></div><div class="twocentAuthor" data-reply="bind: setFirstname, firstname"></div><span class="commentLabel" data-labels="bind: setReplylbl, firstname"></span><br/><div class="twocentDate date" data-reply="bind: date, date"></div><div class="twocentMenu"><div class="twocentButton twocentEditButton" data-reply="bind: setVisible, author" data-replyevent="listen: touchstart, edit"></div><div class="twocentButton twocentDeleteButton" data-reply="bind: setVisible, author" data-replyevent="listen: touchstart, deleteTwocentReply"></div><div class="twocentButton twocentReplyButton" data-reply="bind: setInVisible, author" data-replyevent="listen:touchstart, reply"></div></div></div><p class="twocentMessage replyMessage" data-reply="bind: innerHTML, message"></p><div class="writePublicTwocentReply replyToReply invisible"></div></li></ul>';
                   
                   ui.edit = function(event, node){
                                var id = node.getAttribute("data-reply_id"),
                                    currentUI = ui.dom.children[id],
                                    writeUI = new WriteTwocentReply(),
                                    cancel = function cancel(){
                                            ui.dom.replaceChild(currentUI, writeUI.dom);            
                                    },
                                    frag = document.createDocumentFragment();
 
                                writeUI.reset($id, $tc, $data[id], id, null, cancel);
                                writeUI.render();
                                writeUI.place(frag);
                                //replace current twocent with writeUI
                                ui.dom.replaceChild(frag, currentUI);
                                UI = ui.dom;      
                        };
                        
                        ui.deleteTwocentReply = function(event, node){
                               var position = node.getAttribute("data-reply_id"),
                                    json = {docId: $id, type: "deltcreply", twocent: $tc, position: position};
                                transport.request("WriteTwocent", json, function(result){
                                        if (result !== "ok"){
                                                alert(Config.get("labels").get("somethingwrong"));        
                                        }               
                                });    
                        };
                        
                        ui.reply = function(event, node){
                                var id = node.getAttribute("data-reply_id"),
                                    twocentParent = ui.dom.parentNode,
                                    parent = twocentParent.querySelector(".writePublicTwocentReply[data-reply_id='"+id+"']"),
                                    frag = document.createDocumentFragment(),
                                    writeUI = new WriteTwocentReply(parent);
                                // create writeReplyUI and pass info about initial reply
                                writeUI.reset($id, $tc, null, id, $data[id].firstname);
                                writeUI.render();
                                writeUI.place(frag);
                                 
                                if (!parent.hasChildNodes()){
                                        parent.appendChild(frag);
                                }
                                parent.classList.remove("invisible");                     
                        };     
              }
                        
              return function TwocentReplyListFactory($data, $id, $tc, $view){
                   TwocentReplyListConstructor.prototype = new Widget;
                   return new TwocentReplyListConstructor($data, $id, $tc, $view);       
              };    
                
        });