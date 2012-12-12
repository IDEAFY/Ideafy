define("Ideafy/Connect/MessageDetail", ["Olives/OObject", "Config", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Ideafy/Avatar", "Ideafy/Utils"],
        function(Widget, Config, Store, Model, Event, Avatar, Utils){
                
           return function MessageDetailConstructor(){
           
                var msgDetailUI = new Widget(),
                    message = new Store(),
                    labels = Config.get("labels"),
                    user = Config.get("user"),
                    observer = Config.get("observer");
                
                msgDetailUI.template = '<div id="msgdetail"><div class="header blue-dark"><span class="subjectlbl" data-label="bind:innerHTML, subjectlbl"></span><span data-message="bind:innerHTML, object"></span></div><div class = "detail-contents"><div class="detail-header"><div class="msgoptions"><div class="defaultmsgoption"><div name="reply" class="msgreply" data-messageevent="listen:touchstart, press; listen:touchend, action"></div><div name="more" class="more" data-messageevent="listen:touchstart, press; listen:touchend, action"></div></div><div class="msgoptionlist invisible"><div name="replyall" class="replyall sort-button" data-label="bind:innerHTML, replyalllbl" data-messageevent="listen:touchstart, press; listen:touchend, action"></div><div name="forward" class="forward sort-button" data-label="bind:innerHTML, forwardlbl" data-messageevent="listen:touchstart, press; listen:touchend, action"></div><div name="deletemsg" class="deletemsg sort-button" data-label="bind:innerHTML, deletelbl" data-messageevent="listen:touchstart, press; listen:touchend, action"></div></div></div><div data-message="bind:setAvatar, author"></div><p data-message="bind:innerHTML, username"></p><p class="toList"><span data-label="bind: innerHTML, tolbl"></span><span data-message="bind: innerHTML, toList"></span></p><p><span class="date" data-message="bind: date, date"></span></p><br><span class="author"></span><span class="commentlbl" data-labels="bind: setWrotelbl, doc.authornames"></span></div><div class="detail-body"><p data-message="bind:innerHTML, body" data-messageevent="listen:touchstart, showDoc"></p><p></p></div><div class="detail-footer"></div></div></div>';
                
                msgDetailUI.plugins.addAll({
                        "label": new Model(labels),
                        "message": new Model(message,{
                                date : function date(date){
                                                if (date) {this.innerHTML = Utils.formatDate(date);}
                                        },
                                setAvatar : function setAvatar(author){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                }
                        }),
                        "messageevent": new Event(msgDetailUI)
                });
                
                msgDetailUI.showDoc = function showDoc(event, node){
                        observer.notify("display-doc", message.get("docId"), message.get("docType"));
                };
                
                msgDetailUI.press = function(event, node){
                        node.classList.add("pushed");        
                };
                
                msgDetailUI.action = function(event, node){
                        var name = node.getAttribute("name"),
                            options = document.querySelector(".msgoptionlist");
                        
                        switch(name){
                                case "more":
                                        options.classList.remove("invisible");
                                        break;
                                case "reply":
                                        options.classList.add("invisible");
                                        break;
                                case "replyall":
                                        options.classList.add("invisible");
                                        break;
                                case "forwrad":
                                        options.classList.add("invisible");
                                        break;
                                case "deletemsg":
                                        options.classList.add("invisible");
                                        msgDetailUI.deletemsg(message.toJSON());
                                        break;
                                default:
                                        break;
                        }
                        node.classList.remove("pushed");        
                };
                
                msgDetailUI.deletemsg = function deletemsg(msg){
                        var arr = user.get("notifications"),
                            index;
                        
                        for (i=0, l=arr.length; i<l; i++){
                                if (JSON.stringify(arr[i]) === msg){
                                        index = i;
                                        break;
                                }
                        }
                        arr.splice(index, 1);
                        user.set("notifications", arr);
                        user.upload();
                };
                
                //init
                msgDetailUI.reset = function reset(msg){
                        message.reset(msg);
                };
                
                return msgDetailUI;
            };      
        });
