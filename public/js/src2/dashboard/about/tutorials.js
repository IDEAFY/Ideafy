define("Ideafy/Dashboard/Tutorials", ["Olives/OObject", "Config"],
        function(Widget, Config){
                return function TutorialsConstructor(){
                        var tutorials = new Widget();
                        
                        tutorials.template = '<div class="aboutcontent">Tutorials</div>';
                        
                        return tutorials;   
                };
        });
