/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Connect/MTCDetails", ["Olives/OObject", "Config"],
        function(Widget, Config){
                
                return function MTCDetailsConstructor($type){
                        //$type can be TC (twocents) or TQ (twoquestion)
                        
                        var mtcDetailUI = new Widget();
                        
                        mtcDetailUI.template = '<div class="comingsoon">Coming soon</div>';
                       
                        return mtcDetailUI;       
                };
        });
