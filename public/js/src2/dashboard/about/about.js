define("Ideafy/Dashboard/About", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
           return function AboutConstructor(){
                   
                   var aboutUI = new Widget(),
                       labels = Config.get("labels");
                   
                   aboutUI.plugins.addAll({
                           "label" : new Model(labels)
                   });
                   
                   aboutUI.template = '<div id="dashboard-about"><div class="header blue-dark"><span data-label="bind:innerHTML, aboutlbl"></span></div></div>';
                   
                   aboutUI.place(Map.get("dashboard-about"));
                   
                   return aboutUI;
           };    
        });