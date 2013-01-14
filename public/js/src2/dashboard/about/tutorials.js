/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Dashboard/Tutorials", ["Olives/OObject", "Config"],
        function(Widget, Config){
                return function TutorialsConstructor(){
                        var tutorials = new Widget();
                        
                        tutorials.template = '<div class="aboutcontent">Tutorials</div>';
                        
                        return tutorials;   
                };
        });
