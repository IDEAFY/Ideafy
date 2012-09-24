define("Credits", ["Map", "Olives/OObject"],
        function(Map, OObject){
                
           return function CreditsConstructor(dObserver){
                   
                   var credits = new OObject();
                   
                   credits.alive(Map.get("credits"));
                   
                   return credits;
           };     
        });