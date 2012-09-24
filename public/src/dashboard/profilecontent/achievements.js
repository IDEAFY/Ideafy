define("Achievements", ["Olives/OObject", "Map", "AppData", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(OObject, Map, AppData, ModelPlugin, EventPlugin, Config){
                
           return function AchievementsConstructor(dObserver){
                   
                   var achievements = new OObject();
                   
                   achievements.plugins.addAll({
                           "model": new ModelPlugin(AppData.get("achievements"),{
                                   setAchieved : function(done){
                                           (done) ? this.setAttribute("style", "opacity: 1;") : this.setAttribute("style", "opacity: 0.2;") 
                                   }
                           }),
                           "event": new EventPlugin(achievements)
                   });
                  
                   
                   dObserver.watch("login-completed", function(){
                        var arr = Config.get("user").get("achievements") || [];
                        
                        for (i=0, l=arr.length; i<l; i++){
                                AppData.get("achievements").loop(function(value, index){
                                        if (arr[i] === value.id){
                                                AppData.get("achievements").update(index, "done", true);
                                        }        
                                });
                        }          
                   });
                   
                   achievements.alive(Map.get("achievements"));
                   
                   return achievements;
                   
           }     
                
        });
