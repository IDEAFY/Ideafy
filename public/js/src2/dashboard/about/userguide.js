/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Dashboard/UserGuide", ["Olives/OObject", "Config"],
        function(Widget, Config){
                return function UserGuideConstructor(){
                        var userGuide = new Widget();
                        
                        userGuide.template = '<div class="aboutcontent">User guide</div>';
                        
                        return userGuide;      
                }; 
        });
