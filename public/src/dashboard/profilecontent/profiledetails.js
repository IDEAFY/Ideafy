define ("ProfileDetails", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Utils", "Stack", "UserInfo", "UserJob", "UserHobbies", "UserInterests"],
        function(OObject, Map, Config, ModelPlugin, EventPlugin, Store, Utils, Stack, UserInfo, UserJob, UserHobbies, UserInterests){
                
                return function ProfileDetailsConstructor(dObserver){
                        
                        var profileDetails = new OObject(),
                            avatar = new Store({"image": "images/userpics/deedee0.png", "filename": ""}),
                            defaultAvatars = new Store([
                                    {"name": "azur", "file": "images/userpics/deedee0.png"},
                                    {"name": "blue", "file": "images/userpics/deedee1.png"},
                                    {"name": "green", "file": "images/userpics/deedee2.png"},
                                    {"name": "grey", "file": "images/userpics/deedee3.png"},
                                    {"name": "orange", "file": "images/userpics/deedee4.png"},
                                    {"name": "red", "file": "images/userpics/deedee5.png"},
                                    {"name": "yellow", "file": "images/userpics/deedee6.png"}
                            ]),
                            profileTabs = new Store([
                                    {"label": "My information", "button": "userinfo", "selected": true},
                                    {"label": "My job", "button": "userjob", "selected": false},
                                    {"label": "My hobbies", "button": "userhobbies", "selected": false},
                                    {"label": "My interests", "button": "userinterests", "selected": false}
                            ]),
                            user = Config.get("user"),
                            innerProfileStack = new Stack(Map.get("innerprofilestack"));
                        
                        profileDetails.plugins.addAll({
                                "userdetails": new ModelPlugin(user,{
                                        setRank : function(ip){
                                                var rank;
                                                if (ip){
                                                        rank = Utils.getRank(ip);
                                                        this.innerHTML = rank.title;
                                                }
                                        }
                                }),
                                "avatars": new ModelPlugin(defaultAvatars),
                                "avatar": new ModelPlugin(avatar, {
                                        setStyle : function(image){
                                                if (image){
                                                this.setAttribute("style", "background-image:url("+image+");");
                                                }
                                        }
                                }),
                                "profiletabs" : new ModelPlugin(profileTabs, {
                                        setSelected : function(selected){
                                                if (selected){
                                                        this.setAttribute("style", "color:white; background:#292929;")
                                                }
                                                else {
                                                        this.setAttribute("style", "color:#292929; background:white;")
                                                }
                                        }
                                }),
                                "editprofileevent": new EventPlugin(profileDetails)
                        });
                        
                        profileDetails.checkEmpty = function(event, node){
                                if (node.files !== []) {
                                        profileDetails.uploadAvatar('change', node);
                                }
                        };
                        
                        profileDetails.selectAvatar = function(event,node){
                                var id = node.getAttribute("data-avatars_id");
                                
                                // hide upload progress if present
                                document.getElementById("uploadprogress").classList.add("invisible");
                                
                                avatar.set("image", defaultAvatars.get(id).file);
                                // change avatar in local store
                                Config.get("avatars").set(user.get("_id"), defaultAvatars.get(id).file);
                                // upload value in database
                                user.set("picture_file", defaultAvatars.get(id).file);
                                user.upload();    
                        };
                        
                        profileDetails.switchTab = function(event, node){
                                
                                profileTabs.loop(function(v, i){
                                        profileTabs.update(i, "selected", false);        
                                });
                                
                                profileTabs.update(node.getAttribute("data-profiletabs_id"), "selected", true);
                                
                                console.log(node.getAttribute("name"));
                                
                                innerProfileStack.show(node.getAttribute("name"));
                        };
                        
                        profileDetails.uploadAvatar = function(event,node){
                                var file = node.files[0],
                                    progressUI = document.getElementById("uploadprogress");
                                
                                progressUI.classList.remove("invisible");
                                
                                Utils.uploadFile('/upload', file, progressUI);
                        };
                        
                       
                        // watch for avatar file changes
                        user.watchValue("picture_file", function(){
                                Utils.getAvatar(user.get("_id"), user.get("picture_file"));     
                        });
                       
                        // get avatar changes
                        Config.get("observer").watch("avatar-loaded", function(uid){
                                if (uid === Config.get("user").get("_id")){
                                      avatar.set("image", Config.get("avatars").get(uid));
                                }
                        });
                        
                        //initialize
                        dObserver.watch("login-completed", function(){
                                
                                // initialize innerStack
                                innerProfileStack.addAll({
                                        "userinfo": UserInfo(),
                                        "userjob": UserJob(),
                                        "userhobbies": UserHobbies(),
                                        "userinterests": UserInterests()
                                });
                                
                                innerProfileStack.show("userinfo");
                                
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
                        
                        profileDetails.alive(Map.get("profiledetails"));
                        
                        return profileDetails;             
                        
                };
                
        });
