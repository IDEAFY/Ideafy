define("Ideafy/Dashboard/UserGuide", ["Olives/OObject", "Config"],
        function(Widget, Config){
                return function UserGuideConstructor(){
                        var userGuide = new Widget();
                        
                        userGuide.template = '<div>User guide</div>';
                        
                        return userGuide;      
                }; 
        });
