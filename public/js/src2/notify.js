define("Ideafy/Notify", ["Olives/OObject", "Config", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin"],
        function(Widget, Config, Map, Store, Model, Event){
                
                return new function NotifyConstructor(){
                
                var notify = new Widget(),
                    dom = Map.get("notify"),
                    messages = new Store();
                
                notify.plugins.addAll({
                        "notif" : new Model(messages),
                        "notifevent" : new Event(notify)
                });
                
                notify.alive(dom);
                
                notify.init = function init(){
                        
                };
                
                return notify;
                }
        })
