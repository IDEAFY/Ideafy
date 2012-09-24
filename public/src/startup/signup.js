define("SignUp", ["Map", "Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store"],
        function(Map, OObject, Config, ModelPlugin, EventPlugin, Store){
                
                return function SignUpConstructor(){
                        
                        var signUp = new OObject();
                        
                        signUp.alive(Map.get("signup"));
                        
                        return signUp;   
                        
                };
                
        });
