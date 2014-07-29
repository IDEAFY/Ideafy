/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("olives"),
      emily = require("emily"),
      Widget = olives.OObject,
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Store = emily.Store,
      Config = require("./config");

var CardPopupConstructor = function($close){

        var cardDetails = new Store(),
              labels = Config.get("labels"),
              _dom, // the node to which to attach the popup
              position = {x:0, y:0}, // position of the popup
              charTemplate = '<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark"> <span data-carddetails="bind: formatName, firstname"></span><div class="close-popup" data-popupevent="listen:mousedown, close"></div></div><div class="cd-picarea"><div class="cardpicture" data-carddetails="bind:setPic, picture_file"></div><div class="cardinfo"><ul><li><span class="cd-agelbl"></span><span data-carddetails="bind:innerHTML, age"></span><span class="agesuffix" data-label="bind:innerHTML, agelbl"></span></li><li><span class="cd-locationlbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, location"></span></li><li><span class="cd-joblbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, occupation.description"></span></li><li><span class="cd-familylbl"></span><span class="cd-info" data-carddetails="bind: setFamily, family"></span></li><li><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit"></span></li></ul></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, hobbieslbl">Hobbies</span><p class = "charinfo" data-carddetails="bind:setLeisure, leisure_activities">hobbies</p><span class="contentTitle" data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "charinfo" data-carddetails="bind: setInterests, interests">Centers of interest</p><span class="contentTitle" data-label="bind: innerHTML, commentslbl">Comments</span><p class = "charinfo" data-carddetails="bind:setComments, comments"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>',
              defaultTemplate = '<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark"> <span data-carddetails="bind: formatTitle, title"></span><div class="close-popup" data-popupevent="listen:mousedown, close"></div></div><div class="cd-picarea"><div class="cardpicture" data-carddetails="bind:setPic, picture_file"></div><div class="cardinfo"><p><span class="cd-creditslbl" data-label="bind:innerHTML, credits"></span><span class="cd-info" data-carddetails="bind:innerHTML, picture_credit">Picture credits</span><br/><span class="cd-sourcelbl" data-label="bind:innerHTML, source">Source : </span><span class="cd-info" data-carddetails="bind: setSources, sources"></span></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, dyknow"></span><p class = "dyknow" data-carddetails="bind:innerHTML,didYouKnow"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>',
               storyTemplate = '<div class="cardpopup" data-carddetails="bind:setPosition, position"><div class="card-detail"><div class="cd-header blue-dark story"> <div class="storytitlelbl" data-label="bind:innerHTML, storytitlelbl"></div><div class="storytitle"><span data-label="bind:innerHTML, cdtitlelbl"></span> <span data-carddetails="bind: formatTitle, title"></span></div><div class="close-popup" data-popupevent="listen:mousedown, close"></div></div><div class="cd-contentarea story"><span class="contentTitle" data-label="bind: innerHTML, scenariodesclbl"></span><p class = "dyknow" data-carddetails="bind:innerHTML,story"></p><span class="contentTitle" data-label="bind: innerHTML, soldesclbl"></span><p class = "dyknow" data-carddetails="bind:innerHTML,solution"></p></div></div><div class="leftcaret" data-carddetails="bind: setCaret, caret.left"></div><div class="rightcaret" data-carddetails="bind: setCaret, caret.right"></div></div>';
                            
        // setup
        this.plugins.addAll({
                "label" : new Model(labels),
                "carddetails" : new Model(cardDetails,{
                        setPosition : function(position){
                                if (position){
                                        this.setAttribute("style", "left:"+position.x+"px; top:"+position.y+"px;");
                                }        
                        },
                        setCaret : function(caret){
                                var top, y= cardDetails.get("position").y;
                                (y > 340)? top = 240 : top = 60;
                                (caret) ? this.setAttribute("style", "display: inline-block; margin-top:"+top+"px;") : this.setAttribute("style", "display: none;");     
                        },
                        setPic : function(pic){
                                var json, node=this;
                                if (!pic){
                                        this.setAttribute("style", "background-image: none;");        
                                }
                                else if (pic.search("img/decks")>-1){
                                        this.setAttribute("style", "background-image:url('"+pic+"');");
                                }
                                else {
                                        json = {"dir":"cards", "filename":pic};
                                        Config.get("transport").request("GetFile", json, function(data){
                                                node.setAttribute("style", "background:white; background-image: url('"+data+"');");   
                                        });        
                                }
                        },
                        setSources : function(sources){
                                if (sources && sources.length){
                                        (sources instanceof Array) ? this.innerHTML = sources.join(", ") : this.innerHTML = sources;
                                }
                                else{
                                        this.innerHTML = "";
                                }        
                        },
                        formatTitle : function(title){
                                if (title) {this.innerHTML = title.toUpperCase();}
                        },
                        formatName : function(firstname){
                                if (firstname) {
                                        this.innerHTML = firstname.substring(0,1).toUpperCase()+firstname.substring(1).toLowerCase()+"  "+cardDetails.get("lastname").toUpperCase(); 
                                }       
                        },
                        setFamily : function(family){
                                var couple = family.couple,
                                      children = family.children,
                                      res1, res2;
                                                
                                if (couple === 0) {res1 = labels.get("singlelbl");}
                                else if (couple === 1) {res1 = labels.get("marriedlbl");}
                                else if (couple === 2) {res1 = labels.get("divorcedlbl");}
                                else if (couple === 3) {res1 = labels.get("widowlbl");}
                                                
                                if (children === 0) {res2 = "";}
                                else{
                                        if (cardDetails.get("age") < 20){
                                                (children === 1) ? res2 = children + labels.get("onesiblinglbl") : res2 = children + labels.get("siblingslbl");
                                        }
                                        else {
                                                (children === 1) ? res2 = children + labels.get("onechildlbl") : res2 = children + labels.get("childrenlbl");
                                        }
                                        res2=", "+res2;
                                }
                                                
                                this.innerHTML = res1 + res2;
                        },
                        setLeisure : function(hobbies){
                                var res = "<ul>", i;
                                if (hobbies && hobbies.length){
                                        for (i=0; i<hobbies.length; i++){
                                                if (hobbies[i].comment){
                                                        res+="<li>"+hobbies[i].name+" ("+hobbies[i].comment+")</li>";
                                                }
                                                else {
                                                        res+="<li>"+hobbies[i].name+"</li>";        
                                                }
                                        }
                                        this.innerHTML = res+"</ul>";
                                }
                                else{
                                        this.innerHTML = "";
                                } 
                        },
                        setInterests : function(interests){
                                var res = "<ul>", i;
                                if (interests && interests.length){
                                        for (i=0; i<interests.length; i++){
                                                if (interests[i].comment){
                                                        res+="<li>"+interests[i].name+" ("+interests[i].comment+")</li>";
                                                }
                                                else {
                                                        res+="<li>"+interests[i].name+"</li>";
                                                }
                                        }
                                        this.innerHTML = res+"</ul>";
                                }
                                else{
                                        this.innerHTML = "";
                                } 
                        },
                        setComments : function(comments){
                                var res = "<ul>", i;
                                if (comments && comments.length){
                                        for (i=0; i<comments.length; i++){
                                                res+="<li>"+comments[i]+"</li>";
                                        }
                                        this.innerHTML = res+"</ul>";        
                                }
                                else {
                                        this.innerHTML = "";
                                }        
                        }
                }),
                "popupevent" : new Event(this)
        });
                        
        this.close = function(event, node){
                _dom.classList.add("invisible");
                $close();
        };
                        
        this.reset = function reset(card, position, caret, dom){
                // set the dom
                _dom = dom;
                this.template = "";
                // get card info (could be an object or a store.toJSON())
                (typeof card === "string") ? cardDetails.reset(JSON.parse(card)) : cardDetails.reset(card);
                // assign popup position and caret type
                cardDetails.set("position", position);
                (caret === "left") ? cardDetails.set("caret", {left:true, right: false}) : cardDetails.set("caret", {left:false, right: true});
                                
                if (cardDetails.get("type") === 1) {this.template = charTemplate;}
                else if (cardDetails.get("type") === 5) {this.template = storyTemplate;}
                else {this.template = defaultTemplate;}
                                
                this.render();
                this.place(_dom);
                _dom.classList.remove("invisible");
        };     
};
                
modul.exports = function CardPopupFactory($close){
        CardPopupConstructor.prototype = new Widget();
        return new CardPopupConstructor($close);
};
