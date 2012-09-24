define("EULA", ["Map", "Olives/OObject"],
        function(Map, OObject){
                
           return function EULAConstructor(dObserver){
                   
                   var eula = new OObject();
                   
                   eula.alive(Map.get("eula"));
                   
                   return eula;
           };     
        });