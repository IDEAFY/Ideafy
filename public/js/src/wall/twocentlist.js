define("TwocentList", ["Olives/OObject", "Config", "Store", "Ideafy/Utils", "Olives/Model-plugin", "Olives/Event-plugin", "TwocentReplyList", "WriteTwocent", "WriteTwocentReply"],
        function(Widget, Config, Store, Utils, ModelPlugin, EventPlugin, TwocentReplyList, WriteTwocent, WriteTwocentReply){
                
                function TwocentListConstructor($data, $id, $view){
                        
                        var store = new Store($data),
                            transport = Config.get("transport"),
                            user = Config.get("user"),
                            avatars;
                        
                        if ($view === "public") {
                                avatars = Config.get("publicAvatars");
                        };
                        
                        this.plugins.addAll({
                                "labels" : new ModelPlugin(Config.get("labels")),
                                "twocents" : new ModelPlugin(store, {
                                        date : function date(date){
                                                if (date) {this.innerHTML = Utils.formatDate(date);}
                                        },
                                        setFirstName : function(firstname){
                                                if (firstname !== user.get("firstname")){
                                                        this.innerHTML = firstname;
                                                }
                                                else {
                                                        var id = this.getAttribute("data-twocents_id");
                                                        if (store.get(id).author === user.get("_id")){
                                                                this.innerHTML = "You";
                                                        }
                                                        else{
                                                                this.innerHTML = firstname;
                                                        }
                                                }
                                        },
                                        setVisible : function(author){
                                                (author === user.get("_id")) ? this.setAttribute("style", "display: block;") : this.setAttribute("style", "display: none;");
                                        },
                                        setInVisible : function(author){
                                                (author === user.get("_id")) ? this.setAttribute("style", "display: none;") : this.setAttribute("style", "display: block;");
                                        },
                                        deleteOK : function(replies){
                                                //Author cannot delete a twocent if there are already replies from other users
                                                (replies && replies.length>0) ? this.setAttribute("style", "display: none;") : this.setAttribute("style", "display: block;");        
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
                                                if (author === Config.get("user").get("_id")){
                                                        this.setAttribute("style", "background:url('"+Config.get("avatars").get(author)+"') no-repeat center center; background-size: cover;");        
                                                }
                                                else{
                                                    if (avatars.get(author)){
                                                        this.setAttribute("style", "background:url('"+avatars.get(author).img+"') no-repeat center center; background-size: cover;");        
                                                    }
                                                    else{
                                                        Utils.getUserAvatar(author, avatars);
                                                        avatars.watchValue(author, function(value){
                                                                if (value.status === "ready"){
                                                                        this.setAttribute("style", "background:url('"+value.img+"') no-repeat center center; background-size: cover;");
                                                                }
                                                        });       
                                                    }
                                                }
                                         }
                                     }),
                                "twocentevent" : new EventPlugin(this)        
                        });
                        
                        this.template = '<ul class="twocentList" data-twocents="foreach"><li class="twocent"><div class="twocentHeader"><div class="twocentAvatar" data-twocents="bind: setAvatar, author"></div><div class="twocentAuthor"data-twocents="bind: setFirstName, firstname"></div><span class="commentLabel" data-labels="bind: innerHTML, twocentcommentlbl"></span><br/><div class="twocentDate date" data-twocents="bind: date, date"></div><div class="twocentMenu"><div class="twocentButton twocentEditButton" data-twocents="bind: setVisible, author" data-twocentevent="listen: click, edit"></div><div class="twocentButton twocentDeleteButton" data-twocents="bind: setVisible, author; bind: deleteOK, replies" data-twocentevent="listen: click, deleteTwocent"></div><div class="twocentButton twocentReplyButton" data-twocents="bind: setInVisible, author" data-twocentevent="listen: click, reply"></div></div></div><div class="twocentBody"><p class="twocentMessage" data-twocents="bind: innerHTML, message"></p><div class="repliesButton hideReplies" name="hide" data-twocents="bind: toggleHideButton, replies" data-twocentevent="listen: click, toggleReplies" data-labels="bind:innerHTML, hidetwocentreplies"></div></div><div class="writePublicTwocentReply invisible"></div><div class="displayReplies" data-twocents="bind: displayReplies, replies"></div></li></ul>';
                        
                        this.edit = function(event, node){
                                var id = node.getAttribute("data-twocents_id"),
                                    twocentNode = document.querySelector("li.twocent[data-twocents_id='"+id+"']"),
                                    parent = twocentNode.parentElement;
                                    writeUI = new WriteTwocent();
                                    frag = document.createDocumentFragment();
                                    
                                writeUI.reset($id, store.get(id));
                                writeUI.render();
                                writeUI.place(frag);
                                // replace current twocent with writeUI
                                parent.replaceChild(frag, twocentNode);        
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
                
                return function TwocentListFactory($data, $id, $view){
                        TwocentListConstructor.prototype = new Widget;
                        return new TwocentListConstructor($data, $id, $view);
                };      
                
        });
