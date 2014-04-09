/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "Bind.plugin",  "Event.plugin", "service/config", "Store", "service/utils", "CouchDBBulkDocuments"],
        function(Widget, Map, Model, Event, Config, Store, Utils, CouchDBBulkDocuments){
                
           return function SettingsConstructor(){
                   
                   var settingsUI = new Widget(),
                       labels = Config.get("labels"),
                       user = Config.get("user"),
                       transport = Config.get("transport"),
                       screens = [
                                {"name": labels.get("public"), "dest": "#public"},
                                {"name": labels.get("library"), "dest": "#library"},
                                {"name": labels.get("brainstorm"), "dest": "#brainstorm"},
                                {"name": labels.get("connect"), "dest": "#connect"},
                                {"name": labels.get("dashboard"), "dest": "#dashboard"}
                                ],
                       timers = [
                                {"name": labels.get("everymin"), "value": 60000},
                                {"name": labels.get("everyfive"), "value": 300000},
                                {"name": labels.get("everyfifteen"), "value": 900000},
                                {"name": labels.get("never"), "value": 86400000}
                                ],
                       options = new Store({"screens": screens, "timers": timers, "pwd":"", "pwdbis":"", "lang":[], "pwdchange": "", "contentLang": user.get("lang").substring(0,2)}),
                       _languages = new Store([{name:"*"}]),
                       _usrLg = Config.get("userLanguages"),
                       settings = new Store();                  
                   
                   // build languages & flags
                   _usrLg.forEach(function(val){
                        _languages.alter("push", val);
                   });
                   
                   settingsUI.plugins.addAll({
                           "label" : new Model(labels),
                           "options" : new Model(options, {
                                   setLang : function(lang){
                                        var i,l, res="";
                                        for (i=0, l=lang.length;i<l;i++){
                                                res+="<option>"+lang[i]+"</option>";
                                        }
                                        this.innerHTML=res;
                                        this.selectedIndex = lang.indexOf(user.get("lang"));        
                                   },
                                   setStartupScreen: function(screens){
                                        var i,l, res="", selected, idx;
                                        for (i=0, l=screens.length;i<l;i++){
                                                res+="<option>"+screens[i].name+"</option>";
                                                if (screens[i].dest === user.get("settings").startupScreen) idx = i;
                                        }
                                        this.innerHTML=res;
                                        this.selectedIndex = idx;         
                                   },
                                   setPollingInterval: function(timers){
                                           var i, l, res="", selected, idx;
                                           for (i=0, l=timers.length; i<l; i++){
                                                   res+="<option>"+timers[i].name+"</option>";
                                                   if (timers[i].value === user.get("settings").polling_interval) idx = i;
                                           }
                                           this.innerHTML=res;
                                           this.selectedIndex = idx;
                                   },
                                   setDecks: function(decks){
                                           var i, l, res="", selected, idx;
                                           for (i=0, l=decks.length; i<l; i++){
                                                   res+="<option>"+decks[i].title+"</option>";
                                                   if(decks[i].id === user.get("active_deck")) idx = i;
                                           }
                                           this.innerHTML=res;
                                           this.selectedIndex = idx;
                                   },
                                   setBg : function(l){
                                        if (l === "all"){
                                                this.setAttribute("style", "background-image: none;");
                                                this.innerHTML = "*";
                                        }
                                        else{
                                                this.innerHTML = " ";
                                                this.setAttribute("style", "background-image:url('img/flags/"+l+".png');background-size: contain;");
                                        }
                                }
                           }),
                           "select" : new Model (_languages, {
                                setBg : function(name){
                                        if (name === "*"){
                                                        this.setAttribute('style', "background-image: none;background: whitesmoke;text-align: center;");
                                                        this.innerHTML="*";
                                        }
                                        else{
                                                this.innerHTML = " ";
                                                this.setAttribute("style", "background-image:url('img/flags/"+name+".png'); background-size: contain;");
                                        }
                                } 
                           }),
                           "settings" : new Model(settings),
                           "settingsevent" : new Event(settingsUI)
                   });
                   
                   settingsUI.template = '<div id="dashboard-settings"><div class="header blue-dark"><span data-label="bind:innerHTML, settingslbl"></span></div><div class="settingscontent"><div class="settingmodule"><legend data-label="bind:innerHTML, publicwallsettings"></legend><ul><li class="startupscreen"><span data-label="bind: innerHTML, choosepolling"></span><select data-options="bind:setPollingInterval, timers" data-settingsevent="listen: change, updatePollingInterval"></select></li></ul></div><div class="settingmodule"><legend data-label="bind:innerHTML, brainstormsettings"></legend><ul><li class="activedeck"><span data-label="bind:innerHTML, setdeck">Set brainstorming deck</span><select data-options="bind:setDecks, decks" data-settingsevent="listen: mousedown, getDecks; listen: change, updateDeck"></select></li></ul></div><div class="settingmodule"><legend data-label="bind:innerHTML, userpref"></legend><ul><li><span data-label="bind:innerHTML, setlang"></span><select data-options="bind:setLang, lang" data-settingsevent="listen: change, updateLang"></select></li><li class="activelang"><span data-label="bind:innerHTML, defaultlangfilter"></span><div class="selectlang"><div data-options="bind:setBg, contentLang"></div><button data-settingsevent = "listen:mouseup, displayLang"></button></div><ul class="langlist invisible" data-select="foreach"><li data-select="bind: setBg, name" data-settingsevent="listen: mouseup, setContentLang"></li></ul></li><li class="startupscreen"><span data-label="bind: innerHTML, choosestartup"></span><select data-options="bind:setStartupScreen, screens" data-settingsevent="listen: change, updateStartup"></select></li><li class="setting-input"><input type="checkbox" data-settings="bind: checked, showTips" data-settingsevent="listen: change, showTips"><label data-label="bind:innerHTML, showtips"></label></li><li class="setting-input"><input type="checkbox" data-settings="bind: checked, notifyPopup" data-settingsevent="listen: change, showNotif"><label data-label="bind:innerHTML, shownotif"></label></li><li class="setting-input"><input type="checkbox" data-settings="bind: checked, useascharacter" data-settingsevent="listen: change, useAsChar"><label data-label="bind:innerHTML, usechar"></label></li><li><span data-label="bind: innerHTML, changepwd"></span><input class="input" type="password" data-label="bind:placeholder, passwordplaceholder" data-options="bind: value, pwd" data-settingsevent="listen:input, updatepwd; listen: input, clearOK"><input class="input" type="password" data-label="bind:placeholder, repeatpasswordplaceholder" data-options="bind: value, pwdbis" data-settingsevent="listen:input, updatepwdbis; listen: input, clearOK"><span class="changeok" data-options="bind: innerHTML, pwdchange"></span><div class="next-button" data-label="bind:innerHTML, changelbl" data-settingsevent="listen: mousedown, press; listen:mouseup, changePWD"></div></li></ul></div></div></div>';
                   
                   settingsUI.place(Map.get("dashboard-settings"));
                   
                   settingsUI.updateLang = function updateLang(event, node){
                        if (node.value !== user.get("lang")){
                                Utils.updateLabels(node.value).then(function(){
                                        user.set("lang", node.value);
                                        user.upload();
                                        
                                        // reload timer and screens labels
                                        options.set("timers", [
                                                {"name": labels.get("everymin"), "value": 60000},
                                                {"name": labels.get("everyfive"), "value": 300000},
                                                {"name": labels.get("everyfifteen"), "value": 900000},
                                                {"name": labels.get("never"), "value": 86400000}
                                        ]);
                                        options.set("screens", [
                                                {"name": labels.get("public"), "dest": "#public"},
                                                {"name": labels.get("library"), "dest": "#library"},
                                                {"name": labels.get("brainstorm"), "dest": "#brainstorm"},
                                                {"name": labels.get("connect"), "dest": "#connect"},
                                                {"name": labels.get("dashboard"), "dest": "#dahsboard"}
                                        ]);
                                        // reset active filter language
                                        (settings.get("contentLang")) ? options.set("contentLang", settings.get("contentLang")) : options.set("contentLang", user.get("lang").substring(0,2));     
                                });
                        }        
                   };
                   
                   settingsUI.displayLang = function(event, node){
                        settingsUI.dom.querySelector(".langlist").classList.remove("invisible");        
                   };
                
                   settingsUI.setContentLang = function(event, node){
                        var i = parseInt(node.getAttribute("data-select_id"), 10),
                            s = user.get("settings");
                        
                        settingsUI.dom.querySelector(".langlist").classList.add("invisible");
                        
                        if (i === 0){
                                s.contentLang = "all";
                                options.set("contentLang", "all");       
                        }
                        else{
                                s.contentLang = _languages.get(i).name;
                                options.set("contentLang", s.contentLang);
                        }
                        user.set("settings", s);
                        user.upload();
                   };
                   
                   settingsUI.getDecks = function getDecks(){
                        var cdb = new CouchDBBulkDocuments(),
                            idList = user.get("taiaut_decks").concat(user.get("custom_decks")),
                            decks = [];
                        cdb.setTransport(Config.get("transport"));
                        cdb.sync(Config.get("db"), {keys : idList})
                        .then(function(){
                                options.set("decks", []);
                                cdb.loop(function(v,i){
                                        var c = v.doc.content;
                                        // keep only valid decks (enough cards to run a basic session)
                                        if (c.characters.length>=2 && c.contexts.length >=2 && c.problems.length >= 2 && c.techno.length >= 4){
                                                decks.push({"id":v.doc._id, "title":v.doc.title});
                                        }       
                                });
                                cdb.unsync();
                                decks.sort(function(x,y){
                                        var a = x.title, b = y.title;
                                        if (a<b) return -1;
                                        if (a>b) return 1;
                                        if (a===b) return 0;
                                });
                                options.set("decks", decks);        
                        });
                   };
                   
                   settingsUI.updateDeck = function updateDeck(event, node){
                        var id = node.selectedIndex, deck = options.get("decks")[id].id;
                        user.set("active_deck", deck);
                        user.upload();        
                   };
                   
                   settingsUI.updateStartup = function updateStartup(event,node){
                        var id = node.selectedIndex, s = user.get("settings");
                        s.startupScreen = screens[id].dest;
                        user.set("settings", s);
                        user.upload();
                   };
                   
                   settingsUI.updatePollingInterval = function updatePollingInterval(event, node){
                        var id = node.selectedIndex, s = user.get("settings");
                        s.polling_interval = timers[id].value;
                        user.set("settings", s);
                        user.upload();        
                   };
                   
                   settingsUI.showTips = function(event, node){
                           var s = user.get("settings");
                        
                        // update user doc
                        s.showTips = node.checked;
                        user.set("settings", s);
                        user.upload().then(function(){
                                console.log("upload successful");
                        });
                   };
                   
                   settingsUI.showNotif = function(event, node){
                           var s = user.get("settings");
                        
                        // update user doc
                        s.notifyPopup = node.checked;
                        user.set("settings", s);
                        user.upload();
                   };
                   
                   settingsUI.useAsChar = function(event, node){
                           var s = user.get("settings");
                        
                        // update user doc
                        s.useascharacter = node.checked;
                        user.set("settings", s);
                        user.upload();
                   };
                   
                   settingsUI.press = function(event, node){
                           node.classList.add("pressed");
                   };
                   
                   settingsUI.clearOK = function(event, node){
                        options.set("pwdchange", "");        
                   };
                   
                   settingsUI.updatepwd = function(event, node){
                           options.set("pwd", node.value);
                   };
                   
                   settingsUI.updatepwdbis = function(event, node){
                           options.set("pwdbis", node.value);
                   };
                   settingsUI.changePWD = function(event, node){
                           node.classList.remove("pressed");
                           
                           // check if passwords match
                           if (options.get("pwd") !== options.get("pwdbis")){
                                   options.set("pwdbis", "");
                                   options.set("pwdchange", "&#10007;");
                           }
                           else{
                                   transport.request("ChangePWD", {"userid": user.get("_id"), "pwd": options.get("pwd")}, function(result){
                                           var json = {}, notif = {}, now, n = user.get("notifications").concat() || [];
                                           if (result === "ok") {
                                                   options.set("pwdchange", "&#10003;");
                                                   
                                                   // send confirmation email with new password & notification
                                                   json.type = "pwd";
                                                   json.to = user.get("_id");
                                                   json.subject = labels.get("pwdchange");
                                                   json.html = labels.get("pwdchangebody") + options.get("pwd");
                                                   transport.request("SendMail", json, function(result){
                                                           if (result.sendmail !== "ok") console.log(result);
                                                   });
                                                   
                                                   // set resetPWD field to false
                                                   user.set("resetPWD", false);
                                                   
                                                   // also add notification message
                                                   now = new Date();
                                                   notif.type = "pwd";
                                                   notif.status = "unread";
                                                   notif.date = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                                   notif.author = "IDEAFY";
                                                   notif.username = "Ideafy";
                                                   notif.firstname =  "DeeDee";
                                                   notif.object = labels.get("pwdupdate");
                                                   notif.body =  labels.get("pwdchangebody") + options.get("pwd");
                                                   n.unshift(notif);
                                                   user.set("notifications", n);
                                                   user.upload()
                                                   .then(function(result){
                                                           if (!result.ok) console.log(result);
                                                   });
                                          }
                                   });
                           }
                   };
                   
                   // init
                   settingsUI.reset = function reset(){
                           // get user settings and watch for changes
                        settings.reset(user.get("settings"));
                        user.watchValue("settings", function(change){
                                settings.reset(user.get("settings"));
                        });
                        
                        // get available decks
                        settingsUI.getDecks();
                   
                        // get available languages
                        transport.request("GetLanguages", {}, function(result){
                                options.set("lang", result);      
                        });
                        
                        // set active filter language
                        (settings.get("contentLang")) ? options.set("contentLang", settings.get("contentLang")) : options.set("contentLang", user.get("lang").substring(0,2));
                        
                        // reload timer and screens labels
                        options.set("timers", [
                                {"name": labels.get("everymin"), "value": 60000},
                                {"name": labels.get("everyfive"), "value": 300000},
                                {"name": labels.get("everyfifteen"), "value": 900000},
                                {"name": labels.get("never"), "value": 86400000}
                        ]);
                        options.set("screens", [
                                {"name": labels.get("public"), "dest": "#public"},
                                {"name": labels.get("library"), "dest": "#library"},
                                {"name": labels.get("brainstorm"), "dest": "#brainstorm"},
                                {"name": labels.get("connect"), "dest": "#connect"},
                                {"name": labels.get("dashboard"), "dest": "#dahsboard"}
                        ]);
                        
                        // reset pwd fields
                        options.set("pwd", "");
                        options.set("pwdbis", "");
                        options.set("pwdchange", ""); 
                   };
                   
                   settingsUI.reset();
                   
                   // update labels do it once per session in case some new labels have been added on the server side
                   Utils.updateLabels(user.get("lang"));
                   
                   return settingsUI;
           };    
        });