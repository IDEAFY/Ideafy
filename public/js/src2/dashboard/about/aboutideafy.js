define("Ideafy/Dashborad/AboutIdeafy",["Olives/OObject", "Config"],
        function(Widget, Config){
                
                return function AboutIdeafyConstructor(){
                        
                        var aboutIdeafy = new Widget();
                        
                        aboutIdeafy.template = '<div>About Ideafy, About Taiaut, Credits</div>';
                        
                        return aboutIdeafy;
                };
        });
