define ("Leaderboard", ["Olives/OObject", "Map", "CouchDBStore", "Config", "Olives/Model-plugin", "Olives/Event-plugin"],
        function(OObject, Map, CouchDBStore, Config, ModelPlugin, EventPlugin){
                
           return function LeaderboardConstructor(dObserver){
                   
                   var leaderboard = new OObject(),
                       leaderCDB = new CouchDBStore([]);
                       
                   leaderCDB.setTransport(Config.get("Transport"));
                   
                   leaderboard.plugins.addAll({
                        "leaders": new ModelPlugin(leaderCDB),
                        "leaderevent": new EventPlugin(leaderboard)        
                   });
                       
                   dObserver.watch("login-completed", function(){
                           leaderCDB.sync("taiaut", "users", "_view/leaderboard", {
                                limit: 100,
                                descending: true     
                           }).then(function(){
                                   console.log(leaderCDB.toJSON());
                           });
                   });
                   
                   leaderboard.alive(Map.get("leaderboard"));
                   
                   return leaderboard;
                   
           }     
                
        });
