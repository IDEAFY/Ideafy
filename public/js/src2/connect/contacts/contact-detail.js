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
                        
                        contactDetails.template = '<div id = "contactdetails"><div class="header blue-dark"><span class="subjectlbl" data-details="bind:innerHTML, username"></span></div><div class = "detail-contents"><div class = "contactessentials"><div class="avatar" data-basicinfo="bind:setAvatar, userid"></div><div class="basicinfo"><h2 data-basicinfo="bind:innerHTML,username"></h2><p data-basicinfo="bind:innerHTML, intro"></p></div><div class="contactdashboard"><div class="contactstats"></div><div class="contactbadges"></div></div></div></div><div class = "contactnotes"><legend data-label="bind: innerHTML, mynotes"></legend><div class="editnotes"></div><textarea class = "input mynotes" data-label="bind:placeholder,writesomething"></textarea></div></div></div>';
                        
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
