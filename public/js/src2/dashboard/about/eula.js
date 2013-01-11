define("Ideafy/Dashboard/EULA", ["Olives/OObject", "Config"],
        function(Widget, Config){
           
                return function EULAConstructor(){
                        
                        var eula = new Widget();
                        
                        eula.template = '<div class="aboutcontent">End-user license agreement</div>';
                        
                        return eula;                
                };
        });
