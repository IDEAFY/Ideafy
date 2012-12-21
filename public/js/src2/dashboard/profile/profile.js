define("Ideafy/Dashboard/Profile", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "Ideafy/Utils"],
        function(Widget, Map, Model, Event, Config, Store, Utils){
                
           return function ProfileConstructor(){
                   
                   var profileUI = new Widget(),
                       user = Config.get("user"),
                       labels = Config.get("labels"),
                       stats = new Store({"view": "info", "completion": 0}),
                       badges = new Store([{type:"grade", badge:"beginner.png", label: "Beginner"}]); // always start with grade (or distinction then grade if distinction is present)
                       
                   profileUI.plugins.addAll({
                           "label" : new Model(labels),
                           "stats" : new Model(stats,{
                                   setViewLbl : function(view){
                                        this.innerHTML = labels.get(view);             
                                   },
                                   toggleInformation : function(view){
                                        (view === "info") ? this.classList.remove("invisible"):this.classList.add("invisible");        
                                   },
                                   toggleLeaderboard : function(view){
                                        (view === "leaderboard") ? this.classList.remove("invisible"):this.classList.add("invisible");        
                                   },
                                   setPercentage : function(completion){
                                           this.innerHTML = labels.get("completionprefix")+completion+labels.get("completionsuffix")
                                   }
                           }),
                           "achievements" : new Model(badges,{
                                   showBadge : function(badge){
                                           console.log(badge);
                                           this.setAttribute("style", "background: url('../img/profile/"+badge+"') no-repeat center center; background-size: cover;");
                                   }
                           }),
                           "user" : new Model(user,{
                                setAvatar : function(author){
                                                this.setAttribute("style", "background: url('"+ Config.get("avatar") + "') no-repeat center center;background-size:cover;");
                                },
                                setLocation : function(address){
                                        if (address.country){
                                                this.innerHTML = address.country.toUpperCase();
                                        }
                                        if (address.city && address.country) {
                                                this.innerHTML=address.city+", "+address.country.toUpperCase();        
                                        }
                                        if (address.city && address.state && address.country){
                                                this.innerHTML=address.city+", "+ address.state.toUpperCase()+" "+address.country.toUpperCase();
                                        }    
                                },
                                setAge : function(dob){
                                        var now = new Date(), then = new Date(dob[0], dob[1], dob[2]),
                                            age = now.getTime() - then.getTime();
                                            
                                            this.innerHTML = Math.floor(age/1000/3600/24/365);        
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
                           }),
                           "profileevent" : new Event(profileUI)
                   });
                   
                   profileUI.template = '<div id="dashboard-profile"><div class="header blue-dark"><span data-label="bind:innerHTML, profilelbl"></span></div><input class="infoslider" type="range" min="0" max="1" value ="0" data-label="bind:innerHTML, information" data-profileevent="listen:touchend, switchLeaderboard"><span class="slidertext" data-stats="bind:setViewLbl, view"></span><div id="profile-content" data-stats="bind:toggleInformation, view"><div class="leftprofile"><div class="userdetails"><div class="cd-picarea"><div class="cardpicture" data-user="bind:setAvatar, _id"></div><div class="cardinfo"><p><span class="cd-agelbl"></span><span data-user="bind:setAge, birthdate"></span><span class="agesuffix" data-label="bind:innerHTML, agelbl"></span></p><p><span class="cd-locationlbl"></span><span class="cd-info" data-user="bind: setLocation, address"></span></p><p><span class="cd-joblbl"></span><span class="cd-info" data-user="bind: innerHTML, occupation.description"></span></p><p><span class="cd-familylbl"></span><span class="cd-info" data-user="bind: setFamily, family"></span></p><p><span class="cd-introlbl"></span><span class="cd-info" data-user="bind:innerHTML, intro"></span></p></div></div><div class="cd-contentarea"><span class="contentTitle" data-label="bind: innerHTML, hobbieslbl">Hobbies</span><p class = "dyknow" data-user="bind:setLeisure, leisure_activities">hobbies</p><span class="contentTitle" data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "dyknow" data-user="bind: setInterests, interests">Centers of interest</p></div><div><legend data-stats="bind: setPercentage, completion"></legend><div class="completionbar"><div class="innerbar" data-stats = "bind:setProgress, completion"></div></div></div></div><div class="edituserdetails invisible"></div><div class="mystats">My stats</div><div class="recenthistory">Recent history</div></div><div class = "rightprofile"><div class="userscore"><span class="ip" data-user="bind:innerHTML, ip"></span><span> Ideafy Points</span></div><div class="userachievements"><p class="grade" data-stats="bind:innerHTML, title"></p><ul class="badges" data-achievements="foreach"><li class="badge"><div data-achievements="bind:showBadge, badge"></div><legend data-achievements="bind:innerHTML, label"</li></ul></div></div></div><div id="leaderboard" data-stats="bind:toggleLeaderboard, view">Leaderboard</div></div>';
                   
                   profileUI.place(Map.get("dashboard-profile"));
                   
                   profileUI.switchLeaderboard = function(event, node){
                        var lb = document.getElementById("leaderboard"), pc = document.getElementById("profile-content");
                        console.log(node.value);
                        if (node.value == 1){
                                node.setAttribute("style", "background: #5F8F28;");
                                stats.set("view", "leaderboard");
                        }
                        else{
                                node.setAttribute("style", "background: #9AC9CD;");
                                stats.set("view", "info");        
                        }
                   };
                   
                   // watch for changes in user document
                   ["added", "deleted", "updated"].forEach(function(change){
                           user.watch(change, function(){
                                   
                           });
                   });
                   
                   profileUI.updateGrade = function updateGrade(data){
                           var achievements = JSON.parse(badges.toJSON());
                           
                           // update title with grade
                           stats.set("title", data.grade.label);
                           // udpate badge (position 0 or 1 in the array)
                           if (achievements[0].type === "grade") {
                                   achievements[0].badge = data.grade.badge;
                                   achievements[0].label = data.grade.title;
                           }
                           else if (achievements[1].type === "grade") {
                                   achievements[1].badge = data.grade.badge;
                                   achievements[1].label = data.grade.title;
                           }
                           
                           // check if there is a distinction and update accordingly
                           if (data.distinction) {
                                   stats.set("title", data.distinction.label);
                                   // insert new badge at the beginning or update existing one
                                   if (achievements[0].type === "distinction"  && achievements[0].badge !== data.distinction.badge){
                                        achievements[0].badge = data.distinction.badge;
                                        achievements[0].label = data.distinction.title;      
                                   }
                                   else{
                                           achievements.unshift({type:"distinction", badge: data.distinction.badge, label: data.distinction.title});
                                   }
                           }
                           badges.reset(achievements);
                   };
                   
                   //init
                   Utils.getGrade(user.get("ip"), function(result){
                        profileUI.updateGrade(result);
                   });
                   
                   Utils.getAchievements(user.get("_id"), function(result){
                        profileUI.updateAchievements(result);        
                   });
                   
                   BADGES = badges;
                   
                   return profileUI;
           };    
        });
