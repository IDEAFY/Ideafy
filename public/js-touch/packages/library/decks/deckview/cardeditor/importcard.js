/* 
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "Bind.plugin", "Event.plugin", "Store"],
        function(Widget, Config, Model, Event, Store){
           
           return function ImportCardConstructor(){
                   
                var importCard = new Widget(),
                    labels = Config.get("labels");
                    
                
                importCard.template = '<div class="importcard">Import card</div>';
                
                importCard.plugins.addAll({
                        "label" : new Model(labels)
                });
                
                return importCard;
                   
           }
});