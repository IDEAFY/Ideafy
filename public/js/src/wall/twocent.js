define("Twocent", ["Olives/OObject"],
        function(Widget){
                
                return function TwocentConstructor(dom){
                        
                        var twocent = new Widget();
                        
                        twocent.alive(dom);
                        
                        return twocent;
                        
                };       
                
        });
