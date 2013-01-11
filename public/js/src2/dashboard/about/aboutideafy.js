define("Ideafy/Dashboard/AboutIdeafy",["Olives/OObject", "Config"],
        function(Widget, Config){
                
                return function AboutIdeafyConstructor(){
                        
                        var aboutIdeafy = new Widget();
                        
                        aboutIdeafy.template = '<div class="aboutcontent">About Ideafy, About Taiaut, Credits</div>';
                        
                        return aboutIdeafy;
                };
        });
