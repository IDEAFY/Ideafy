define("Ideafy/Dashboard/EULA", ["Olives/OObject", "Config"],
        function(Widget, Config){
           
                return function EULAConstructor(){
                        
                        var eula = new Widget();
                        
                        eula.template = '<div>End-user license agreement</div>';
                        
                        return eula;                
                };
        });
