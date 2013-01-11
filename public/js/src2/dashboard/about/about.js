define("Ideafy/Dashboard/About", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Amy/Stack-plugin", "Config", "Store", "Ideafy/Dashboard/AboutIdeafy", "Ideafy/Dashboard/FAQ", "Ideafy/Dashboard/UserGuide", "Ideafy/Dashboard/Tutorials", "Ideafy/Dashboard/Support", "Ideafy/Dashboard/EULA"],
        function(Widget, Map, Model, Event, Stack, Config, Store, AboutIdeafy, FAQ, UserGuide, Tutorials, Support, EULA){
                
           return function AboutConstructor(){
                   
                   var aboutUI = new Widget(),
                       aboutStack = new Stack(),
                       labels = Config.get("labels"),
                       menu = [
                               {name: "#about", label: labels.get("aboutIdeafy"), currentUI: false},
                               {name: "#faq", label: labels.get("faq"), currentUI: false},
                               {name: "#userguide", label: labels.get("userguide"), currentUI: false},
                               {name: "#tutorials", label: labels.get("tutorials"), currentUI: false},
                               {name: "#support", label: labels.get("support"), currentUI: false},
                               {name: "#eula", label: labels.get("eula"), currentUI: false}
                               ],
                       aboutMenu = new Store(menu);
                   
                   aboutUI.plugins.addAll({
                           "label" : new Model(labels),
                           "aboutmenu" : new Model(aboutMenu, {
                                   setCurrent : function(currentStep){
                                           (currentStep) ? this.classList.add("pressed") : this.classList.remove("pressed");
                                   }
                           }),
                           "aboutstack" : aboutStack,
                           "aboutevent" : new Event(aboutUI)
                   });
                   
                   aboutUI.template = '<div id="dashboard-about"><div class="header blue-dark"><span data-label="bind:innerHTML, aboutlbl"></span></div><div class = "progressbar"><ul id = "aboutmenu" class="steplist" data-aboutmenu="foreach"><li class="step" data-aboutmenu="bind: innerHTML, label; bind:setCurrent, currentUI" data-aboutevent="listen: touchstart, changeDisplay"></li></ul></div><div id="aboutstack" data-aboutstack="destination"></div></div>';
                   
                   aboutUI.place(Map.get("dashboard-about"));
                   
                   aboutUI.changeDisplay = function changeDisplay(event, node){
                        var id = node.getAttribute("data-aboutmenu_id");
                        
                        aboutMenu.loop(function(v,i){
                                aboutMenu.update(i, "currentUI", false);        
                        });
                        aboutMenu.update(id, "currentUI", true);
                        aboutStack.getStack().show(aboutMenu.get(id).name);        
                   };
                   
                   //init stack
                   aboutStack.getStack().add("#about", new AboutIdeafy());
                   aboutStack.getStack().add("#faq", new FAQ());
                   aboutStack.getStack().add("#userguide", new UserGuide());
                   aboutStack.getStack().add("#tutorials", new Tutorials());
                   aboutStack.getStack().add("#support", new Support());
                   aboutStack.getStack().add("#eula", new EULA());
                   
                   aboutStack.getStack().show("#about");
                   aboutMenu.update(0, "currentUI", true);
                   
                   return aboutUI;
           };    
        });