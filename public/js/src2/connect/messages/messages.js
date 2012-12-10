define ("Ideafy/Connect/Messages", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Amy/Control-plugin", "Amy/Stack-plugin", "Store", "Config", "Ideafy/Avatar", "Ideafy/Utils", "Ideafy/Connect/MessageDetail"],
        function(Widget, Map, Model, Event, Control, Stack, Store, Config, Avatar, Utils, MessageDetail){
                
                return function MessagesConstructor(){
                        
                        var messageUI = new Widget(),
                            detailStack = new Stack(),
                            defaultPage = new Widget(), // to show in detail space when no message is selected
                            sortButtons = new Store([
                                    {"name": "all", "label": "allbtn", "selected": true},
                                    {"name": "messages", "label": "msgbtn", "selected": false},
                                    {"name": "notifications", "label": "notifbtn", "selected": false},
                                    {"name": "unread", "label": "unreadbtn", "selected": false}
                            ]),
                            currentSort = 0,
                            msgList = new Store([]),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            sortMessages = function(id){
                                    var type = sortButtons.get(id).name,
                                        msgs = user.get("notifications"),
                                        l = msgs.length,
                                        result = [];
                                    
                                    switch (type){
                                            case "messages":
                                                for (i=0; i<l;i++){
                                                        if (msgs[i].type === "MSG") result.push(msgs[i]);
                                                }
                                                break;
                                            case "notifications":
                                                for (i=0; i<l;i++){
                                                        if (msgs[i].type !== "MSG") result.push(msgs[i]);
                                                }
                                                break;
                                            case "unread":
                                            for (i=0; i<l;i++){
                                                        if (msgs[i].status === "unread") result.push(msgs[i]);
                                                }
                                                break;
                                            default:
                                                result = msgs;
                                    }
                                    
                                    return result;
                            },
                            searchMessages = function(text){
                                var msgs = [], result = [];
                                msgs = user.get("notifications").concat();
                                
                                if (text === ""){
                                        result = msgs;
                                        sortButtons.update(0, "selected", true);
                                        currentSort = 0;
                                }
                                else{
                                        for (i=0, l=msgs.length; i<l;i++){
                                                if(JSON.stringify(msgs[i]).toLowerCase().search(text.toLowerCase()) > -1) result.push(msgs[i]);
                                        }
                                }
                                return result;         
                            };
                        
                        messageUI.plugins.addAll({
                                "label": new Model(labels),
                                "sort" : new Model(sortButtons, {
                                        "setLabel" : function(name){
                                                this.innerHTML = labels.get(name);
                                        },
                                        "setSelected" : function(selected){
                                                (selected)?this.classList.add("pressed"):this.classList.remove("pressed");
                                        }
                                }),
                                "msg" : new Model(msgList,{
                                        date : function date(date){
                                                if (date) {this.innerHTML = Utils.formatDate(date);}
                                        },
                                        highlight: function(status){
                                                (status === "unread") ? this.classList.add("unread"):this.classList.remove("unread");
                                        },
                                        setAvatar : function setAvatar(author){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        }
                                }),
                                "msglistevent" : new Event(messageUI),
                                "msglistcontrol" : new Control(messageUI),
                                "msgdetailstack" : detailStack
                        });
                        
                        messageUI.template = '<div id="connect-messages"><div class="messages list"><div class="header blue-light"><span data-label="bind: innerHTML, msglistheadertitle">My Mailbox</span><div class="option right" data-msglistevent="listen: touchstart, plus"></div></div><ul class="selectors" data-sort = "foreach"><li class="sort-button" data-sort="bind: setLabel, label; bind:setSelected, selected, bind: name, name" data-msglistevent="listen:touchstart, displaySort"></li></ul><input class="search" type="text" data-label="bind: placeholder, searchmsgplaceholder" data-msglistevent="listen: keypress, search"><div class="msglist overflow" data-msglistcontrol="radio:li,selected,touchstart,selectMsg"><ul data-msg="foreach"><li class="msg list-item"><div data-msg="bind:setAvatar, author"></div><p class="msg-author unread" data-msg="bind:highlight, status; bind:innerHTML, username">Author</p><div class="select-msg"></div><span class="date" data-msg="bind: date, date">jj/mm/aaaa</span><p class="msg-subject unread" data-msg="bind:highlight, status; bind:innerHTML, object">Subject</p></li></ul></div></div><div id="msg-detail" class="details" data-msgdetailstack="destination"></div></div>';
                        
                        messageUI.place(Map.get("connect-messages"));
                        
                        messageUI.plus = function plus(event, node){
                                
                        };
                        
                        messageUI.displaySort = function(event, node){
                                var id = node.getAttribute("data-sort_id");
                                if (currentSort >-1) sortButtons.update(currentSort, "selected", false);
                                sortButtons.update(id, "selected", true);
                                currentSort = id;
                                 msgList.reset(sortMessages(id));
                        };
                        
                        messageUI.search = function(event, node){
                                var msgs = [];
                                if (event.keyCode === 13){
                                        sortButtons.update(currentSort, "selected", false);
                                        currentSort = -1;
                                        msgList.reset(searchMessages(node.value));             
                                } 
                        };
                        
                        messageUI.init = function init(){
                                msgList.reset(user.get("notifications"));       
                        };
                       
                        //delete messages older than 30 days
                        messageUI.cleanOld = function(){
                                
                        };
                        
                        defaultPage.template = '<div class="msgsplash"><div class="header blue-dark"><span>'+Config.get("labels").get("messageview")+'</span></div><div class="innersplash"></div></div>';
                       
                        // initialize
                        // get message list from user document
                        messageUI.init();
                        // add UIs to detail stack
                        detailStack.getStack().add("#defaultPage", defaultPage);
                        detailStack.getStack().add("#msgdetail", new MessageDetail());
                        // show default page
                        detailStack.getStack().show("#defaultPage");
                        
                        return messageUI;
                };
        });
