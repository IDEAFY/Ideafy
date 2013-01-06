define("Ideafy/Connect/ContactDetails", ["Olives/OObject", "Config", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Ideafy/Avatar", "Ideafy/Utils"],
        function (Widget, Config, Map, Store, Model, Event, Avatar, Utils){
                
                return function ContactDetailsConstructor(){
        
                        var contactDetails = new Widget(),
                            details = new Store(),
                            contact = new Store(),
                            grades = new Store([]),
                            achievements = new Store([]),
                            labels = Config.get("labels"),
                            user = Config.get("user"),
                            transport = Config.get("transport");               
                        
                        
                        contactDetails.plugins.addAll({
                                "label" : new Model(labels),
                                "basicinfo": new Model(contact, {
                                        setAvatar : function(userid){
                                                var _frag = document.createDocumentFragment(),
                                                    _ui = new Avatar([userid]);
                                                _ui.place(_frag);
                                                (!this.hasChildNodes())?this.appendChild(_frag):this.replaceChild(_frag, this.firstChild);
                                        }
                                }),
                                "ctdetails" : new Model(details),
                                "grades" : new Model(grades, {
                                        showBadge : function(badge){
                                           this.setAttribute("style", "background: url('../img/profile/"+badge+"') no-repeat center center; background-size: cover;");
                                   }
                                }),
                                "achievements" : new Model(achievements, {
                                        showBadge : function(badge){
                                           this.setAttribute("style", "background: url('../img/profile/"+badge+"') no-repeat center center; background-size: cover;");
                                   }
                                }),
                                "ctdetailsevent" : new Event(contactDetails)        
                        });
                        
                        contactDetails.template = '<div id = "contactdetails"><div class="header blue-dark"><span class="subjectlbl" data-details="bind:innerHTML, username"></span></div><div class = "detail-contents"><div class = "contactessentials"><div class="avatar" data-basicinfo="bind:setAvatar, userid"></div><div class="basicinfo"><h2 data-basicinfo="bind:innerHTML,username"></h2><p data-basicinfo="bind:innerHTML, intro"></p></div><div class="contactdashboard"><div class="contactstats"><legend data-label="bind:innerHTML, stats"></legend><div class="userscore"><span class="ip" data-ctdetails="bind:innerHTML, ip"></span><span data-label="bind:innerHTML, ideafypoints"></span></div><table><tr class ="myids"><th data-label="bind:innerHTML, ideaslbl"></th><td data-ctdetails="bind: innerHTML, ideas_count"></td></tr><tr class ="myss"><th data-label="bind:innerHTML, sessionslbl"></th><td data-ctdetails="bind: innerHTML, sessions"></td></tr><tr class="myctcts"><th data-label="bind:innerHTML, contactslbl"></th><td data-ctdetails="bind: innerHTML, contacts"></td></tr><tr class="my2q"><th data-label="bind:innerHTML, toquestionslbl"></th><td data-ctdetails="bind: innerHTML, twoquestions_count"></td></tr></table></div><div class="contactbadges"><legend data-label="bind:innerHTML, achievements"></legend><p class="grade" data-stats="bind:innerHTML, title"></p><ul class="badges" data-grades="foreach"><li class="badge" data-grades="bind:showBadge, badge"><label data-grades="bind:innerHTML, title"></label></li></ul><ul class="badges" data-achievements="foreach"><li class="badge"><div data-achievements="bind:showBadge, badge"></div><label data-achievements="bind:innerHTML, label"></label></li></ul></div></div></div></div><div class = "contactnotes"><legend data-label="bind: innerHTML, mynotes"></legend><div class="editnotes"></div><textarea class = "input" data-label="bind:placeholder,writesomething" data-basicinfo="bind: value, notes"></textarea></div></div></div>';
                        
                       contactDetails.place(Map.get("contactdetails"));
                       
                       
                       contactDetails.updateContact = function updateContact(contact){
                                var contacts = user.get("connections"), i, l=contacts.length, g, j;
                                
                               for (i=0; i<l; i++){
                                       if (contacts[i].userid === contact._id){
                                               contacts[i].username = contact.username;
                                               contacts[i].firstname = contact.firstname;
                                               contacts[i].lastname = contact.lastname;
                                               contacts[i].intro = contact.intro;
                                       }
                                       // also update contact info in groups
                                       if (contacts[i].type === "group"){
                                                g = contacts[i].contacts;
                                                for (j=0; j<g.length; j++){
                                                        if (g[j].userid === contact._id){
                                                                g[j].username = contact.username;
                                                                g[j].firstname = contact.firstname;
                                                                g[j].lastname = contact.lastname;
                                                                g[j].intro = contact.intro;        
                                                        }
                                                }
                                                contacts[i].contacts = g;       
                                       }
                               }
                               user.set("connections", contacts);
                               user.upload();
                       };
                       
                       contactDetails.getUserInfo = function getUserInfo(id){
                               // get visible User Information from server
                               Utils.getUserDetails(id, function(result){
                                       console.log(result);
                                       // update contact if some information has changed
                                       if (result.username !== contact.get("username") || result.firstname !== contact.get("firstname") || result.lastname !== contact.get("lastname") || result.intro !== contact.get("intro")){
                                               contactDetails.updateContact(result);
                                       }
                                       
                                        details.reset(result);
                                        // add sessions
                                        details.set("sessions", details.get("su_sessions_count")+details.get("mu_sessions_count"));
                                        // get grades
                                        Utils.getGrade(result.ip, function(res){
                                                console.log("grades : ", res);
                                                grades.alter("push", res.grade);
                                                if (res.distinction) grades.alter("push", res.distinction);  
                                        });
                                        // get achievements
                                        achievements.reset(result.achievements);     
                               });
                       };
                       
                       contactDetails.reset = function reset(contactinfo){
                                console.log(contactinfo);
                                contact.reset(contactinfo);
                                // if there are no notes for this contact init with empty string
                                if (!contact.get("notes")) contact.set("notes", "");
                                contactDetails.getUserInfo(contactinfo.userid);        
                       };
                       
                       return contactDetails; 
                };
        });
