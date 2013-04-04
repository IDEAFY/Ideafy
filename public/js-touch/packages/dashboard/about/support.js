/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "Store", "CouchDBStore"],
        function(Widget, Config, Model, Event, Store, CouchDBStore){
                return function SupportConstructor(){
                  
                        var support = new Widget(),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            model = new Store({"body": "", "result":""}),
                            supportMSG = new Store({"active": "", "content": ""});
                            maintenanceMSG = new Store({"active" : "", "date": "", "comment":""});
                        
                        support.plugins.addAll({
                                "labels": new Model(labels),
                                "support": new Model(model),
                                "news" : new Model(supportMSG, {
                                        setVisible : function(active){
                                                (active)?this.classList.remove("invisible"):this.classList.add("invisible");
                                        }
                                }),
                                "maintenance" : new Model(maintenanceMSG, {
                                        setVisible : function(active){
                                                (active)?this.classList.remove("invisible"):this.classList.add("invisible");
                                        },
                                        setDate : function(date){
                                                this.innerHTML = new Date(date).toString();
                                        }
                                }),
                                "supportevent": new Event(support)
                        });
                        
                        support.template = '<div class="aboutcontent"><p class="supportmsg invisible" data-news="bind:setVisible, active; bind:innerHTML, content"></p><legend class="support" data-labels="bind:innerHTML, supportlegend"></legend><textarea class="input" data-labels="bind:placeholder, supportplaceholder" data-support="bind: value, body"></textarea><span data-support="bind:innerHTML, result"></span><div class="cancel" data-labels="bind: innerHTML, cancellbl" data-supportevent="listen: touchstart, press; listen: touchend, cancel"></div><div class="send" data-labels="bind: innerHTML, sendlbl" data-supportevent="listen: touchstart, press; listen: touchend, send"></div><div class="maintenancemsg invisible" data-maintenance="bind:setVisible,active"><legend data-labels="bind:innerHTML, schedmaintenance"></legend><p><span data-labels="bind: innerHTML, nextmaintenance"></span><span class="dateandtime" data-maintenance="bind:setDate, date">Sunday April 7th 6:00 EST</span></p><p data-maintenance="bind:innerHTML, comment"></p></div><div class="supportus"><legend data-labels="bind: innerHTML, twoway"></legend><p data-labels="bind: innerHTML, supportusintro"><ul><li><h4 data-labels="bind: innerHTML, asanideafyer"></h4><p data-labels="bind: innerHTML, ideafyerhelp"></p></li><li><h4 data-labels="bind: innerHTML, asanexec"></h4><p data-labels="bind: innerHTML, exechelp"></p></li><li><h4 data-labels="bind: innerHTML, asadev"></h4><p data-labels="bind: innerHTML, devhelp"></p></li><li><h4 data-labels="bind: innerHTML, asaninvest"></h4><p data-labels="bind: innerHTML, investhelp"></p></li></ul></p></div></div>';
                        
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
                        
                        support.getMessage = function getMessages(lang, msgId){
                                var cdb = new CouchDBStore();
                                
                                cdb.setTransport(Config.get("transport"));
                                
                                cdb.sync(Config.get("db"), msgId).then(function(){
                                        if (cdb.get("lang") === lang || !cdb.get("translations")[lang]){
                                                        (msgID === "SUPPORTMSG") ? supportMSG.reset(JSON.parse(cdb.toJSON())) : maintenanceMSG.reset(JSON.parse(cdb.toJSON()));        
                                        }
                                        else{
                                                (msgID === "SUPPORTMSG") ? supportMSG.reset(cdb.get("translations")[lang]) : maintenanceMSG.reset(cdb.get("translations")[lang]);        
                                        }
                                        cdb.unsync();
                                });      
                        };
                        
                        // init --> get support  & maintenance messages from database
                        support.getMessage(user.get("lang"), "SUPPORTMSG");
                        support.getMessage(user.get("lang"), "MAINTENANCE");
                        
                        // update support and maintenance messages in case of language change
                        user.watchValue("lang", function(){
                                support.getMessage(user.get("lang"), "SUPPORTMSG");
                                support.getMessage(user.get("lang"), "MAINTENANCE");
                        });
                        
                        SUPP = supportMSG;
                        MAINT = maintenanceMSG;
                        
                        return support;      
                        
                }; 
        });
