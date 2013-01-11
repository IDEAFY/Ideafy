define("Ideafy/Dashboard/About", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Amy/Stack-plugin", "Config", "Store"],
        function(Widget, Map, Model, Event, Stack, Config, Store){
                
           return function AboutConstructor(){
                   
                   var aboutUI = new Widget(),
                       aboutStack = new Stack(),
                       labels = Config.get("labels"),
                       menu = [
                               {name: "about", label: labels.get("aboutIdeafy"), currentUI: false},
                               {name: "FAQ", label: labels.get("faq"), currentUI: false},
                               {name: "Tutorials", label: labels.get("tutorials"), currentUI: false},
                               {name: "Userguide", label: labels.get("userguide"), currentUI: false},
                               {name: "Support", label: labels.get("support"), currentUI: false},
                               {name: "EULA", label: labels.get("eula"), currentUI: false}
                               ],
                       aboutMenu = new Store(menu);
                   
                   aboutUI.plugins.addAll({
                           "label" : new Model(labels),
                           "aboutmenu" : new Model(aboutMenu),
                           "aboutstack" : aboutStack,
                           "aboutevent" : new Event(aboutUI)
                   });
                   
                   aboutUI.template = '<div id="dashboard-about"><div class="header blue-dark"><span data-label="bind:innerHTML, aboutlbl"></span></div><div class = "progressbar"><ul id = "aboutmenu" class="steplist" data-aboutmenu="foreach"><li class="step" data-aboutmenu="bind: innerHTML, label; bind:setCurrent, currentUI" data-aboutevent="listen: touchstart, changeDisplay"></li></ul></div></div>';
                   
                   aboutUI.place(Map.get("dashboard-about"));
                   
                   //init stack
                   
                   
                   return aboutUI;
           };    
        });