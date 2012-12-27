define("Ideafy/Dashboard/Profile", ["Olives/OObject", "Map", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "Store", "Ideafy/Utils"],
        function(Widget, Map, Model, Event, Config, Store, Utils){
                
           return function ProfileConstructor(){
                   
                   var profileUI = new Widget(),
                       user = Config.get("user"),
                       labels = Config.get("labels"),
                       stats = new Store({"view": "info", "completion": 0}),
                       news = new Store(user.get("news")),
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
                                           this.innerHTML = labels.get("completionprefix")+completion+labels.get("completionsuffix");
                                   },
                                   setProgress : function(completion){
                                           (completion === 100)?this.setAttribute("style", "width:100%;border-top-right-radius:5px;border-bottom-right-radius:5px;"):this.setAttribute("style", "width:"+completion+"%;");
                                   },
                                   showDetails : function(percentage){
                                           (percentage === 100) ? this.classList.add("invisible"):this.classList.remove("invisible");
                                   }
                           }),
                           "achievements" : new Model(badges,{
                                   showBadge : function(badge){
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
                                        else {
                                                this.innerHTML = labels.get("completeprofile");
                                        }
                                        if (address.city && address.country) {
                                                this.innerHTML=address.city+", "+address.country.toUpperCase();        
                                        }
                                        if (address.city && address.state && address.country){
                                                this.innerHTML=address.city+", "+ address.state.toUpperCase()+" "+address.country.toUpperCase();
                                        }    
                                },
                                setAge : function(dob){
                                        var now = new Date(), then, age;
                                        
                                        if (dob.length === 3){
                                                then = new Date(dob[0], dob[1], dob[2]);
                                                age = now.getTime() - then.getTime();
                                                this.innerHTML = Math.floor(age/1000/3600/24/365)+" "+ labels.get("agelbl");
                                        }
                                        else this.innerHTML = labels.get("completeprofile");        
                                },
                                setFamily : function(family){
                                        var couple = family.couple,
                                            children = family.children,
                                            res1, res2;
                                        if (couple === null) res1 = labels.get("completeprofile")     
                                        else if (couple === 0) res1 = labels.get("singlelbl")
                                        else if (couple === 1) res1 = labels.get("marriedlbl")
                                        else if (couple === 2) res1 = labels.get("divorcedlbl")
                                        else if (couple === 3) res1 = labels.get("widowlbl")
                                                
                                        if (!children || children === 0) {res2 = "";}
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
                                setOccupation : function(value){
                                        (value.description) ? this.innerHTML=value.description : this.innerHTML=labels.get("completeprofile");        
                                },
                                showLeisure : function(hobbies){
                                        (hobbies[0].name || hobbies[1].name || hobbies[2].name)?this.classList.remove("invisible"):this.classList.add("invisible");      
                                },
                                setLeisure : function(hobbies){
                                        var res = "<ul>";
                                        if (hobbies && hobbies.length){
                                                for (i=0; i<hobbies.length; i++){
                                                        if (hobbies[i].comment){
                                                                res+="<li>"+hobbies[i].name+" ("+hobbies[i].comment+")</li>";
                                                        }
                                                        else res += "<li>"+hobbies[i].name+"</li>";
                                                }
                                                this.innerHTML = res+"</ul>";
                                        }
                                        else{
                                                this.innerHTML = "";
                                        } 
                                 },
                                showInterests: function(interests){
                                        (interests[0].name || interests[1].name || interests[2].name)?this.classList.remove("invisible"):this.classList.add("invisible");        
                                 },
                                setInterests : function(interests){
                                        var res = "<ul>";
                                        if (interests && interests.length){
                                                for (i=0; i<interests.length; i++){
                                                        if (interests[i].comment){
                                                                res+="<li>"+interests[i].name+" ("+interests[i].comment+")</li>";
                                                        }
                                                        else{
                                                                res+="<li>"+interests[i].name+"</li>";        
                                                        }
                                                }
                                                this.innerHTML = res+"</ul>";
                                        }
                                        else{
                                                this.innerHTML = "";
                                        } 
                                },
                                setSessionCount : function(ip){
                                        // use IP because score changes everytime either a nw single or mutli user session is added
                                        var su = user.get("su_sessions_count") || 0,
                                            mu = user.get("mu_sessions_count") || 0;
                                        this.innerHTML = su + mu;
                                },
                                setContactCount : function(contacts){
                                        var count = 0;
                                        for (i=0, l=contacts.length; i<l; i++){
                                                if (contacts[i].type ==="user") count++;
                                        }
                                        this.innerHTML = count;
                                },
                                setBarLength : function(ip){
                                        if (ip >= 300000) this.setAttribute("style", "width: 100%")
                                        else if (ip >= 30000) this.setAttribute("style", "width: 75%")
                                        else if (ip >= 3000) this.setAttribute("style", "width: 50%")
                                        else this.setAttribute("style", "width: 25%")
                                },
                                setInnerBarLength : function(data){
                                        // first determine total number of items
                                        var total, sessions_count, contacts = 0, width = 0,
                                            su = user.get("su_sessions_count") || 0,
                                            mu = user.get("mu_sessions_count") || 0;
                                        
                                        sessions_count = su + mu;
                                        for (i=0, l=user.get("connections").length; i<l; i++){
                                                if (user.get("connections")[i].type === "user") contacts++;
                                        }
                                        total = user.get("ideas_count") + user.get("twoquestions_count") + contacts + sessions_count;
                                        
                                        console.log(total);
                                        // now check which data is received
                                        if (typeof data === "number" && data !== user.get("ip")){
                                                width = Math.floor(data/total*100);        
                                        }
                                        else if (data === user.get("ip")){
                                                width = Math.floor(sessions_count/total*100);
                                        }
                                        else {
                                                width = Math.floor(contacts/total*100);        
                                        }
                                        this.setAttribute("style", "width:"+width+"%;");
                                }
                           }),
                           "news": new Model(news),
                           "profileevent" : new Event(profileUI)
                   });
                   
                   profileUI.template = '<div id="dashboard-profile"><div class="header blue-dark"><span data-label="bind:innerHTML, profilelbl"></span></div><input class="infoslider" type="range" min="0" max="1" value ="0" data-label="bind:innerHTML, information" data-profileevent="listen:touchend, switchLeaderboard"><span class="slidertext" data-stats="bind:setViewLbl, view"></span><div id="profile-content" data-stats="bind:toggleInformation, view"><div class="leftprofile"><div class="userdetails"><div class="editbtn" data-profileevent="listen:touchstart, edit"></div><div class="cd-picarea"><div class="cardpicture" data-user="bind:setAvatar, _id"></div><div class="cardinfo"><h2 data-user="bind:innerHTML,username"></h2><blockquote data-user="bind:innerHTML, intro"></blockquote><p><span class="cd-agelbl"></span><span data-user="bind:setAge, birthdate"></span></p><p><span class="cd-locationlbl"></span><span class="cd-info" data-user="bind: setLocation, address"></span></p><p><span class="cd-joblbl"></span><span class="cd-info" data-user="bind: setOccupation, occupation"></span></p><p><span class="cd-familylbl"></span><span class="cd-info" data-user="bind: setFamily, family"></span></p></div></div><div class="cd-contentarea"><span class="contentTitle" data-user="bind:showLeisure, leisure_activities" data-label="bind: innerHTML, hobbieslbl"></span><p class = "dyknow" data-user="bind:setLeisure, leisure_activities"></p><span class="contentTitle" data-user="bind:showInterests, interests"data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "dyknow" data-user="bind: setInterests, interests"></p></div><div><legend data-stats="bind: setPercentage, completion"></legend><div class="completionbar"><div class="innerbar" data-stats = "bind:setProgress, completion"></div></div></div></div><div class="edituserdetails invisible">Edit profile</div><div class="mystats"><legend data-label="bind:innerHTML, mystatslbl"></legend><div class="completionbar"><ul data-user="bind: setBarLength, ip"><li class="innerbar myids" data-user="bind: setInnerBarLength, ideas_count"></li><li class="innerbar myss" data-user="bind:setInnerBarLength, ip"></li><li class="innerbar myctcts" data-user="bind: setInnerBarLength, connections"></li><li class="innerbar my2q" data-user="bind:setInnerBarLength, twoquestions_count"></li></ul></div><table><tr class ="myids"><th data-label="bind:innerHTML, ideaslbl"></th><td data-user="bind: innerHTML, ideas_count"></td></tr><tr class ="myss"><th data-label="bind:innerHTML, sessionslbl"></th><td data-user="bind: setSessionCount, ip"></td></tr><tr class="myctcts"><th data-label="bind:innerHTML, contactslbl"></th><td data-user="bind: setContactCount, connections"></td></tr><tr class="my2q"><th data-label="bind:innerHTML, toquestionslbl"></th><td data-user="bind: innerHTML, twoquestions_count"></td></tr></table></div><div class="recentactivity"><legend data-label="bind:innerHTML, recentactivitylbl"></legend><ul data-news="foreach"><li>news</li></ul></div></div><div class = "rightprofile"><div class="userscore"><span class="ip" data-user="bind:innerHTML, ip"></span><span> Ideafy Points</span></div><div class="userachievements"><p class="grade" data-stats="bind:innerHTML, title"></p><ul class="badges" data-achievements="foreach"><li class="badge"><div data-achievements="bind:showBadge, badge"></div><legend data-achievements="bind:innerHTML, label"</li></ul></div></div></div><div id="leaderboard" data-stats="bind:toggleLeaderboard, view">Leaderboard</div></div>';
                   
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
                   
                   profileUI.edit = function(event, node){
                        document.querySelector(".userdetails").classList.add("invisible");
                        document.querySelector(".edituserdetails").classList.remove("invisible");        
                   };
                   
                   // watch for changes in user document
                   ["added", "deleted", "updated"].forEach(function(change){
                           user.watch(change, function(){
                                profileUI.checkProfileCompletion();       
                           });
                   });
                   
                   profileUI.checkProfileCompletion = function(){
                        var result = Utils.checkProfileCompletion();
                        stats.set("completion", result.percentage);
                        stats.set("missing", result.missing);
                        if (result.percentage === 100 && user.get("profile_complete") !== true) {
                                user.set("profile_complete", true);
                                user.upload();
                        }
                   };
                   
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
                   
                   profileUI.updateAchievements = function updateAchievements(){
                           var onDisplay = badges.toJSON(), achievements = user.get("achievements");
                           console.log("achievements", achievements, "on display", onDisplay);
                           for (i=0, l=achievements.length; i<l; i++){
                                        var pattern = achievements[i].badge;
                                        if (onDisplay.search(pattern) < 0) {
                                                badges.alter("push", achievements[i]);
                                        }
                                        console.log(badges.toJSON());
                           }
                   };
                   
                   //init
                   Utils.getGrade(user.get("ip"), function(result){
                        profileUI.updateGrade(result);
                   });
                   
                   Utils.getAchievements(user.get("_id"), function(result){
                        if (result === "ok") profileUI.updateAchievements();        
                   });
                   
                   profileUI.checkProfileCompletion();
                   
                   // monitor user document
                   user.watchValue("news", function(){
                           news.reset(user.get("news"));
                   })
                   
                   return profileUI;
           };    
        });
