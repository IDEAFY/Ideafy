define("About", ["Olives/OObject", "Map", "Stack", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "UserGuide", "Faq", "Support", "EULA", "Credits"],
        function(OObject, Map, Stack, Store, ModelPlugin, EventPlugin, UserGuide, Faq, Support, EULA, Credits){
                
           return function AboutConstructor(dObserver){
                   
                   var about = new OObject(),
                       menu = new Store([
                               {label:"User guide" , name: "userguide"},
                               {label:"FAQ" , name: "faq"},
                               {label:"Support" , name: "support"},
                               {label: "Licence", name: "eula"},
                               {label: "Credits", name: "credits"}
                       ]),
                       aboutStack = new Stack(Map.get("aboutstack"));
                       
                   aboutStack.addAll({"userguide": UserGuide(dObserver), "faq": Faq(dObserver), "support": Support(dObserver), "eula": EULA(dObserver), "credits": Credits(dObserver)});
                   
                   about.plugins.addAll({
                           "aboutmenu" : new ModelPlugin(menu),
                           "aboutevent" : new EventPlugin(about)
                   });
                   
                   about.show = function(event,node){
                        aboutStack.show(menu.get(node.getAttribute("data-aboutmenu_id")).name);        
                   };
                   
                   // initialize
                   dObserver.watch("login-completed", function(){
                           aboutStack.show("userguide");
                   });
                   
                   about.alive(Map.get("about"));
                   
                   return about;
                   
           }
                
        });