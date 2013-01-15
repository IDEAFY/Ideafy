/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Dashboard/Support", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store"],
        function(Widget, Config, Model, Event, Store){
                return function SupportConstructor(){
                  
                        var support = new Widget(),
                            labels = Config.get("labels"),model = new Store({"body": "", "result":""});
                        
                        support.plugins.addAll({
                                "labels": new Model(labels),
                                "support": new Model(model),
                                "supportevent": new Event(support)
                        });
                        
                        support.template = '<div class="aboutcontent"><legend class="support" data-labels="bind:innerHTML, supportlegend"></legend><textarea class="input" data-labels="bind:placeholder, supportplaceholder" data-support="bind: value, body"></textarea><span data-support="bind:innerHTML, result"></span><div class="cancel" data-labels="bind: innerHTML, cancellbl" data-supportevent="listen: touchstart, press; listen: touchend, cancel"></div><div class="send" data-labels="bind: innerHTML, sendlbl" data-supportevent="listen: touchstart, press; listen: touchend, send"></div></div>';
                        
                        support.send = function(event, node){
                                node.classList.remove("pressed");
                                support.sendRequest(model.get("body"));
                                model.set("body", "");                
                        };
                        
                        support.cancel = function(event, node){
                                node.classList.remove("pressed");
                                model.set("body", "");  
                        };
                        
                        support.press = function(event, node){
                                node.classList.add("pressed");
                        };
                        
                        support.sendRequest = function sendRequest(request){
                                var json = {}, now = new Date();
                                json.request = request;
                                json.date = now.getTime();
                                json.userid = Config.get("user").get("_id");
                                
                                Config.get("transport").request("Support", json, function(result){
                                        (result === "ok")? model.set("result", labels.get("requestsent")) :model.set("result", result);
                                        setTimeout(function(){
                                                model.set("result", "");
                                        }, 3000);               
                                });  
                        };
                        
                        return support;      
                        
                }; 
        });
