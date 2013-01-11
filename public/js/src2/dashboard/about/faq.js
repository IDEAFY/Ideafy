define("Ideafy/Dashboard/FAQ", ["Olives/OObject", "Config"],
        function(Widget, Config){
           
           return function FAQConstructor(){
                
                var FAQ = new Widget();
                
                FAQ.template = '<div><Frequently asked questions/div>';
                
                return FAQ;         
           };   
        });
