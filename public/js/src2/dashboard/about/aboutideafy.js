/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Dashboard/AboutIdeafy",["Olives/OObject", "Config"],
        function(Widget, Config){
                
                return function AboutIdeafyConstructor(){
                        
                        var aboutIdeafy = new Widget();
                        
                        aboutIdeafy.template = '<div class="aboutcontent">About Ideafy, About Taiaut, Credits</div>';
                        
                        return aboutIdeafy;
                };
        });
