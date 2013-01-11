define("ideafy/Dashboard/Suport", ["Olives/OObject", "Config"],
        function(Widget, Config){
                return function SupportConstructor(){
                  
                        var support = new Widget();
                        
                        support.template = '<div>Support</div>';
                        
                        return support;      
                        
                }; 
        });
