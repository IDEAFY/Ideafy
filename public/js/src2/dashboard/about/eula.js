/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Dashboard/EULA", ["Olives/OObject", "Config"],
        function(Widget, Config){
           
                return function EULAConstructor(){
                        
                        var eula = new Widget();
                        
                        eula.template = '<div class="aboutcontent">End-user license agreement</div>';
                        
                        return eula;                
                };
        });
