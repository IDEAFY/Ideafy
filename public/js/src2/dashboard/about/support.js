define("Ideafy/Dashboard/Support", ["Olives/OObject", "Config"],
        function(Widget, Config){
                return function SupportConstructor(){
                  
                        var support = new Widget();
                        
                        support.template = '<div class="aboutcontent">Support</div>';
                        
                        return support;      
                        
                }; 
        });
