define("Ideafy/Notify", ["Olives/OObject", "Config", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Ideafy/Avatar"],
        function(Widget, Config, Map, Store, Model, Event, Avatar){
                
                return function NotifyConstructor(){
                
                var notify = new Widget(),
                    notifyPopup = new Widget(),
                    dom = Map.get("notify"),
                    popup = Map.get("notify-popup"),
                    user = Config.get("user"),
                    observer = Config.get("observer"),
                    labels = Config.get("labels"),
                    current = 0, // current number of messages
                    currentUnread = 0, // current number of unread messages
                    popupEnabled = true,
                    notif = new Store({"unread": 0, "newmsg":false}),
                    messages = new Store([]); 
                
                notify.plugins.addAll({
                        "notif" : new Model(notif, {
                                flashNew : function(newmsg){
                                        var flash, node = this;
                                        
                                        if(newmsg){
                                                flash = setInterval(function(){
                                                        console.log("bip");
                                                        (node.classList.contains("orange")) ? node.classList.remove("orange") : node.classList.add("orange");
                                                }, 600);
                                        
                                                setTimeout(function(){
                                                        clearInterval(flash);
                                                        node.classList.remove("orange");
                                                        notif.set("newmsg", false);
                                                }, 3000);
                                        }
                                }
                        }),
                        "notifevent" : new Event(notify)
                });
                
                notify.alive(dom);
                
                notify.getUnread = function getUnread(){
                        var msg = user.get("notifications"),
                            unread = 0;
                        for (i=0, l=msg.length; i<l; i++){
                                if (msg[i].status === "unread") unread++
                        }
                        return unread;        
                };
                
                notify.press = function(event, node){
                        node.classList.add("orange");        
                };
                
                notify.showPopup = function(event, node){
                        node.classList.remove("orange");
                        popup.classList.add("show-notify");
                };
                
                // popup user interface
                notifyPopup.plugins.addAll({
                        "labels" : new Model(labels),
                        "notify" : new Model(messages,{
                                setStyle : function(status){
                                        (status === "unread") ? this.setAttribute("style", "font-weight: bold;") : this.setAttribute("style", "font-weight: normal;");
                                },
                                setAvatar : function(author){
                                        var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);        
                                }
                        }),
                        "notifyevent" : new Event(notifyPopup)
                });
                
                notifyPopup.template = '<div><div class="notify-header" data-labels="bind:innerHTML, notificationlbl" data-notifyevent="listen:touchstart, closePopup"></div><ul class="notify-list" data-notify="foreach"><li data-notify="bind: setStyle, status" data-notifyevent="listen:touchstart, displayComCenter"><div data-notify="bind:setAvatar, author"></div><p><span class="notify-name" data-notify="bind:innerHTML, name"></span> : <span class="notify-body" data-notify="bind:innerHTML, object"></span></p></li></ul></div>';
                
                notifyPopup.closePopup = function closePopup(event, node){
                        console.log("close");
                        popup.classList.remove("show-notify");        
                };
                
                notifyPopup.displayComCenter = function displayComCenter(event, node){
                        var id = node.getAttribute("data-notify_id");
                        observer.notify("display-message", id);        
                };
                
                // init notifications engine
                 notify.init = function init(){
                        // initialize store with user data
                        currentUnread = notify.getUnread();
                        notif.set("unread", currentUnread);
                        notif.set("newmsg", false);
                        
                        messages.reset(user.get("notifications"));
                        notifyPopup.place(popup);    
                };
                
                // watch for new/unread messages
                
                user.watchValue("notifications", function(){
                        var unread = notify.getUnread();
                        console.log("unread");
                        if (unread > currentUnread){
                                notif.set("newmsg", true);
                                notif.set("unread", unread);
                                currentUnread = unread;
                                if (user.get("settings") && user.get("settings").notifyPopup) popup.classList.add("show-notify");
                        }
                        else if (unread < currentUnread){
                                notif.set("unread", unread);
                                currentUnread = unread;
                        }
                        messages.reset(user.get("notifications"));                      
                });
                
                return notify;
                }
        })
