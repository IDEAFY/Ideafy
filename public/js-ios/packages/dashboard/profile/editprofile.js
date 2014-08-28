/*
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

var olives = require("../../../libs/olives"),
      emily = require("../../../libs/emily"),
      Widget = olives.OObject,
      Config = require("../../../services/config"),
      Model = olives["Bind.plugin"],
      Event = olives["Event.plugin"],
      Avatar = require("../../../services/avatar"),
      Utils = require("../../../services/utils"),
      Store = emily.Store,
      Spinner = require("../../../libs/spin.min"),
      LocalStore = olives.LocalStore;

module.exports = function EditProfileConstructor(){
                   
                var editProfile = new Widget(),
                    user = Config.get("user"),
                    profile = new Store(),
                    avatarList = [
                                    {"name": "azur", "file": "img/avatars/deedee0.png", "selected": false},
                                    {"name": "blue", "file": "img/avatars/deedee1.png", "selected": false},
                                    {"name": "green", "file": "img/avatars/deedee2.png", "selected": false},
                                    {"name": "grey", "file": "img/avatars/deedee3.png", "selected": false},
                                    {"name": "orange", "file": "img/avatars/deedee4.png", "selected": false},
                                    {"name": "red", "file": "img/avatars/deedee5.png", "selected": false},
                                    {"name": "yellow", "file": "img/avatars/deedee6.png", "selected": false}
                            ],
                    defaultAvatars = new Store(avatarList),
                    updates = {},
                    progress = new Store({"status": null}),
                    labels = Config.get("labels"),
                    spinner = new Spinner({color:"#8cab68", lines:10, length: 8, width: 4, radius:8, top: -8, left: 360}).spin(),
                    MIN_WIDTH = 80, MIN_HEIGHT = 80,
                    clearCanvas = function(canvas){
                            var ctx = canvas.getContext("2d");
                            ctx.clearRect(0,0,canvas.width, canvas.height);
                    },
                    resizeImage = function(img){
                            var _width, _height, canvas = document.createElement('canvas'), ctx = canvas.getContext("2d");
                                
                            // resize image if needed
                            _width = img.width;
                            _height = img.height;
                            if (_width<_height){
                                _height *= MIN_WIDTH / _width;
                                _width = MIN_WIDTH;
                                
                            }
                            else {
                                _width *= MIN_HEIGHT / _height;
                                _height = MIN_HEIGHT;
                            }
                            
                            canvas.width = _width;
                            canvas.height = _height;
                            ctx.drawImage(img, 0, 0, _width, _height);
                            return canvas.toDataURL("image/png");
                    },
                    cropImage = function(dataURL){
                        var image = new Image(),
                            canvas = document.createElement('canvas'),
                            dest  = document.getElementById("avatarcanvas"),
                            ctx = canvas.getContext('2d'),
                            dw = dest.scrollWidth,
                            dh = dest.scrollHeight,
                            sx, sy;
                        image.src = dataURL;
                        setTimeout(function(){
                                canvas.width = dw;
                                canvas.height = dh;
                                sx = Math.floor(Math.max(0, (image.width-dw)/2));
                                sy = Math.floor(Math.max(0, (image.height-dh)/2));
                                ctx.drawImage(image, sx, sy, dw, dh, 0, 0, dw, dh);
                                profile.set("avatar", canvas.toDataURL("image/png"));
                        }, 300);
                    },
                    uploadAvatar = function(canvas){
                        var url = '/upload', fd = new FormData();
                        fd.append("type", 'avatar');
                        fd.append("filename", updates.picture_file);
                        fd.append("img", profile.get("avatar"));
                        Utils.uploadFile(url, fd, progress, function(result){
                                if (result.response !== "ok") {console.log(result);}
                        });         
                    };
                    
                editProfile.seam.addAll({
                        "label" : new Model(labels),
                        "avatars": new Model(defaultAvatars, {
                                setPic : function(file){
                                        this.setAttribute("style", "background-image: url('"+file+"');background-repeat: no-repeat; background-position: center center; background-size: cover;");
                                },
                                setChecked : function(checked){
                                        (checked) ? this.innerHTML="&#10003;":this.innerHTML="";
                                }
                        }),
                        "progress": new Model(progress,{
                                 "showProgress" : function(status){
                                         var width = 0;
                                        if (status) {
                                                width = Math.floor(status/100*80);
                                        }
                                        this.setAttribute("style", "width:"+ width+ "px;");
                                        if (status === 100){
                                                this.innerHTML = labels.get("uploadcomplete");
                                        }
                                        else this.innerHTML = "";
                                }        
                        }),
                        "profile" : new Model(profile, {
                                setAvatar : function(avatar){
                                                // make sure the picture_file field of user doc && Config.get("avatar") is set after successful upload of file
                                                this.setAttribute("style", "background-image: url('"+avatar+"');background-repeat: no-repeat; background-position: center center; background-size: cover;");
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
                                setFamilyStatus : function(couple){
                                        if (couple || couple === 0){
                                                this.selectedIndex = couple;
                                        }
                                },
                                setChildren : function(children){
                                        if (children || children === 0){
                                                this.selectedIndex = children;
                                        }
                                },
                                setSituation : function(situation){
                                        if (situation || situation === 0){
                                                this.selectedIndex = situation;
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
                
                editProfile.template = '<div><div class = "setavatar"><canvas id ="avatarcanvas" class="currentavatar" data-profile="bind:setAvatar, avatar" data-editprofileevent="listen:touchstart, changeAvatar"></canvas><div id="rotate" class="invisible" data-editprofileevent="listen:touchstart, rotateAvatar"></div><div id="changeavatar" class="invisible"><div class="avatarcache"></div><div class="importbutton" data-editprofileevent="listen: touchstart, selectpress; listen:touchend, picturePreview" data-label="bind:innerHTML, importpiclbl"></div><div class="importbutton" data-editprofileevent="listen: touchstart, selectpress; listen:touchend, cameraPreview" data-label="bind:innerHTML, importcameralbl"></div><p data-label="bind:innerHTML, selectavatar"></p><ul class="defaultlist" data-avatars="foreach"><li><div class="defaultAvatar" data-avatars="bind: setPic, file"></div><div class="checkbox" data-avatars="bind: setChecked, selected" data-editprofileevent="listen: touchend, setDefaultAvatar"></div></li></ul></div></div><form class="profileinfo"><div class = "username"><div class = "firstname"><label data-label="bind:innerHTML, firstnameplaceholder"></label><input class="input" name="firstname" type="text" data-profile="bind: value, firstname" data-editprofileevent="listen: input, updateField"></div><div class = "lastname"><label data-label="bind:innerHTML, lastnameplaceholder"></label><input class="input" type="text" name="lastname" data-profile="bind: value, lastname" data-editprofileevent="listen: input, updateField"></div></div><label data-label="bind:innerHTML, profileintro"></label><input class="input" name="intro" type="text" data-profile="bind:value, intro" data-label="bind:placeholder, shortprofiledesc" data-editprofileevent="listen: input, updateField"><label data-label="bind:innerHTML, dob"></label><div class="dob"><input class="day" name="day" type="text" data-label="bind:placeholder, day" data-profile="bind: setDay, birthdate" data-editprofileevent="listen:input, updateDate"><select name="month" data-profile="bind: setMonth, birthdate" data-editprofileevent="listen:change, updateDate"><option data-label="bind:innerHTML, jan"></option><option data-label="bind:innerHTML, feb"></option><option data-label="bind:innerHTML, mar"></option><option data-label="bind:innerHTML, apr"></option><option data-label="bind:innerHTML, may"></option><option data-label="bind:innerHTML, jun"></option><option data-label="bind:innerHTML, jul"></option><option data-label="bind:innerHTML, aug"></option><option data-label="bind:innerHTML, sep"></option><option data-label="bind:innerHTML, oct"></option><option data-label="bind:innerHTML, nov"></option><option data-label="bind:innerHTML, dec"></option></select><input class="year" name="year" type="text" data-label="bind:placeholder,year" data-profile="bind: setYear, birthdate" data-editprofileevent="listen:input, updateDate"></div><div class="postal"><label class="streetaddress" data-label="bind:innerHTML, mailaddress"></label><input class="streetaddress input" name="street1" type="text" data-label="bind:placeholder, street" data-profile="bind:value, address.street1" data-editprofileevent="listen:input, updateAddress"><div class="city"><label data-label="bind:innerHTML, city"></label><input class="input city" name="city" type="text" data-profile="bind:value, address.city" data-editprofileevent="listen:input, updateAddress"></div><div class="zipstate"><div class="state"><label data-label="bind:innerHTML, state"></label><input class="input" name="state" placeholder="" type="text" data-profile="bind:value, address.state" data-editprofileevent="listen:input, updateAddress"></div><div class="zip"><label data-label="bind:innerHTML, zip"></label><input class="input" name="zip" placeholder="" type="text" data-profile="bind:value, address.zip" data-editprofileevent="listen:input, updateAddress"></div></div><label data-label="bind:innerHTML, country"></label><input class="input" name="country" type="text" data-profile="bind:value, address.country" data-editprofileevent="listen:input, updateAddress"></div><label data-label="bind:innerHTML, myfamily"></label><div class="family"><select class="status" name="couple" data-profile="bind: setFamilyStatus, family.couple" data-editprofileevent="listen:change, updateFamily"><option data-label="bind:innerHTML, single"></option><option data-label="bind:innerHTML, married"></option><option data-label="bind:innerHTML, divorced"></option><option data-label="bind:innerHTML, widow"></option><option data-label="bind:innerHTML, relation"></option></select><select class="children" name="children" data-profile="bind: setChildren, family.children" data-editprofileevent="listen:change, updateFamily"><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8+</option></select><label data-label="bind:innerHTML, children"></label></div><label data-label="bind:innerHTML, myoccupation"></label><div class="job"><select class="status" name="situation" data-profile="bind: setSituation, occupation.situation" data-editprofileevent="listen:change, updateJob"><option data-label="bind:innerHTML, student"></option><option data-label="bind:innerHTML, active"></option><option data-label="bind:innerHTML, retired"></option><option data-label="bind:innerHTML, unemployed"></option><option data-label="bind:innerHTML, stayathome"></option></select><div class="jobdesc"><label data-label="bind:innerHTML, jobtitle"></label><input class="input" type="text" name="job" data-profile="bind:value, occupation.job" data-label="bind:placeholder, jobtitle" data-editprofileevent="listen:input, updateJob"></div><div class="org"><label data-label="bind:innerHTML, organization"></label><input class="input" name="organization" type="text" data-profile="bind:value, occupation.organization" data-label="bind:placeholder,organization" data-editprofileevent="listen:input, updateJob"></div></div></form><form class="addtlinfo"><legend data-label="bind:innerHTML, socialnwlbl"></legend><ul class="socialnw"><li class="fb"><input class="input" type="text" name="facebook" data-profile="bind: value, facebook" data-editprofileevent="listen: input, updateField"></li><li class="gp"><input class="input" name="gplus" type="text" data-profile="bind: value, gplus" data-editprofileevent="listen: input, updateField"></li><li class="lin"><input class="input" name="linkedin" type="text" data-profile="bind: value, linkedin" data-editprofileevent="listen: input, updateField"></li><li class="tw"><input class="input" name="twitter" type="text" data-profile="bind: value, twitter" data-editprofileevent="listen: input, updateField"></li></ul><legend data-label="bind:innerHTML, hobbieslbl"></legend><label data-label="bind:innerHTML, name"></label><label class="description" data-label="bind:innerHTML, comment"></label><input name="leisure0" class="input" type="text" data-profile="bind: setLeisureName, leisure_activities" data-editprofileevent="listen: input, updateLeisureName"><input class="input description" name="leisure0" type="text" data-profile="bind: setLeisureDesc, leisure_activities" data-editprofileevent="listen: input, updateLeisureDesc"><input name="leisure1" class="input" type="text"  data-profile="bind: setLeisureName, leisure_activities" data-editprofileevent="listen: input, updateLeisureName"><input class="input description" name="leisure1" type="text" data-profile="bind: setLeisureDesc, leisure_activities" data-editprofileevent="listen: input, updateLeisureDesc"><input class="input" name="leisure2" type="text" data-profile="bind: setLeisureName, leisure_activities" data-editprofileevent="listen: input, updateLeisureName"><input class="input description" name="leisure2" type="text" data-profile="bind: setLeisureDesc, leisure_activities" data-editprofileevent="listen: input, updateLeisureDesc"><legend data-label="bind:innerHTML, interestslbl"></legend><label data-label="bind:innerHTML, field"></label><label class="description" data-label="bind:innerHTML, comment"></label><input class="input" name="interest0" type="text" data-profile="bind: setInterestName, interests" data-editprofileevent="listen: input, updateInterestName"><input class="input description" name="interest0" type="text" data-profile="bind: setInterestDesc, interests" data-editprofileevent="listen: input, updateInterestDesc"><input class="input" name="interest1" type="text" data-profile="bind: setInterestName, interests" data-editprofileevent="listen: input, updateInterestName"><input class="input description" name="interest1" type="text" data-profile="bind: setInterestDesc, interests" data-editprofileevent="listen: input, updateInterestDesc"><input class="input" name="interest2" type="text" data-profile="bind: setInterestName, interests" data-editprofileevent="listen: input, updateInterestName"><input class="input description" name="interest2" type="text" data-profile="bind: setInterestDesc, interests" data-editprofileevent="listen: input, updateInterestDesc"></form><div class="useascharacter"></div><p class="update"><label class="cancelprofile" data-label="bind:innerHTML, cancellbl" data-editprofileevent="listen: touchstart, press; listen:touchend, cancel"></label><label class="updateprofile" data-label="bind:innerHTML, updatelbl" data-editprofileevent="listen:touchstart, press; listen:touchend, update"></label><label class="editerror" data-errormsg="bind:innerHTML, errormsg"></label></p><div class="uploadprogress" data-progress="bind:showProgress, status"></div></div>';
                
                editProfile.init = function init($dom){
                        editProfile.reset();
                        editProfile.place($dom);
                };
                
                editProfile.selectpress = function(event, node){
                        node.classList.add("pressed");     
                };
                
                editProfile.cameraPreview = function(event, node){ 
                        var _img = new Image(),
                            _options = {quality:50, correctOrientation: true},
                            onSuccess, onFail;
                        
                        onSuccess = function (imageData){
                               _img.src = imageData;
                                setTimeout(function(){
                                        cropImage(resizeImage(_img));
                                        updates.picture_file = user.get("_id")+"_@v@t@r";
                                        document.getElementById("changeavatar").classList.add("invisible");
                                        node.classList.remove("pressed");
                                }, 1000);
                        };
                        
                        onFail = function(message){
                                alert("error: "+message);
                        };
                        
                        navigator.camera.getPicture(onSuccess, onFail, _options);       
                };
                
                editProfile.picturePreview = function(event, node){
                        var source = navigator.camera.PictureSourceType.PHOTOLIBRARY,
                            _img = new Image(),
                            _options = {quality:50, correctOrientation: true, sourceType: source},
                            onSuccess, onFail;
                        
                        onSuccess = function(imageData){
                                _img.src = imageData;
                                setTimeout(function(){
                                        cropImage(resizeImage(_img));
                                        updates.picture_file = user.get("_id")+"_@v@t@r";
                                        document.getElementById("changeavatar").classList.add("invisible");
                                        node.classList.remove("pressed");
                                }, 750);
                        };
                        
                        onFail = function(message){
                                alert("error: "+message);
                        };
                        
                        navigator.camera.getPicture(onSuccess, onFail, _options);
                };
                
                editProfile.changeAvatar = function(event, node){
                        document.getElementById("changeavatar").classList.remove("invisible");
                        // reset progress
                        progress.set("status", 0);        
                };
                
                editProfile.setDefaultAvatar = function(event, node){
                        var idx = node.getAttribute("data-avatars_id");
                        
                        // set proper index as selected
                        defaultAvatars.loop(function(v,i){
                                (i === parseInt(idx)) ? defaultAvatars.update(i, "selected", true) : defaultAvatars.update(i, "selected", false);        
                        });
                        
                        profile.set("avatar", defaultAvatars.get(idx).file);
                        updates.picture_file = defaultAvatars.get(idx).file;
                        document.getElementById("changeavatar").classList.add("invisible"); 
                };
                
                editProfile.rotateAvatar = function(event, node){
                        var canvas = document.createElement('canvas'),
                            ctx = canvas.getContext('2d'),
                            img = new Image();
                            
                        img.src = profile.get("avatar");
                        setTimeout(function(){
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx.translate(canvas.width/2, canvas.height/2);
                                ctx.rotate(Math.PI/2);
                                ctx.translate(-canvas.height/2, -canvas.width/2);
                                ctx.drawImage(img,0,0);
                                profile.set("avatar", canvas.toDataURL("image/png"));
                        }, 300);   
                };
                
                editProfile.reset = function reset(){
                        profile.reset(JSON.parse(user.toJSON()));
                        profile.set("avatar", Config.get("avatar"));
                        defaultAvatars.reset(avatarList);
                        updates = {};
                        
                        // check avatar
                        if (profile.get("picture_file").search("img/avatars/deedee") >-1){
                                defaultAvatars.loop(function(v,i){
                                        if (profile.get("picture_file").search(v.file) >-1) defaultAvatars.update(i, "selected", true);        
                                });
                        }       
                };
                
                editProfile.updateField = function(event, node){
                        var prop = node.getAttribute("name");
                        updates[prop] = node.value;
                        profile.set(prop, node.value);
                };
                
                editProfile.updateDate = function(event, node){
                        var date = profile.get("birthdate"), name = node.getAttribute("name"), value;
                        switch(name){
                                case "year":
                                        date[0] = node.value;
                                        break;
                                case "month":
                                        date[1] = node.selectedIndex;
                                        break;
                                case "day":
                                        date[2] = node.value;
                                        break;        
                        }
                        profile.set("birthdate", date);
                        updates.birthdate = date;        
                };
                
                editProfile.updateAddress = function(event, node){
                        var address = profile.get("address"), name = node.getAttribute("name");
                        address[name] = node.value || "";
                        profile.set("address", address);
                        updates.address = address;        
                };
                
                editProfile.updateFamily = function(event, node){
                        var name = node.getAttribute("name"), family = profile.get("family");
                        family[name] = node.selectedIndex;
                        profile.set("family", family);
                        updates.family = family;
                };
                
                editProfile.updateJob = function(event, node){
                        var occupation = profile.get("occupation"), name = node.getAttribute("name"), value;
                        switch(name){
                                case "situation":
                                        occupation.situation = node.selectedIndex;
                                        break;
                                case "job":
                                        occupation.job = node.value;
                                        break;
                                case "organization":
                                        occupation.organization = node.value;
                                        break;        
                        }
                        updates.occupation = occupation;      
                };
                
                editProfile.updateLeisureName = function(event, node){
                        var name = node.getAttribute("name"), idx = name.charAt(name.length-1), leisure = profile.get("leisure_activities");
                        leisure[idx].name = node.value;
                        profile.set("leisure_activities", leisure);
                        updates.leisure_activities = leisure;
                };
                
                editProfile.updateLeisureDesc = function(event, node){
                        var name = node.getAttribute("name"), idx = name.charAt(name.length-1), leisure = profile.get("leisure_activities");
                        leisure[idx].comment = node.value;
                        profile.set("leisure_activities", leisure);
                        updates.leisure_activities = leisure;               
                };
                
                editProfile.updateInterestName = function(event, node){
                        var name = node.getAttribute("name"), idx = name.charAt(name.length-1), interests = profile.get("interests");
                        interests[idx].name = node.value;
                        profile.set("interests", interests);
                        updates.interests = interests;               
                };
                
                editProfile.updateInterestDesc = function(event, node){
                        var name = node.getAttribute("name"), idx = name.charAt(name.length-1), interests = profile.get("interests");
                        interests[idx].comment = node.value;
                        profile.set("interests", interests);
                        updates.interests = interests;               
                };
               
               editProfile.press = function(event, node){
                        node.classList.add("pressed");        
               };
                
                editProfile.cancel = function cancel(event, node){
                        node.classList.remove("pressed");
                        document.querySelector(".userdetails").classList.remove("invisible");
                        document.querySelector(".edituserdetails").classList.add("invisible");
                };
                
                editProfile.update = function update(event, node){
                        var prop, changes=0;
                        node.classList.remove("pressed");
                        node.classList.add("invisible");
                        spinner.spin(node.parentNode);
                        
                        // loop through updates and update user document
                        for (prop in updates){
                                user.set(prop, updates[prop]);
                                changes++;
                        }
                        if (changes) {
                                user.upload().then(function(){
                                        var local = new LocalStore();
                                        // also update avatar in Config store and localstore
                                        if (updates.picture_file) {
                                                Config.set("avatar", profile.get("avatar"));
                                                local.sync("ideafy-data");
                                                local.set("userAvatar", Config.get("avatar"));
                                        }
                                        if (updates.picture_file && updates.picture_file.search("img/avatars/deedee") <0){
                                                uploadAvatar();
                                                document.getElementById("rotate").classList.add("invisible");
                                        }
                                        spinner.stop();
                                        node.classList.remove("invisible");
                                        Config.get("observer").notify("profile-updated");
                                        document.querySelector(".edituserdetails").classList.add("invisible");
                                        document.querySelector(".userdetails").classList.remove("invisible");
                                });
                        }
                        else{
                                spinner.stop();
                                node.classList.remove("invisible");
                                document.querySelector(".userdetails").classList.remove("invisible");
                                document.querySelector(".edituserdetails").classList.add("invisible");    
                        }
                };
                
                return editProfile;
};
