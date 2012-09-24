define("Support", ["Map", "Olives/OObject"],
        function(Map, OObject){
                
           return function SupportConstructor(dObserver){
                   
                   var support = new OObject();
                   
                   support.alive(Map.get("support"));
                   
                   return support;
           };     
        });