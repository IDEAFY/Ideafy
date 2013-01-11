define("Ideafy/Dashboard/Tutorials", ["Olives/OObject", "Config"],
        function(Widget, Config){
                return function TutorialsConstructor(){
                        var tutorials = new Widget();
                        
                        tutorials.template = '<div>Tutorials</div>';
                        
                        return tutorials;   
                };
        });
