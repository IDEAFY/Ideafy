/* 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "Store"],
        function(Widget, Config, Model, Event, Store){
           
           return function ImportCardConstructor($update, $close){
                   
                var importCard = new Widget(),
                    labels = Config.get("labels");
                    
                
                importCard.template = '<div class="importcard"><div class="cancelmail" data-importevent="listen:touchstart, press; listen:touchend, cancel" data-label="bind:innerHTML, cancellbl"></div><div class="sendmail" data-importevent="listen:touchstart, press; listen:touchend, upload" data-label="bind:innerHTML, savelbl">Save</div></div>';
                
                importCard.plugins.addAll({
                        "label" : new Model(labels),
                        "importevent" : new Event(importCard)
                });
                
                importCard.changeType = function changeType(type){
                        console.log("importcard change type : ", type);        
                };
                
                importCard.cancel = function(event, node){
                        $close();        
                };
                
                return importCard;
                   
           }
});