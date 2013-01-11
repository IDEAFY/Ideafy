define("Ideafy/Dashboard/UserGuide", ["Olives/OObject", "Config"],
        function(Widget, Config){
                return function UserGuideConstructor(){
                        var userGuide = new Widget();
                        
                        userGuide.template = '<div class="aboutcontent">User guide</div>';
                        
                        return userGuide;      
                }; 
        });
