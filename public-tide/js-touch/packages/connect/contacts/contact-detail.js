/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/config", "service/map", "Store", "Bind.plugin", "Event.plugin", "service/avatar", "service/utils"],
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
                                           this.setAttribute("style", "background: url('img/profile/"+badge+"') no-repeat center center; background-size: cover;");
                                   }
                                }),
                                "achievements" : new Model(achievements, {
                                        showBadge : function(badge){
                                           this.setAttribute("style", "background: url('img/profile/"+badge+"') no-repeat center center; background-size: cover;");
                                   }
                                }),
                                "ctdetailsevent" : new Event(contactDetails)        
                        });
                        
                        contactDetails.template = '<div id = "contactdetails"><div class="header blue-dark"><span class="subjectlbl" data-details="bind:innerHTML, username"></span></div><div class = "detail-contents"><div class = "contactessentials"><div class="avatar" data-basicinfo="bind:setAvatar, userid"></div><div class="basicinfo"><h2 data-basicinfo="bind:innerHTML,username"></h2><p data-basicinfo="bind:innerHTML, intro"></p></div><div class="contactdashboard"><div class="contactstats"><legend data-label="bind:innerHTML, stats"></legend><div class="userscore"><span class="ip" data-ctdetails="bind:innerHTML, ip"></span><span data-label="bind:innerHTML, ideafypoints"></span></div><table><tr class ="myids"><th data-label="bind:innerHTML, ideaslbl"></th><td data-ctdetails="bind: innerHTML, ideas_count"></td></tr><tr class ="myss"><th data-label="bind:innerHTML, sessionslbl"></th><td data-ctdetails="bind: innerHTML, sessions"></td></tr><tr class="myctcts"><th data-label="bind:innerHTML, contactslbl"></th><td data-ctdetails="bind: innerHTML, contacts"></td></tr><tr class="my2q"><th data-label="bind:innerHTML, toquestionslbl"></th><td data-ctdetails="bind: innerHTML, twoquestions_count"></td></tr></table></div><div class="contactbadges"><legend data-label="bind:innerHTML, achievements"></legend><p class="grade" data-stats="bind:innerHTML, title"></p><ul class="badges" data-grades="foreach"><li class="contactbadge"><div data-grades="bind:showBadge, badge"></div><label data-grades="bind:innerHTML, title"></label></li></ul><ul class="badges" data-achievements="foreach"><li class="contactbadge"><div data-achievements="bind:showBadge, badge"></div><label data-achievements="bind:innerHTML, label"></label></li></ul></div></div></div></div><div class = "contactnotes"><legend data-label="bind: innerHTML, mynotes"></legend><div id = "cancelnotes" class="invisible" data-ctdetailsevent="listen:touchstart, push; listen:touchend, cancelNotes"></div><div id = "uploadnotes" class="invisible" data-ctdetailsevent="listen:touchstart, push;listen:touchend, uploadNotes"></div><textarea id="ctnotes" class = "input" data-label="bind:placeholder,writesomething" data-basicinfo="bind: value, notes" data-ctdetailsevent="listen:input, displayNoteBtns"></textarea></div></div></div>';
                        
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
                                       // update contact if some information has changed
                                       if (result.username !== contact.get("username") || result.firstname !== contact.get("firstname") || result.lastname !== contact.get("lastname") || result.intro !== contact.get("intro")){
                                               contactDetails.updateContact(result);
                                       }
                                       
                                        details.reset(result);
                                        // add sessions
                                        details.set("sessions", details.get("su_sessions_count")+details.get("mu_sessions_count"));
                                        // get grades
                                        Utils.getGrade(result.ip, function(res){
                                                grades.alter("push", res.grade);
                                                if (res.distinction) grades.alter("push", res.distinction);  
                                        });
                                        // get achievements
                                        achievements.reset(result.achievements);     
                               });
                       };
                       
                       contactDetails.reset = function reset(contactinfo){
                                contact.reset(contactinfo);
                                grades.reset([]);
                                achievements.reset([]);
                                // if there are no notes for this contact init with empty string
                                if (!contact.get("notes")) contact.set("notes", "");
                                contactDetails.getUserInfo(contactinfo.userid);       
                       };
                       
                       contactDetails.displayNoteBtns = function(event,node){
                                document.getElementById("uploadnotes").classList.remove("invisible");
                                document.getElementById("cancelnotes").classList.remove("invisible");     
                       };
                       
                       contactDetails.hideNoteBtns = function hideNoteBtns(event,node){
                                document.getElementById("uploadnotes").classList.add("invisible");
                                document.getElementById("cancelnotes").classList.add("invisible");     
                       };
                       
                       contactDetails.push = function(event, node){
                                node.classList.add("pushed");      
                       };
                       
                       contactDetails.uploadNotes = function(event, node){
                                var contacts = user.get("connections"), i, l=contacts.length, g, j,
                                    upload = document.getElementById("uploadnotes"),
                                    cancel = document.getElementById("cancelnotes");
                                
                                for (i=0; i<l; i++){
                                       if (contacts[i].userid === contact.get("userid")){
                                               contacts[i].notes = contact.get("notes");
                                       }
                                       // also update contact info in groups
                                       if (contacts[i].type === "group"){
                                                g = contacts[i].contacts;
                                                for (j=0; j<g.length; j++){
                                                        if (g[j].userid === contact.get("userid")){
                                                                g[j].notes = contact.get("notes");       
                                                        }
                                                }
                                                contacts[i].contacts = g;       
                                       }
                                }
                                user.set("connections", contacts);
                                user.upload().then(function(){
                                        node.classList.remove("pushed");
                                        contactDetails.hideNoteBtns();      
                                });        
                       };
                       
                       contactDetails.cancelNotes = function(event, node){
                                // reload notes from user connections
                                var contacts = user.get("connections"), l=contacts.length; i;
                                for (i=0; i<l;i++){
                                        if (contacts[i].userid === contact.get("userid")) contact.set("notes", contacts[i].notes)
                                }
                                node.classList.add("pushed");
                                contactDetails.hideNoteBtns();     
                       };
                       
                       return contactDetails; 
                };
        });
