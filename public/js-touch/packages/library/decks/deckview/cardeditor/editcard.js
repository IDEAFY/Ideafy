/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBDocument", "Bind.plugin", "Event.plugin", "Store"],
        function(Widget, Config, CouchDBDocument, Model, Event, Store){
           
           return function EditCardConstructor(){
                
                var editCard = new Widget(),
                    user = Config.get("user"),
                    labels = Config.get("labels"),
                    cardTemplate = {
                        "_id": "",
                        "default_lang": user.get("lang"),
                        "title": "",
                        "didYouKnow": "",
                        "deck": [],
                        "category": "",
                        "coefficient": 1,
                        "sources": [],
                        "created_by": user.get("_id"),
                        "created_on": [],
                        "picture_credit": "",
                        "type": null,
                        "picture_file": ""
                    },
                    model = new CouchDBDocument(cardTemplate);
                
                editCard.plugins.addAll({
                        "label" : new Model(labels),
                        "model" : new Model(model, {
                                formatTitle : function(title){
                                                if (title) {
                                                        this.innerHTML = title.toUpperCase();
                                                        this.setAttribute("style", "color: #292929;");
                                                }
                                                else{
                                                        this.innerHTML = labels.get("quickstarttitle");
                                                        this.setAttribute("style", "color: #CCCCCC;");
                                                }
                                }
                        }),
                        "editevent" : new Event(editCard)
                });
                
                editCard.template = '<div class="cardpopup"><div class="card-detail"><div class="cd-header blue-dark"><div name="title" data-carddetails="bind: formatTitle, title" data-editevent="listen: touchstart, clearDefault" contenteditable=true></div></div><div class="cd-picarea"><div class="cardpicture" data-carddetails="bind:setPic, picture_file"></div><div class="piceditbuttons"><div class="choosepic" data-label="bind:innerHTML, importpiclbl" data-editevent="listen: touchstart, press; listen:touchend, picturePreview"></div><div class="takepic" data-importevent="listen: touchstart, press; listen:touchend, cameraPreview" data-label="bind:innerHTML, importcameralbl"></div></div><div class="cardinfo"><p><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit">Picture credits</span><br/><span class="cd-sourcelbl" data-label="bind:innerHTML, source">Source : </span><span class="cd-info" data-carddetails="bind: setSources, sources"></span></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, dyknow"></span><p class = "dyknow" data-carddetails="bind:innerHTML,didYouKnow"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>';
               
               editCard.reset = function reset(id, type){
                        if (id === "new"){
                                model.reset(cardTemplate);
                                if (type === "contexts"){model.set("type", 2);}
                                if (type === "problems"){model.set("type", 3);}  
                                if (type === "techno"){model.set("type", 4);}        
                        }
                        else{
                                
                        } 
               };
               
               editCard.clearDefault = function clearDefault(event, node){
                        var field = node.getAttribute("name");
                        if (model.get("field") === "") node.innerHTML = "";        
               };
               
               // init
               model.setTransport(Config.get("transport"));
                
               return editCard;         
           };   
        });

