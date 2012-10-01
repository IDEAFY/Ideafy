define("TwocentReply", ["Olives/OObject", "Store", "Olives/Model-plugin", "Ideafy/Utils", "Config"],
        function(Widget, Store, ModelPlugin, Utils, Config){
                
                function TwocentReplyConstructor($data){
                        
                        var store = new Store($data),
                            avatars = Config.get("publicAvatars");
                             
                        this.plugins.addAll({
                                "model": new ModelPlugin(store, {
                                        date : function date(date){
                                               if (date){
                                                       this.innerHTML = Utils.formatDate(date);
                                               }
                                        },
                                        setAvatar : function setAvatar(author){
                                                if (author){
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
                                        }
                                  }),
                                  "labels": new ModelPlugin(Config.get("labels"))
                        });
                        
                   this.template = '<ul class="replies" data-model="foreach"><li class="twocentReply"><div class="replyAvatar" data-model="bind:setAvatar, author"></div><div class="twocentAuthor" data-model="bind: innerHTML, firstname"></div><span class="commentLabel" data-labels="bind: innerHTML, twocentreplycommentlbl"></span><br/><div class="twocentDate date" data-model="bind: date, date"></div><hr/><p class="replyMessage" data-model="bind: innerHTML, message"></p></li></ul>';
              }
                        
              return function TwocentReplyFactory($data){
                   TwocentReplyConstructor.prototype = new Widget;
                   return new TwocentReplyConstructor($data);       
              };    
                
        });

define("WriteTwocentReply", ["Olives/OObject", "Store", "Olives/Model-plugin"],
        function(Widget, Store, ModelPlugin){
                
                return function WriteTwocentReplyConstructor(){
                        
                        var reply = new Widget(),
                            store = new Store($data);
                            
                        reply.plugins.add("model", new ModelPlugin(store, {
                                date : function date(date){
                                                this.innerHTML = Utils.formatDate(date);
                                }
                        }));
                        reply.template = '<ul class="replies" data-model="foreach"><li class="twocentReply"><div class="replyAvatar"></div><div class="twocentAuthor" data-model="bind: innerHTML, firstname"></div><span class="commentLabel"></span><br/><div class="twocentDate date" data-model="bind: date, date"></div><hr/><p class="replyMessage" data-model="bind: innerHTML, message"></p></li></ul>';
                        
                        return reply;
                        
                };       
                
        });