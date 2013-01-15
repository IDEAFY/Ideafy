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
                            labels = Config.get("labels"),
                            model = new Store();
                        
                        support.plugins.addAll({
                                "labels": new Model(labels),
                                "support": new Model(model),
                                "supportevent": new Event(support)
                        });
                        
                        support.template = '<div class="aboutcontent"><legend class"support" data-labels="bind:innerHTML, supportlegend"></legend><textarea class="input" data-labels="bind:placeholder, supportplaceholder"></textarea><div class="cancel" data-labels="bind: innerHTML, cancellbl" data-supportevent="listen: touchstart, press; listen: touchend, cancel"></div><div class="send" data-labels="bind: innerHTML, sendlbl" data-twocentevent="listen: touchstart, press; listen: touchend, send"></div></div>';
                        
                        return support;      
                        
                }; 
        });
