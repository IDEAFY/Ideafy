define("TwocentList", ["Olives/OObject", "Config", "CouchDBStore", "Store", "Ideafy/Utils", "Olives/Model-plugin", "Olives/Event-plugin", "TwocentReplyList", "WriteTwocent", "WriteTwocentReply", "Ideafy/Avatar"],
        function(Widget, Config, CouchDBStore, Store, Utils, Model, Event, TwocentReplyList, WriteTwocent, WriteTwocentReply, Avatar){
                
                function TwocentListConstructor($id, $view){
                       
                        // declaration
                        var cdb = new CouchDBStore(),
                            store = new Store([]),
                            transport = Config.get("transport"),
                            user = Config.get("user");
                        
                        // setup
                        // retrieve twocents data from couchdb
                        cdb.setTransport(transport);
                        cdb.sync(Config.get("db"), $id).then(function(){
                                store.reset(cdb.get("twocents"));
                                
                                cdb.watchValue("twocents", function(value){
                                        store.reset(value);        
                        });
                        });
                        
                        // define plugins and methods
                        this.plugins.addAll({
                                "labels" : new Model(Config.get("labels")),
                                "twocents" : new Model(store, {
                                        date : function date(date){
                                                if (date) {this.innerHTML = Utils.formatDate(date);}
                                        },
                                        setFirstName : function(firstname){
                                                if (firstname !== user.get("firstname")){
                                                        this.innerHTML = firstname;
                                                }
                                                else {
                                                        var id = this.getAttribute("data-twocents_id");
                                                        (store.get(id).author === user.get("_id")) ? this.innerHTML = Config.get("labels").get("youlbl"): this.innerHTML = firstname;
                                                }
                                        },
                                        setVisible : function(author){
                                                (author === user.get("_id")) ? this.setAttribute("style", "display: block;") : this.setAttribute("style", "display: none;");
                                        },
                                        setInVisible : function(author){
                                                (author === user.get("_id")) ? this.setAttribute("style", "display: none;") : this.setAttribute("style", "display: block;");
                                        },
                                        deleteOK : function(replies){
                                                var tc = this.getAttribute("data-twocents_id");
                                                //Author cannot delete a twocent if there are already replies from other users
                                                if (replies && replies.length>0){
                                                        this.setAttribute("style", "display: none;");
                                                }
                                                else{
                                                        //check if user is actual author
                                                        (user.get("_id") === store.get(tc).author) ? this.setAttribute("style", "display: block;") : this.setAttribute("style", "display: none;");         
                                                }       
                                        },
                                        toggleHideButton : function(replies){
                                                (!replies || !replies.length) ? this.classList.add("invisible") : this.classList.remove("invisible");       
                                        },
                                        displayReplies : function(replies){
                                                if (!replies || !replies.length){
                                                        this.classList.add("invisible");}
                                                else {
                                                        var tc = this.getAttribute("data-twocents_id");
                                                        var ui = new TwocentReplyList(replies, $id, tc, $view),
                                                            frag = document.createDocumentFragment();
                                                        ui.render();
                                                        ui.place(frag);
                                                        
                                                        if (this.hasChildNodes()){
                                                                this.replaceChild(frag, this.firstChild);
                                                        }
                                                        else {
                                                                this.appendChild(frag);
                                                        }
                                                        this.classList.remove("invisible");
                                                }    
                                        },
                                        setAvatar : function setAvatar(author){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar([author]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        }
                                }),
                                "twocentevent" : new Event(this)        
                        });
                        
                        this.template = '<ul class="twocentList" data-twocents="foreach"><li class="twocent"><div class="twocentHeader"><div class="twocentAvatar" data-twocents="bind: setAvatar, author"></div><div class="twocentAuthor"data-twocents="bind: setFirstName, firstname"></div><span class="commentLabel" data-labels="bind: innerHTML, twocentcommentlbl"></span><br/><div class="twocentDate date" data-twocents="bind: date, date"></div><div class="twocentMenu"><div class="twocentButton twocentEditButton" data-twocents="bind: setVisible, author" data-twocentevent="listen: touchstart, edit"></div><div class="twocentButton twocentDeleteButton" data-twocents="bind: deleteOK, replies" data-twocentevent="listen: touchstart, deleteTwocent"></div><div class="twocentButton twocentReplyButton" data-twocents="bind: setInVisible, author" data-twocentevent="listen: touchstart, reply"></div></div></div><div class="twocentBody"><p class="twocentMessage" data-twocents="bind: innerHTML, message"></p><div class="repliesButton hideReplies" name="hide" data-twocents="bind: toggleHideButton, replies" data-twocentevent="listen: touchstart, toggleReplies" data-labels="bind:innerHTML, hidetwocentreplies"></div></div><div class="writePublicTwocentReply invisible"></div><div class="displayReplies" data-twocents="bind: displayReplies, replies"></div></li></ul>';
                        
                        this.edit = function(event, node){
                                var id = node.getAttribute("data-twocents_id"),
                                    writeUI = new WriteTwocent(),
                                    frag = document.createDocumentFragment();  
                                writeUI.reset($id, store.get(id), id);
                                writeUI.render();
                                writeUI.place(frag);
                                // replace current twocent with writeUI
                                this.dom.replaceChild(frag, this.dom.children[id]);        
                        };
                        
                        this.deleteTwocent = function(event, node){
                                var position = node.getAttribute("data-twocents_id"),
                                    json = {docId: $id, type: "delete", position: position, twocent:{author: user.get("_id")}};
                                
                                //should we ask for confirmation??
                                alert("Are you sure?");
                                
                                transport.request("WriteTwocent", json, function(result){
                                        if (result !== "ok"){
                                                alert(Config.get("labels").get("somethingwrong"));        
                                        }               
                                });      
                        };
                        
                        this.reply = function(event, node){
                                var position = node.getAttribute("data-twocents_id"),
                                    parent = document.querySelector(".writePublicTwocentReply[data-twocents_id='"+position+"']"),
                                    writeUI = new WriteTwocentReply(parent),
                                    frag = document.createDocumentFragment();
                                    
                                    writeUI.reset($id, position);
                                    writeUI.render();
                                    writeUI.place(frag);
                                    
                                    if (!parent.hasChildNodes()){
                                            parent.appendChild(frag);
                                    }
                                    parent.classList.remove("invisible");                          
                        };
                        
                        this.toggleReplies = function(event, node){
                                var position = node.getAttribute("data-twocents_id"),
                                    replies = store.get(position).replies,
                                    name = node.getAttribute("name"),
                                    dom = document.querySelector(".displayReplies[data-twocents_id='"+position+"']"); 
                                       
                                if (name === "show"){
                                        // show twocent replies
                                        dom.classList.remove("invisible");
                                        // toggle button to hide mode
                                        node.setAttribute("name", "hide");
                                        node.classList.remove("showReplies");
                                        node.classList.add("hideReplies");
                                        node.innerHTML = Config.get("labels").get("hidetwocentreplies");
                                }
                                else {
                                        // hide twocent replies
                                        dom.classList.add("invisible");
                                        // toggle button to show mode
                                        node.setAttribute("name", "show");
                                        node.classList.remove("hideReplies");
                                        node.classList.add("showReplies");
                                        if (replies.length === 1){
                                                node.innerHTML = Config.get("labels").get("showonetcreply");
                                        }
                                        else{
                                                node.innerHTML = Config.get("labels").get("showtcrepliesbefore")+replies.length+Config.get("labels").get("showtcrepliesafter");
                                        }
                                }
                        };
                }       
                
                return function TwocentListFactory($id, $view){
                        TwocentListConstructor.prototype = new Widget;
                        return new TwocentListConstructor($id, $view);
                };      
                
        });
