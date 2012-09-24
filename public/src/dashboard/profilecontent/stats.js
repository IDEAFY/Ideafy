define ("Stats", ["Olives/OObject", "Map", "Store", "Config", "Olives/Model-plugin", "Utils"],
        function(OObject, Map, Store, Config, ModelPlugin, Utils){
                
           return function StatsConstructor(dObserver){
                   
                   var stats = new OObject(),
                       news = new Store([]),
                       avatar = new Store({"image": "images/userpics/deedee0.png", "filename": ""}),
                       user = Config.get("user"),
                       labels = {
                               ip: {pre:"You have ", post: " I.P."},
                               rank: {pre: "Your current grade is: "},
                               ideas:{pre: "You have entered ", post: " ideas"},
                               su_sessions:{pre: "You have completed ", post: " single user brainstorming sessions"},
                               twoq : {pre: "You have asked ", post: " ToQuestions"},
                               twoc : {pre: "You have posted ", post: " TwoCents"},
                               contacts : {pre: "You have made ", post: " acquaintances"}
                       };
                   
                   stats.plugins.addAll({
                        "stats": new ModelPlugin(Config.get("user"), {
                                setIP : function(value){
                                        var ip = value || 0;
                                        this.innerHTML = labels.ip.pre+ip+labels.ip.post;
                                },
                                setRank : function(ip){
                                        var rank;
                                        if (ip){
                                                rank = Utils.getRank(ip);
                                                this.innerHTML = labels.rank.pre+rank.title;
                                        }
                                },
                                setIdeas : function(ideas_count){
                                        if (ideas_count>-1){
                                                this.innerHTML = labels.ideas.pre+ideas_count+labels.ideas.post;
                                        }
                                },
                                setSUSessions : function(su_sessions_count){
                                        if (su_sessions_count>-1){
                                                this.innerHTML = labels.su_sessions.pre+su_sessions_count+labels.su_sessions.post;
                                        }
                                },
                                setTwoQuestions : function(twoquestions_count){
                                        if (twoquestions_count>-1) {
                                                this.innerHTML = labels.twoq.pre+twoquestions_count+labels.twoq.post;
                                        }
                                },
                                setTwoCents : function(twocents_count){
                                        if (twocents_count>-1) {
                                                this.innerHTML = labels.twoc.pre+twocents_count+labels.twoc.post;
                                        }
                                },
                                setAcquaintances : function(connections){
                                        if (connections && connections.length>0) {
                                                this.innerHTML = labels.contacts.pre+connections.length+labels.contacts.post;
                                        }
                                }
                        }),
                        "avatar": new ModelPlugin(avatar, {
                                        setStyle : function(image){
                                                if (image){
                                                this.setAttribute("style", "background-image:url("+image+");");
                                                }
                                        }
                                }),
                        "news": new ModelPlugin(news, {
                                formatDate : function(date){
                                        if (date){
                                                this.innerHTML = new Date(date[0], date[1] , date[2], date[3], date[4]).toDateString();
                                        }
                                }
                        })      
                   });
                   
                   // get avatar changes
                   Config.get("observer").watch("avatar-loaded", function(uid){
                        if (uid === Config.get("user").get("_id")){
                                avatar.set("image", Config.get("avatars").get(uid));
                        }
                   });
                   
                   // get news changes
                   user.watchValue("news", function(){
                        news.reset(user.get("news"));        
                   });
                       
                   dObserver.watch("login-completed", function(){
                           
                           if (user.get("news")){
                                   news.reset(user.get(news));
                           }
                           
                            // get avatar
                           var uid = user.get("_id"),
                               image = Config.get("avatars").get(uid);
                                
                           if (image){
                                avatar.set("image", image);
                           }
                           else {
                                avatar.set("image", "images/userpics/deedee0.png");
                           } 
                           
                   });
                   
                   stats.alive(Map.get("stats"));
                   
                   return stats;     
           } 
        });
