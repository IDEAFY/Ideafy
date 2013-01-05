define("Ideafy/Connect/ContactDetails", ["Olives/OObject", "Config", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Ideafy/Avatar", "Ideafy/Utils"],
        function (Widget, Config, Map, Store, Model, Event, Avatar, Utils){
                
                return function ContactDetailsConstructor(){
        
                        var contactDetails = new Widget(),
                            details = new Store({}),
                            contact = new Store(),
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
                                "ctdetailsevent" : new Event(contactDetails)        
                        });
                        
                        contactDetails.template = '<div id = "contactdetails"><div class="header blue-dark"><span class="subjectlbl" data-details="bind:innerHTML, username"></span></div><div class = "detail-contents"><div class = "contactessentials"><div class="avatar" data-basicinfo="bind:setAvatar, userid"></div><div class="basicinfo"><h2 data-basicinfo="bind:innerHTML,username"></h2><p data-basicinfo="bind:innerHTML, intro"></p></div><div class="contactdashboard"><div class="contactstats"><legend data-label="bind:innerHTML, stats"></legend><div class="userscore"><span class="ip" data-user="bind:innerHTML, ip"></span><span> Ideafy Points</span></div><table><tr class ="myids"><th data-label="bind:innerHTML, ideaslbl"></th><td data-user="bind: innerHTML, ideas_count"></td></tr><tr class ="myss"><th data-label="bind:innerHTML, sessionslbl"></th><td data-user="bind: setSessionCount, ip"></td></tr><tr class="myctcts"><th data-label="bind:innerHTML, contactslbl"></th><td data-user="bind: setContactCount, connections"></td></tr><tr class="my2q"><th data-label="bind:innerHTML, toquestionslbl"></th><td data-user="bind: innerHTML, twoquestions_count"></td></tr></table></div><div class="contactbadges"><legend data-label="bind:innerHTML, achievements"></legend><p class="grade" data-stats="bind:innerHTML, title"></p><ul class="badges" data-achievements="foreach"><li class="badge"><div data-achievements="bind:showBadge, badge"></div><label data-achievements="bind:innerHTML, label"></label></li></ul></div></div></div></div><div class = "contactnotes"><legend data-label="bind: innerHTML, mynotes"></legend><div class="editnotes"></div><textarea class = "input" data-label="bind:placeholder,writesomething"></textarea></div></div></div>';
                        
                       contactDetails.place(Map.get("contactdetails"));
                       
                       contactDetails.getUserInfo = function getUserInfo(id){
                               // get visible User Information from server
                               Utils.getUserDetails(id, function(result){
                                        details.reset(result);        
                               });
                       };
                       
                       contactDetails.reset = function reset(contactinfo){
                                console.log(contactinfo);
                                contact.reset(contactinfo);
                                contactDetails.getUserInfo(contactinfo.userid);        
                       };
                       
                       return contactDetails; 
                };
        });
