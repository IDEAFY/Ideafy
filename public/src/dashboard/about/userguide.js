define("UserGuide", ["Map", "Olives/OObject"],
        function(Map, OObject){
                
           return function UserGuideConstructor(dObserver){
                   
                   var userGuide = new OObject();
                   
                   userGuide.alive(Map.get("userguide"));
                   
                   return userGuide;
           };     
        });
