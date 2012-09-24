define("Settings", ["Olives/OObject", "Map"],
        function(OObject, Map){
                
           return function SettingsConstructor(dObserver){
                   
                   var settings = new OObject();
                   
                   settings.alive(Map.get("settings"));
                   
                   return settings;
                   
           }
                
        });