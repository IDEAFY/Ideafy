/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "CouchDBDocument", "Bind.plugin", "Event.plugin", "Store"],
        function(Widget, Config, CouchDBDocument, Model, Event, Store){
           
           return function EditCharConstructor(){
                
                var editChar = new Widget(),
                    user = Config.get("user"),
                    labels = Config.get("labels"),
                    charTemplate = {
                                "_id": "",
                                "default_lang": user.get("lang"),
                                "title": "",
                                "gender": 0,
                                "age": 0,
                                "firstname": "",
                                "lastname": "",
                                "location": "",
                                "occupation": {
                                        "description": "",
                                        "details": [1,"",""]
                                },
                                "family": {"couple": 0, "children": 0},
                                "leisure_activities": [{"name": "", "comment": ""}, {"name": "", "comment": ""}, {"name": "", "comment": ""}],
                                "interests": [{"name": "", "comment": ""}, {"name": "", "comment": ""}, {"name": "", "comment": ""}],
                                "comments": null,
                                "type": 1,
                                "deck": [],
                                "created_by": user.get("_id"),
                                "created_on": [],
                                "picture_file": ""
                        },
                        model = new CouchDBDocument(charTemplate);

                editChar.plugins.addAll({
                        "label" : new Model(labels),
                        "model" : new Model(model)
                });
                
                editChar.template = '<div class="cardpopup"><div class="card-detail"><div class="cd-header blue-dark"> <span data-carddetails="bind: formatName, firstname"></span><div class="close-popup" data-popupevent="listen:touchstart, close"></div></div><div class="cd-picarea"><div class="cardpicture" data-carddetails="bind:setPic, picture_file"></div><div class="cardinfo"><p><span class="cd-agelbl"></span><span data-carddetails="bind:innerHTML, age">age</span><span class="agesuffix" data-label="bind:innerHTML, agelbl"></span><br/><span class="cd-locationlbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, location"></span><br/><span class="cd-joblbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, occupation.description"></span><br/><span class="cd-familylbl"></span><span class="cd-info" data-carddetails="bind: setFamily, family"></span><br/><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit"></span></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, hobbieslbl">Hobbies</span><p class = "charinfo" data-carddetails="bind:setLeisure, leisure_activities">hobbies</p><span class="contentTitle" data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "charinfo" data-carddetails="bind: setInterests, interests">Centers of interest</p><span class="contentTitle" data-label="bind: innerHTML, commentslbl">Comments</span><p class = "charinfo" data-carddetails="bind:setComments, comments"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>';
               
               editChar.reset = function reset(id){
                        if (id === "new"){
                                
                        }
                        else{
                                
                        } 
               };
                
               // init
               model.setTransport(Config.get("transport"));
                
               return editChar;         
           };   
        });

