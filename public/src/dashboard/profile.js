define("Profile", ["Olives/OObject", "Map", "Stack", "ProfileDetails", "Stats", "Achievements", "Leaderboard", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store"],
        function(OObject, Map, Stack, ProfileDetails, Stats, Achievements, Leaderboard, Config, ModelPlugin, EventPlugin, Store){
                
           return function ProfileConstructor(dObserver){
                   
                   var profile = new OObject(),
                       menu = new Store([
                               {label:"Profile" , name: "profiledetails"},
                               {label:"Stats" , name: "stats"},
                               {label:"Achievements" , name: "achievements"},
                               {label:"Leaderboard" , name: "leaderboard"}
                       ]),
                       profileStack = new Stack(Map.get("profilecontentstack"));
                       
                       profileStack.addAll({"profiledetails": ProfileDetails(dObserver), "stats": Stats(dObserver), "achievements": Achievements(dObserver), "leaderboard": Leaderboard(dObserver)});
                   
                   profile.plugins.addAll({
                           "profilemenu" : new ModelPlugin(menu),
                           "profileevent" : new EventPlugin(profile)
                   });
                   
                   profile.show = function(event,node){
                        profileStack.show(menu.get(node.getAttribute("data-profilemenu_id")).name);        
                   };
                   
                   // initialize
                   dObserver.watch("login-completed", function(){
                           profileStack.show("profiledetails");
                   });
                   
                   profile.alive(Map.get("userprofile"));
                   
                   return profile;
                   
           }
                
        });
