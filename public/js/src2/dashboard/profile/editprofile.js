define("Ideafy/Dashboard/EditProfile", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Ideafy/Avatar", "Ideafy/Utils"],
        function(Widget, Config, Model, Event, Avatar, Utils){
                
           return new function EditProfileConstructor(){
                   
                var editProfile = new Widget(),
                    profile = Config.get("user"),
                    labels = Config.get("labels");
                    
                editProfile.plugins.addAll({
                        "label" : new Model(labels),
                        "profile" : new Model(profile, {
                                setAvatar : function(picture_file){
                                                // make sure the picture_file field of user doc is set after successful upload of file
                                                this.setAttribute("style", "background: url('"+ Config.get("avatar") + "') no-repeat center center;background-size:cover;");
                                },
                                setDay : function(birthdate){
                                        if (birthdate[2]) this.value = birthdate[2];
                                },
                                setMonth : function(birthdate){
                                        var month = birthdate[1] || 0;
                                        this.value = this.options[month].innerHTML;        
                                },
                                setYear : function(birthdate){
                                        if (birthdate[0]) this.value = birthdate[0];
                                },
                                setStatus : function(couple){
                                        if (couple || couple === 0){
                                                this.value = this.options[couple].innerHTML;
                                        }
                                },
                                setChildren : function(children){
                                        if (children || children === 0){
                                                this.value = this.options[children].innerHTML;
                                        }
                                },
                                setLeisureName : function(leisure){
                                        var node = this, name = node.getAttribute("name");
                                        [0,1,2].forEach(function(i){
                                                if (leisure[i] && name.search(i)>0) node.value = leisure[i].name;
                                        });       
                                },
                                setLeisureDesc : function(leisure){
                                        var node = this, name = node.getAttribute("name");
                                        [0,1,2].forEach(function(i){
                                                if (leisure[i] && name.search(i)>0) node.value = leisure[i].comment;
                                        });        
                                },
                                setInterestName : function(interests){
                                        var node = this, name = node.getAttribute("name");
                                        [0,1,2].forEach(function(i){
                                                if (interests[i] && name.search(i)>0) node.value = interests[i].name;
                                        });       
                                },
                                setInterestDesc : function(interests){
                                        var node = this, name = node.getAttribute("name");
                                        [0,1,2].forEach(function(i){
                                                if (interests[i] && name.search(i)>0) node.value = interests[i].comment;
                                        });        
                                }
                        }),
                        "editprofileevent" : new Event(editProfile)
                });
                
                editProfile.template = '<div><div class = "setavatar"><div class="currentavatar" data-profile="bind:setAvatar, picture_file"></div></div><form class="profileinfo"><div class = "username"><div class = "firstname"><label>First name</label><input class="input" type="text" data-profile="bind: value, firstname"></div><div class = "lastname"><label>Last name</label><input class="input" type="text" data-profile="bind: value, lastname"></div></div><label>Profile introduction</label><input class="input" type="text" data-profile="bind:value, intro" placeholder="short profile description"><label>Date of birth</label><div class="dob"><input class="day" type="text" placeholder="day" data-profile="bind: setDay, birthdate"><select data-profile="bind: setMonth, birthdate"><option>January</option><option>February</option><option>March</option><option>April</option><option>May</option><option>June</option><option>July</option><option>August</option><option>September</option><option>October</option><option>November</option><option>December</option></select><input class="year" type="text" placeholder="year" data-profile="bind: setYear, birthdate"></div><div class="postal"><label class="streetaddress">Mail address</label><input class="streetaddress input" type="text" placeholder="Street" data-profile="bind:value, address.street1"><div class="city"><label>City</label><input class="input city" type="text" data-profile="bind:value, address.city"></div><div class="zipstate"><div class="state"><label>State</label><input class="input" type="text" data-profile="bind:value, address.state"></div><div class="zip"><label>ZIP</label><input class="input" type="text" data-profile="bind:value, address.zip"></div></div><label>Country</label><input class="input" type="text" data-profile="bind:value, address.country"></div><label>My Family</label><div class="family"><select class="status" data-profile="bind: setStatus, family.couple"><option>Single</option><option>Married</option><option>Divorced</option><option>Widow</option><option>In a relationship</option></select><select class="children" data-profile="bind: setChildren, family.children"><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8+</option></select><label>Children</label></div><label>My Occupation</label><div class="job"><select class="status" data-profile="bind: setSituation, occupation.situation"><option>Student</option><option>Active</option><option>Retired</option><option>Unemployed</option><option>Stay at home parent</option></select><div class="jobdesc"><label>Job title</label><input class="input" type="text" data-profile="bind:value, occupation.job" placeholder="Job title"></div><div class="org"><label>Organization</label><input class="input" type="text" data-profile="bind:value, occupation.organization" placeholder="Organization"></div></div></form><form class="addtlinfo"><legend>Leisure activities</legend><input name="leisure0" class="input" type="text" placeholder="Leisure name" data-profile="bind: setLeisureName, leisure_activities"><input class="input description" name="leisure0" type="text" placeholder="Description" data-profile="bind: setLeisureDesc, leisure_activities"><input name="leisure1" class="input" type="text" placeholder="Leisure name" data-profile="bind: setLeisureName, leisure_activities"><input class="input description" name="leisure1" type="text" placeholder="Description" data-profile="bind: setLeisureDesc, leisure_activities"><input class="input" name="leisure2" type="text" placeholder="Leisure name" data-profile="bind: setLeisureName, leisure_activities"><input class="input description" name="leisure2" type="text" placeholder="Description" data-profile="bind: setLeisureDesc, leisure_activities"><legend>Centers of interest</legend><input class="input" name="interest0" type="text" placeholder="Name" data-profile="bind: setInterestName, interests"><input class="input description" name="interest0" type="text" placeholder="Description" data-profile="bind: setInterestDesc, interests"><input class="input" name="interest1" type="text" placeholder="Name" data-profile="bind: setInterestName, interests"><input class="input description" name="interest1" type="text" placeholder="Description" data-profile="bind: setInterestDesc, interests"><input class="input" name="interest2" type="text" placeholder="Name" data-profile="bind: setInterestName, interests"><input class="input description" name="interest2" type="text" placeholder="Description" data-profile="bind: setInterestDesc, interests"></form><div class="useascharacter"></div></div>';
                
                editProfile.init = function init($dom){
                        editProfile.place($dom);
                };
                
                return editProfile;
                   
           };
        });
