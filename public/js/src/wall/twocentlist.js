define("TwocentList", ["Olives/OObject", "Config", "Store", "Ideafy/Utils", "Olives/Model-plugin", "Olives/Event-plugin","TwocentReply", "WriteTwocent"],
        function(Widget, Config, Store, Utils, ModelPlugin, EventPlugin, TwocentReply, WriteTwocent){
                
                function TwocentListConstructor($data, $id, $view){
                        
                        var store = new Store($data),
                            transport = Config.get("transport"),
                            user = Config.get("user"),
                            avatars;
                        
                        if ($view === "public") {
                                avatars = Config.get("publicAvatars");
                        };
                        
                        this.plugins.addAll({
                                "label" : new ModelPlugin(Config.get("labels")),
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
                                        displayReplies : function(replies){
                                                if (!replies || !replies.length){
                                                        this.classList.add("invisible");}
                                                else {
                                                        var ui = new TwocentReply(replies),
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
                        
                        this.template = '<ul class="twocentList" data-twocents="foreach"><li class="twocent"><div class="twocentHeader"><div class="twocentAvatar" data-twocents="bind: setAvatar, author"></div><div class="twocentAuthor"data-twocents="bind: setFirstName, firstname">Olivier</div><span class="commentLabel" data-labels="bind: innerHTML, twocentcommentlbl"></span><br/><div class="twocentDate date" data-twocents="bind: date, date"></div><div class="twocentMenu"><div class="twocentButton twocentEditButton" data-twocents="bind: setVisible, author" data-twocentevent="listen: click, edit"></div><div class="twocentButton twocentDeleteButton" data-twocents="bind: setVisible, author; bind: deleteOK, replies" data-twocentevent="listen: click, deleteTwocent"></div><div class="twocentButton twocentReplyButton" data-twocents="bind: setInVisible, author"></div></div></div><p class = "twocentMessage" data-twocents="bind: innerHTML, message">Well I believe this is a really really cool idea</p><div class"displayReplies" data-twocents="bind: displayReplies, replies"><div class="twocentreplylist"></div></div></li></ul>';
                        
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
                                    json = {docId: $id, type: "delete", position: position};
                                
                                //should we ask for confirmation??
                                alert("Are you sure?");
                                
                                transport.request("WriteTwocent", json, function(result){
                                        if (result !== "ok"){
                                                alert(Config.get("labels").get("somethingwrong"));        
                                        }               
                                });
                                
                        }
                
                }       
                
                return function TwocentListFactory($data, $id, $view){
                        TwocentListConstructor.prototype = new Widget;
                        return new TwocentListConstructor($data, $id, $view);
                };      
                
        });
