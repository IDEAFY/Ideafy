define("Ideafy/Notify", ["Olives/OObject", "Config", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin"],
        function(Widget, Config, Map, Store, Model, Event){
                
                return function NotifyConstructor(){
                
                var notify = new Widget(),
                    dom = Map.get("notify"),
                    user = Config.get("user"),
                    observer = Config.get("observer"),
                    current = 0, // current number of messages
                    currentUnread = 0, // current number of unread messages
                    popupEnabled = true,
                    notif = new Store({"unread": 0, "newmsg":false});
                
                notify.plugins.addAll({
                        "notif" : new Model(notif, {
                                flashNew : function(newmsg){
                                        var flash, node = this;
                                        
                                        if(newmsg){
                                                flash = setInterval(function(){
                                                        console.log("bip");
                                                        (node.classList.contains("orange")) ? node.classList.remove("orange") : node.classList.add("orange");
                                                }, 500);
                                        
                                                setTimeout(function(){
                                                        clearInterval(flash);
                                                        node.classList.remove("orange");
                                                        notif.set("newmsg", false);
                                                }, 6000);
                                        }
                                }
                        }),
                        "notifevent" : new Event(notify)
                });
                
                notify.alive(dom);
                
                notify.init = function init(){
                        // initialize store with user data
                        currentUnread = notify.getUnread();
                        notif.set("unread", currentUnread);
                        notif.set("newmsg", false);        
                };
                
                notify.getUnread = function getUnread(){
                        var msg = user.get("notifications"),
                            unread = 0;
                        for (i=0, l=msg.length; i<l; i++){
                                if (msg[i].status === "unread") unread++
                        }
                        return unread;        
                };
                
                // watch for new/unread messages
                
                user.watchValue("notifications", function(){
                        var unread = notify.getUnread();
                        console.log("unread");
                        if (unread > currentUnread){
                                notif.set("newmsg", true);
                                notif.set("unread", unread);
                                currentUnread = unread;
                        }
                        else if (unread < currentUnread){
                                notif.set("unread", unread);
                                currentUnread = unread;
                        }                       
                });
                
                return notify;
                }
        })
