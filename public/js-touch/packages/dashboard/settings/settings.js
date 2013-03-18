/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/map", "Olives/Model-plugin",  "Olives/Event-plugin", "service/config", "Store", "service/utils"],
        function(Widget, Map, Model, Event, Config, Store, Utils){
                
           return function SettingsConstructor(){
                   
                   var settingsUI = new Widget(),
                       labels = Config.get("labels"),
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
                       options = new Store({"screens": screens, "timers": timers, "pwd":"", "pwdbis":"", "lang":[], "pwdchange": ""}),
                       settings = new Store(),
                       transport = Config.get("transport"),
                       user = Config.get("user");
                  
                   
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
                                                if (screens[i].dest === user.get("settings").startupScreen) idx = i
                                        }
                                        this.innerHTML=res;
                                        this.selectedIndex = idx;         
                                   },
                                   setPollingInterval: function(timers){
                                           var i, l, res="", selected, idx;
                                           for (i=0, l=timers.length; i<l; i++){
                                                   res+="<option>"+timers[i].name+"</option>";
                                                   if (timers[i].value === user.get("settings").polling_interval) idx = i
                                           }
                                           this.innerHTML=res;
                                           this.selectedIndex = idx;
                                   }
                           }),
                           "settings" : new Model(settings),
                           "settingsevent" : new Event(settingsUI)
                   });
                   
                   settingsUI.template = '<div id="dashboard-settings"><div class="header blue-dark"><span data-label="bind:innerHTML, settingslbl"></span></div><div class="settingscontent"><div class="settingmodule"><legend data-label="bind:innerHTML, userpref"></legend><ul><li><span data-label="bind:innerHTML, setlang"></span><select data-options="bind:setLang, lang" data-settingsevent="listen: change, updateLang"></select></li><li class="startupscreen"><span data-label="bind: innerHTML, choosestartup"></span><select data-options="bind:setStartupScreen, screens" data-settingsevent="listen: change, updateStartup"></select></li><li class="startupscreen"><span data-label="bind: innerHTML, choosepolling"></span><select data-options="bind:setPollingInterval, timers" data-settingsevent="listen: change, updatePollingInterval"></select></li><li class="setting-input"><input type="checkbox" data-settings="bind: checked, showTips" data-settingsevent="listen: change, showTips"><label data-label="bind:innerHTML, showtips"></label></li><li class="setting-input"><input type="checkbox" data-settings="bind: checked, notifyPopup" data-settingsevent="listen: change, showNotif"><label data-label="bind:innerHTML, shownotif"></label></li><li class="setting-input"><input type="checkbox" data-settings="bind: checked, useascharacter" data-settingsevent="listen: change, useAsChar"><label data-label="bind:innerHTML, usechar"></label></li><li><span data-label="bind: innerHTML, changepwd"></span><input class="input" type="password" data-label="bind:placeholder, passwordplaceholder" data-options="bind: value, pwd" data-settingsevent="listen: input, clearOK"><input class="input" type="password" data-label="bind:placeholder, repeatpasswordplaceholder" data-options="bind: value, pwdbis" data-settingsevent="listen: input, clearOK"><span class="changeok" data-options="bind: innerHTML, pwdchange"></span><div class="next-button" data-label="bind:innerHTML, changelbl" data-settingsevent="listen: touchstart, press; listen:touchend, changePWD"></div></li></ul></div><div class="settingmodule invisible"><legend data-label="bind:innerHTML, brainstormsettings"></legend><ul><li>Select deck</li><li>Set timers</li><li>Automatic card draws</li></ul></div></div></div>';
                   
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
                                });
                        }        
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
                        s.showNotif = node.checked;
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
                   
                   settingsUI.changePWD = function(event, node){
                           node.classList.remove("pressed");
                           
                           // check if passwords match
                           if (options.get("pwd") !== options.get("pwdbis")){
                                   options.set("pwdbis", "");
                           }
                           else{
                                   transport.request("ChangePWD", {"userid": user.get("_id"), "pwd": options.get("pwd")}, function(result){
                                           if (result === "ok") options.set("pwdchange", "&#10003;");
                                   });
                           }
                   };
                   
                   // init
                   
                   // get user settings and watch for changes
                   settings.reset(user.get("settings"));
                   user.watchValue("settings", function(change){
                           settings.reset(user.get("settings"));
                   });
                   
                   // get available languages
                   transport.request("GetLanguages", {}, function(result){
                        options.set("lang", result);      
                   });
                   
                   
                   
                   return settingsUI;
           };    
        });