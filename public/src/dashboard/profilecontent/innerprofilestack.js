define("UserInfo", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(OObject, Map, ModelPlugin, EventPlugin, Config){
                
                return function UserInfoConstructor(){
                        
                        var UserInfo = new OObject(),
                            user = Config.get("user");
                        
                        UserInfo.plugins.addAll({
                                "userdata": new ModelPlugin(user),
                                "userevent": new EventPlugin(UserInfo)
                        });
                        
                        UserInfo.alive(Map.get("userdata"));
                        
                        return UserInfo;
                        
                };
                
        });

define("UserJob", ["Olives/OObject", "Map"],
        function(OObject, Map){
                
                return function UserJobConstructor(){
                        
                        var UserJob = new OObject();
                        
                        UserJob.alive(Map.get("userjob"));
                        
                        return UserJob;
                        
                };
                
        });
        
define("UserHobbies", ["Olives/OObject", "Map"],
        function(OObject, Map){
                
                return function UserHobbiesConstructor(){
                        
                        var UserHobbies = new OObject();
                        
                        UserHobbies.alive(Map.get("userhobbies"));
                        
                        return UserHobbies;
                        
                };
                
        });
        
define("UserInterests", ["Olives/OObject", "Map"],
        function(OObject, Map){
                
                return function UserInterestsConstructor(){
                        
                        var UserInterests = new OObject();
                        
                        UserInterests.alive(Map.get("userinterests"));
                        
                        return UserInterests;
                        
                };
                
        });