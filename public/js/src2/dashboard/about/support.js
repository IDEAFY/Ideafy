/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Dashboard/Support", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin"],
        function(Widget, Config, Model, Event){
                return function SupportConstructor(){
                  
                        var support = new Widget(),
                            labels = Config.get("labels");
                        
                        support.template = '<div class="aboutcontent">Support<textarea class="input"></textarea></div>';
                        
                        return support;      
                        
                }; 
        });
