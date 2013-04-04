/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "Store"],
        function(Widget, Config, Model, Event, Store){
                return function SupportConstructor(){
                  
                        var support = new Widget(),
                            labels = Config.get("labels"),model = new Store({"body": "", "result":""});
                        
                        support.plugins.addAll({
                                "labels": new Model(labels),
                                "support": new Model(model),
                                "supportevent": new Event(support)
                        });
                        
                        support.template = '<div class="aboutcontent"><p class="supportmsg">In the last few days the deployment of new software on the server caused various issues with login and signup. We apologize for the downtime and the inconvenience it caused you.</p><legend class="support" data-labels="bind:innerHTML, supportlegend"></legend><textarea class="input" data-labels="bind:placeholder, supportplaceholder" data-support="bind: value, body"></textarea><span data-support="bind:innerHTML, result"></span><div class="cancel" data-labels="bind: innerHTML, cancellbl" data-supportevent="listen: touchstart, press; listen: touchend, cancel"></div><div class="send" data-labels="bind: innerHTML, sendlbl" data-supportevent="listen: touchstart, press; listen: touchend, send"></div><div id="supportnews"><legend></legend><p>The next maintenance will take place on : <span class="dateandtime">Sunday April 7th 6:00 EST</span></p><p>Maintenance details or comments</p></div><div class="supportus"><legend data-labels="bind: innerHTML, twoway"></legend><p data-labels="bind: innerHTML, supportusintro"><ul><li><h4 data-labels="bind: innerHTML, asanideafyer"></h4><p data-labels="bind: innerHTML, ideafyerhelp"></p></li><li><h4 data-labels="bind: innerHTML, asanexec"></h4><p data-labels="bind: innerHTML, exechelp"></p></li><li><h4 data-labels="bind: innerHTML, asadev"></h4><p data-labels="bind: innerHTML, devhelp"></p></li><li><h4 data-labels="bind: innerHTML, asaninvest"></h4><p data-labels="bind: innerHTML, investhelp"></p></li></ul></p></div></div>';
                        
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
