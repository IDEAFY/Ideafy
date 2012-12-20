define("Ideafy/Dashboard/Profile", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config", "Store"],
        function(Widget, Map, Model, Config, Store){
                
           return function ProfileConstructor(){
                   
                   var profileUI = new Widget(),
                       user = Config.get("user"),
                       stats = new Store({"completion": 0}),
                       labels = Config.get("labels");
                       
                   profileUI.plugins.addAll({
                           "label" : new Model(labels),
                           "stats" : new Model(stats,{
                                   setPercentage : function(completion){
                                           this.innerHTML = labels.get("completionprefix")+completion+labels.get("completionsuffix")
                                   }
                           }),
                           "user" : new Model(user,{
                                setAvatar : function(author){
                                                this.setAttribute("style", "background: url('"+ Config.get("avatar") + "') no-repeat center center;background-size:cover;");
                                },
                                setFamily : function(family){
                                        var couple = family.couple,
                                            children = family.children,
                                            res1, res2;
                                                
                                        if (couple === 0) res1 = labels.get("singlelbl")
                                        else if (couple === 1) res1 = labels.get("marriedlbl")
                                        else if (couple === 2) res1 = labels.get("divorcedlbl")
                                        else if (couple === 3) res1 = labels.get("widowlbl")
                                                
                                        if (children === 0) {res2 = "";}
                                        else{
                                                if (user.get("age") < 20){
                                                        (children === 1) ? res2 = children + labels.get("onesiblinglbl") : res2 = children + labels.get("siblingslbl");
                                                }
                                                else {
                                                        (children === 1) ? res2 = children + labels.get("onechildlbl") : res2 = children + labels.get("childrenlbl");
                                                }
                                                res2=", "+res2;
                                        }
                                        this.innerHTML = res1 + res2;
                                },
                                setLeisure : function(hobbies){
                                        var res = "<ul>";
                                        if (hobbies && hobbies.length){
                                                for (i=0; i<hobbies.length; i++){
                                                        res+="<li>"+hobbies[i].name+" ("+hobbies[i].comment+")</li>";
                                                }
                                                this.innerHTML = res+"</ul>";
                                        }
                                        else{
                                                this.innerHTML = "";
                                        } 
                                 },
                                 setInterests : function(interests){
                                        var res = "<ul>";
                                        if (interests && interests.length){
                                                for (i=0; i<interests.length; i++){
                                                        res+="<li>"+interests[i].name+" ("+interests[i].comment+")</li>";
                                                }
                                                this.innerHTML = res+"</ul>";
                                        }
                                        else{
                                                this.innerHTML = "";
                                        } 
                                }
                           })
                   });
                   
                   profileUI.template = '<div id="dashboard-profile"><div class="header blue-dark"><span data-label="bind:innerHTML, profilelbl"></span></div><div id="profile-content"><div class="userdetails"><div class="cd-picarea"><div class="cardpicture" data-user="bind:setAvatar, _id"></div><div class="cardinfo"><p><span class="cd-agelbl"></span><span data-carddetails="bind:innerHTML, age">age</span><span class="agesuffix" data-label="bind:innerHTML, agelbl"></span></p><p><span class="cd-locationlbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, location"></span></p><p><span class="cd-joblbl"></span><span class="cd-info" data-carddetails="bind: innerHTML, occupation.description"></span></p><p><span class="cd-familylbl"></span><span class="cd-info" data-user="bind: setFamily, family"></span></p><p><span class="cd-introlbl"></span><span class="cd-info" data-user="bind:innerHTML, intro"></span></p></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, hobbieslbl">Hobbies</span><p class = "dyknow" data-user="bind:setLeisure, leisure_activities">hobbies</p><span class="contentTitle" data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "dyknow" data-user="bind: setInterests, interests">Centers of interest</p></div><div><legend data-stats="bind: setPercentage, completion"></legend><div class="completionbar" data-stats = "bind:setProgress, completion"></div></div></div></div></div>';
                   
                   profileUI.place(Map.get("dashboard-profile"));
                   
                   // watch for changes in user document
                   ["added", "deleted", "updated"].forEach(function(change){
                           user.watch(change, function(){
                                   
                           });
                   });
                   
                   return profileUI;
           };    
        });
