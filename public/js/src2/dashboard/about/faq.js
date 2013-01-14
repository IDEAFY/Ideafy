/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Dashboard/FAQ", ["Olives/OObject", "Config"],
        function(Widget, Config){
           
           return function FAQConstructor(){
                
                var FAQ = new Widget();
                
                FAQ.template = '<div class="aboutcontent"><Frequently asked questions/div>';
                
                return FAQ;         
           };   
        });
