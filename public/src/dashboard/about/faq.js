define("Faq", ["Map", "Olives/OObject"],
        function(Map, OObject){
                
           return function FaqConstructor(dObserver){
                   
                   var faq = new OObject();
                   
                   faq.alive(Map.get("faq"));
                   
                   return faq;
           };     
        });