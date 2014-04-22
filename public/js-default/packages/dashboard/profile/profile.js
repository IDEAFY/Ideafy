/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin", "Event.plugin", "service/config", "Store", "service/utils", "./leaderboard", "./editprofile", "Promise"],
        function(Widget, Map, Model, Event, Config, Store, Utils, Leaderboard, EditProfile, Promise){
                
           return function ProfileConstructor(){

/*
 * IMPORTANT NOTICE : file names for icons should not be changed -- if new icons are introduced for an existing reward they should use the same name
 * all other achivement information is localized and may vary
 */
                   
                   var profileUI = new Widget(),
                       user = Config.get("user"),
                       currentIP = user.get("ip"),
                       labels = Config.get("labels"),
                       progressBar = new Store({"total":0, "ideas": 0, "sessions": 0, "contacts": 0, "twoQ": 0}),
                       progress = new Store({"status": ""}),
                       stats = new Store({"view": "info", "completion": 0, "socialnw": 0}),
                       news = new Store(user.get("news")),
                       LB, EP, // used to initialize leaderboard and editprofile UIs
                       grades = new Store([]),
                       achievements = new Store(); // always start with grade (or distinction then grade if distinction is present)
                       
                   profileUI.plugins.addAll({
                           "label" : new Model(labels),
                           "stats" : new Model(stats,{
                                   setViewLbl : function(view){
                                        this.innerHTML = labels.get(view);
                                        (view === "info") ? this.setAttribute("style", "background: #9ac9cd;"):this.setAttribute("style", "background: #5F8F28;");           
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
                                   },
                                   showSocialNW : function(socialnw){
                                           (socialnw)?this.classList.remove("invisible"): this.classList.add("invisible");
                                   }
                           }),
                           "grades" : new Model(grades,{
                                   showBadge : function(badge){
                                           this.setAttribute("style", "background: url('img/profile/"+badge+"') no-repeat center center; background-size: cover;");
                                   }
                           }),
                           "achievements" : new Model(achievements,{
                                   showBadge : function(badge){
                                           this.setAttribute("style", "background: url('img/profile/"+badge+"') no-repeat center center; background-size: cover;");
                                   }
                           }),
                           "progressbar" : new Model(progressBar, {
                                   setWidth : function(width){
                                           this.setAttribute("style", "width:"+width+"%;");
                                   }
                           }),
                           "progress" :  new Model(progress),
                           "config" : new Model(Config,{
                                   setAvatar : function(avatar){
                                                this.setAttribute("style", "background: url('"+ avatar + "') no-repeat center center;background-size:cover;");
                                   }
                           }),
                           "user" : new Model(user,{
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
                                        
                                        if (dob && dob.length === 3){
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
                                        if (couple === null) res1 = labels.get("completeprofile");     
                                        else if (couple === 0) res1 = labels.get("singlelbl");
                                        else if (couple === 1) res1 = labels.get("marriedlbl");
                                        else if (couple === 2) res1 = labels.get("divorcedlbl");
                                        else if (couple === 3) res1 = labels.get("widowlbl");
                                                
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
                                setOccupation : function(occupation){
                                        if (occupation.situation === 4) this.innerHTML = labels.get("stayathome");
                                        else if (occupation.situation === 3) this.innerHTML = labels.get("unemployed");
                                        else if (occupation.situation === 0) {
                                                (occupation.organization)?this.innerHTML = labels.get("student")+ " @ " + occupation.organization : this.innerHTML = labels.get("student");
                                        }
                                        else if (occupation.situation === 2){
                                                (occupation.job)? this.innerHTML = occupation.job + " (" + labels.get("retired") + ")" : this.innerHTML = labels.get("retired");      
                                        }
                                        else if (occupation.situation === 1){
                                                if (!occupation.job && !occupation.organization) this.innerHTML = labels.get("active");
                                                else if (occupation.job && !occupation.organization) this.innerHTML=occupation.job;
                                                else if (!occupation.job && occupation.organization) this.innerHTML = labels.get("active") + " @ " + occupation.organization;
                                                else this.innerHTML = occupation.job + " @ " + occupation.organization;
                                        }
                                        else this.innerHTML=labels.get("completeprofile");        
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
                                                this.innerHTML="";
                                        } 
                                },
                                showSN : function(sn){
                                        (sn)?this.innerHTML=sn:this.innerHTML="";        
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
                                        if (ip >= 300000) this.setAttribute("style", "width: 100%");
                                        else if (ip >= 30000) this.setAttribute("style", "width: 75%");
                                        else if (ip >= 3000) this.setAttribute("style", "width: 50%");
                                        else this.setAttribute("style", "width: 25%");
                                }
                           }),
                           "news": new Model(news,{
                                   setType : function(type){
                                        if (type.search("CX")>-1) this.setAttribute("style", "background: url('img/profileDisable.png') no-repeat center center; background-size: contain;");
                                        else if (type.search("RWD")>-1 || type.search("RANK") >-1) this.setAttribute("style", "background: url('img/brainstorm/yourScore40.png') no-repeat center center; background-size: 40px;");
                                        else if (type.search("ID")>-1) this.setAttribute("style", "background: url('img/libraryIdeaDisabled40.png') no-repeat center center; background-size: 40px;");
                                        else if (type.search("2Q")>-1) this.setAttribute("style", "background: url('img/2questionDisable50.png') no-repeat center center; background-size: 40px;");
                                        else if (type.search("2CTS")>-1) this.setAttribute("style", "background: url('img/2centDisable.png') no-repeat center center; background-size: 40px;");    
                                   },
                                   setContent : function(content){
                                        var id = this.getAttribute("data-news_id");
                                        switch (news.get(id).type){
                                                case "CX+":
                                                        this.innerHTML = "<span class='newsinfo'>" + news.get(id).content.username + "</span>" + labels.get("isnowacontact");
                                                        break;
                                                case "CX-":
                                                        this.innerHTML = "<span class='newsinfo'>" + news.get(id).content.username  + "</span>" + labels.get("isnolongeracontact");
                                                        break;
                                                case "IDEA+":
                                                        this.innerHTML = labels.get("enterednewidea") + "<span class='newsinfo'>" + news.get(id).content.title + "</span>";
                                                        break;
                                                case "SHID":
                                                        this.innerHTML = labels.get("sharedanidea") + "("+"<span class='newsinfo'>" + news.get(id).content.title + "</span>)";
                                                        // add the list of usernames the idea was shared with
                                                        break;
                                                case "RANK":
                                                        this.innerHTML = labels.get("reachedrank") +"<span class='newsinfo'>" +news.get(id).content.label + "</span>";
                                                        break;
                                                case "RWD":
                                                        this.innerHTML = labels.get("gotaward") +"<span class='newsinfo'>" +news.get(id).content.label + "</span>";
                                                        break;
                                                case "2Q+":
                                                        this.innerHTML = labels.get("posted2q") +"<span class='newsinfo'>" +news.get(id).content.question + "</span>";
                                                        break;
                                                case "2CTS":
                                                        this.innerHTML = labels.get("commentedon") +"<span class='newsinfo'>" + news.get(id).content.title + "</span>" + labels.get("by")+news.get("id").content.username;
                                                        // can be refined later to differentiate between 2cts on ideas, usersor twoquestions
                                                        break;
                                                
                                        }        
                                   },
                                   formatDate : function(date){
                                           this.innerHTML = Utils.formatDate(date);
                                   }
                           }),
                           "profileevent" : new Event(profileUI)
                   });
                   
                   profileUI.template = '<div id="dashboard-profile"><div class="header blue-dark"><span data-label="bind:innerHTML, profilelbl"></span></div><input class="infoslider" type="range" min="0" max="1" value ="0" data-profileevent="listen:mouseup, switchLeaderboard"><span class="slidertext" data-stats="bind:setViewLbl, view"></span><div id="profile-content" data-stats="bind:toggleInformation, view"><div class="leftprofile"><div class="userdetails"><div class="editbtn" data-profileevent="listen:mousedown, edit"></div><div class="cd-picarea"><div class="cardpicture" data-config="bind:setAvatar, avatar"></div><div class="cardinfo"><h2 data-user="bind:innerHTML,username"></h2><blockquote data-user="bind:innerHTML, intro"></blockquote><p><span class="cd-agelbl"></span><span data-user="bind:setAge, birthdate"></span></p><p><span class="cd-locationlbl"></span><span class="cd-info" data-user="bind: setLocation, address"></span></p><p><span class="cd-joblbl"></span><span class="cd-info" data-user="bind: setOccupation, occupation"></span></p><p><span class="cd-familylbl"></span><span class="cd-info" data-user="bind: setFamily, family"></span></p></div></div><div class="cd-contentarea"><div data-user="bind:showLeisure, leisure_activities"><span class="contentTitle" data-label="bind: innerHTML, hobbieslbl"></span><p class = "userinfo" data-user="bind:setLeisure, leisure_activities"></p></div><div data-user="bind:showInterests, interests"><span class="contentTitle" data-label="bind: innerHTML, interestslbl">Centers of interest</span><p class = "userinfo" data-user="bind: setInterests, interests"></p></div><div data-stats="bind:showSocialNW, socialnw"><span class="contentTitle" data-label="bind: innerHTML, socialnwlbl"></span><p class = "userinfo fb" data-user="bind:showSN, facebook"></p><p class = "userinfo gp" data-user="bind:showSN, gplus; bind:innerHTML"></p><p class = "userinfo tw" data-user="bind:showSN, twitter"></p><p class = "userinfo lin" data-user="bind:showSN, linkedin"></p></div></div><div><legend data-stats="bind: setPercentage, completion"></legend><div class="completionbar"><div class="innerbar" data-stats = "bind:setProgress, completion"></div></div></div></div><div class="edituserdetails invisible"></div><div class="mystats"><legend data-label="bind:innerHTML, mystatslbl"></legend><div class="completionbar"><ul data-user="bind: setBarLength, ip"><li class="innerbar myids" data-progressbar="bind: setWidth, ideas"></li><li class="innerbar myss" data-progressbar="bind:setWidth, sessions"></li><li class="innerbar myctcts" data-progressbar="bind: setWidth, contacts"></li><li class="innerbar my2q" data-progressbar="bind:setWidth, twoQ"></li></ul></div><table><tr class ="myids"><th data-label="bind:innerHTML, ideaslbl"></th><td data-user="bind: innerHTML, ideas_count"></td></tr><tr class ="myss"><th data-label="bind:innerHTML, sessionslbl"></th><td data-user="bind: setSessionCount, ip"></td></tr><tr class="myctcts"><th data-label="bind:innerHTML, contactslbl"></th><td data-user="bind: setContactCount, connections"></td></tr><tr class="my2q"><th data-label="bind:innerHTML, toquestionslbl"></th><td data-user="bind: innerHTML, twoquestions_count"></td></tr></table></div><div class="recentactivity"><legend data-label="bind:innerHTML, recentactivitylbl"></legend><ul data-news="foreach"><li><div class="newstype" data-news="bind:setType, type"></div><div class="newsdate" data-news="bind:formatDate, date"></div><p class="newstext" data-news="bind:setContent, content"></p></li></ul></div></div><div class = "rightprofile"><div class="userscore"><span class="ip" data-user="bind:innerHTML, ip"></span><span data-label="bind:innerHTML, ideafypoints"></span></div><div class="userachievements"><h2 class="grade" data-stats="bind:innerHTML, title"></h2><ul class="badges" data-grades="foreach"><li class="badge"><div data-grades="bind:showBadge, badge"></div><legend data-grades="bind:innerHTML, title"></legend></li></ul><ul class="badges" data-achievements="foreach"><li class="badge"><div data-achievements="bind:showBadge, badge"></div><legend data-achievements="bind:innerHTML, label"></legend></li></ul></div></div></div><div id="leaderboard" data-stats="bind:toggleLeaderboard, view"></div></div>';
                   
                   profileUI.place(Map.get("dashboard-profile"));
                   
                   profileUI.switchLeaderboard = function(event, node){
                        var lb = document.getElementById("leaderboard"), pc = document.getElementById("profile-content");
                        
                       if (node.value == 1){
                                stats.set("view", "leaderboard");
                                if (LB) LB.refresh();
                                else {
                                        LB = new Leaderboard();
                                        LB.init(lb);
                                }
                        }
                        else stats.set("view", "info");
                   };
                   
                   profileUI.edit = function(event, node){
                        var editDOM =  document.querySelector(".edituserdetails");  
                        document.querySelector(".userdetails").classList.add("invisible");
                        if (!EP){
                                EP = new EditProfile();
                                EP.init(editDOM);
                        }
                        else {
                                EP.reset();
                        }
                        editDOM.classList.remove("invisible");
                   };
                   
                   // watch for updates in user profile
                   Config.get("observer").watch("profile-updated", function(change){
                           profileUI.checkProfileCompletion().then(function(){
                                profileUI.updateGrade();
                                profileUI.updateAchievements();       
                        });
                   });
                   
                   // watch for changes in user score
                   user.watchValue("ip", function(){
                        profileUI.updateGrade();
                        profileUI.updateProgressBar();       
                   });
                   
                   user.watchValue("tutorial_complete", function(){
                        // check score and achievements
                        profileUI.updateGrade();
                        profileUI.updateAchievements();       
                   });
                   
                   user.watchValue("settings", function(){
                        // check score and achievements
                        profileUI.updateGrade();
                        profileUI.updateAchievements();       
                   });
                   
                   // monitor user document
                   user.watchValue("news", function(){
                           news.reset(user.get("news"));
                   });
                   
                   // language change
                   user.watchValue("lang", function(){
                        // check score and achievements
                        profileUI.updateGrade()
                        .then(function(){
                                profileUI.updateAchievements();        
                        });
                        // update news
                        news.reset([]);
                        news.reset(user.get("news"));      
                   });
                   
                   profileUI.checkProfileCompletion = function(){
                        var result = Utils.checkProfileCompletion(),
                            promise = new Promise();
                        stats.set("completion", result.percentage);
                        stats.set("missing", result.missing);
                        
                        // check presence of social networks
                        if (result.missing.indexOf(labels.get("entersocialnw")) < 0){
                                stats.set("socialnw", 1);
                        }
                        
                        if (result.percentage === 100 && user.get("profile_complete") !== true) {
                                user.set("profile_complete", true);
                                user.upload().then(function(){
                                        promise.fulfill();
                                });
                        }
                        else {
                                if (result.percentage < 100 && user.get("profile_complete")){
                                // remove profile complete achievement from list if present and badge as well (but the program will store the info that the profile had been completed so that user won't get reward twice)
                                        user.set("profile_complete", false);
                                        user.upload().then(function(){
                                                promise.fulfill();
                                        });
                                }
                                else {
                                        promise.fulfill();
                                }
                        }
                        return promise;
                   };
                   
                   profileUI.updateGrade = function updateGrade(){
                        var promise = new Promise();
                        Utils.getGrade(user.get("ip"), function(result){
                                var array;
                                (result.distinction)?array=[result.grade, result.distinction]:array=[result.grade];
                                grades.reset(array);
                                // update title with grade
                                stats.set("title", result.grade.label);
                                promise.fulfill();
                        });
                        return promise;
                   };
                   
                   profileUI.updateAchievements = function updateAchievements(){
                           var promise = new Promise();
                           Utils.getAchievements(user.get("_id"), function(result){
                                if (result.length) {achievements.reset(result);}
                                else {achievements.reset(user.get("achievements"));}
                                promise.fulfill();       
                           });
                           return promise;
                   };
                   
                   profileUI.updateProgressBar = function updateProgressBar(){
                        var total, ideas, sessions, su, mu, contacts, twoq, i, l;
                        ideas = user.get("ideas_count");          
                        su = user.get("su_sessions_count") || 0;
                        mu = user.get("mu_sessions_count") || 0;
                        sessions = su + mu;
                        twoq = user.get("twoquestions_count") || 0;
                        contacts = 0;
                        for (i=0, l=user.get("connections").length; i<l; i++){
                                if (user.get("connections")[i].type === "user") contacts++;
                        }
                        total = ideas + twoq + contacts + sessions;
                        progressBar.set("total", total);
                        progressBar.set("ideas", Math.floor(ideas/total*100));
                        progressBar.set("contacts", Math.floor(contacts/total*100));
                        progressBar.set("sessions", Math.floor(sessions/total*100));
                        progressBar.set("twoQ", Math.floor(twoq/total*100));   
                   };
                   
                   profileUI.cleanOldNews = function cleanOldNew(){
                        var now = new Date(), n = user.get("news"), l = n.length, i, then,
                            promise = new Promise();
                        if (l){
                                for (i = l-1; i>=0; i--){
                                        then = new Date(n[i].date[0],n[i].date[1],n[i].date[2]);
                                        if (now.getTime()-then.getTime() > 1296000000){
                                                n.splice(i, 1);
                                        }       
                                }
                                if (n.length !== l) {
                                        user.set("news", n);
                                        user.upload().then(function(){
                                                promise.fulfill();
                                        });
                                }
                                else promise.fulfill();
                        }
                        return promise;
                   };
                   
                   //init
                   profileUI.init = function init(){
                        profileUI.checkProfileCompletion()
                        .then(function(){
                                return profileUI.updateGrade();
                        })
                        .then(function(){
                                return profileUI.updateAchievements();        
                        })
                        .then(function(){
                                profileUI.updateProgressBar();
                                profileUI.cleanOldNews();        
                        });
                   };
                   
                   profileUI.reset = function reset(){
                        news.reset([]);
                        news.reset(user.get("news"));
                        profileUI.init();        
                   };
                   
                   profileUI.init();
                   return profileUI;
           };    
        });