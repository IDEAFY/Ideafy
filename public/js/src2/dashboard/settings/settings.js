/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define("Ideafy/Dashboard/Settings", ["Olives/OObject", "Map", "Olives/Model-plugin",  "Olives/Event-plugin", "Config", "Store", "Ideafy/Utils"],
        function(Widget, Map, Model, Event, Config, Store, Utils){
                
           return function SettingsConstructor(){
                   
                   var settingsUI = new Widget(),
                       labels = Config.get("labels"),
                       screens = [
                                {"name": "public", "dest": "#public"},
                                {"name": "library", "dest": "#library"},
                                {"name": "brainstorm", "dest": "#brainstorm"},
                                {"name": "connect", "dest": "#connect"},
                                {"name": "dashboard", "dest": "#dahsboard"}
                                ],
                       options = new Store({"screens": screens}),
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
                                                res+="<option>"+labels.get(screens[i].name)+"</option>";
                                                if (screens[i].dest === user.get("settings").startupScreen) idx = i
                                        }
                                        this.innerHTML=res;
                                        this.selectedIndex = idx;         
                                   }
                           }),
                           "settings" : new Model(settings),
                           "settingsevent" : new Event(settingsUI)
                   });
                   
                   settingsUI.template = '<div id="dashboard-settings"><div class="header blue-dark"><span data-label="bind:innerHTML, settingslbl"></span></div><div class="settingscontent"><div class="settingmodule"><legend data-label="bind:innerHTML, userpref"></legend><ul><li><span data-label="bind:innerHTML, setlang"></span><select data-options="bind:setLang, lang" data-settingsevent="listen: change, updateLang"></select></li><li class="startupscreen"><span data-label="bind: innerHTML, choosestartup">Startup screen</span><select data-options="bind:setStartupScreen, screens" data-settingsevent="listen: change, updateStartup"></select></li><li class="showtip"><input type="checkbox" data-settings="bind: checked, showTips" data-settingsevent="listen: touchstart, showTips"><label data-label="bind:innerHTML, showtips"></label></li><li class="shownotif"><input type="checkbox" data-settings="bind: checked, notifyPopup" data-settingsevent="listen: touchstart, showNotif"><label data-label="bind:innerHTML, shownotif"></label></li><li>Set privacy level</li><li>Use as character</li></ul></div><div class="settingmodule"><legend data-label="bind:innerHTML, brainstormsettings"></legend><ul><li>Select deck</li><li>Set timers</li><li>Automatic card draws</li></ul></div></div></div>';
                   
                   settingsUI.place(Map.get("dashboard-settings"));
                   
                   settingsUI.updateLang = function updateLang(event, node){
                        if (node.value !== user.get("lang")){
                                Utils.updateLabels(node.value);
                                user.set("lang", node.value);
                                user.upload();
                        }        
                        
                   };
                   
                   settingsUI.updateStartup = function updateStartup(event,node){
                        var id = node.selectedIndex, s = user.get("settings");
                        s.startupScreen = screens[id].dest;
                        user.set("settings", s);
                        user.upload();
                   };
                   
                   settingsUI.showTips = function(event, node){
                           var s = user.get("settings");
                        // update settings store
                        settings.set("showTips", !settings.get("showTips"));
                        
                        // update user doc
                        s.showTips = settings.get("showTips");
                        user.set("settings", s);
                        user.upload();
                   };
                   
                   settingsUI.showNotif = function(event, node){
                           var s = user.get("settings");
                        // update settings store
                        settings.set("notifyPopup", !settings.get("notifyPopup"));
                        
                        // update user doc
                        s.showTips = settings.get("notifyPopup");
                        user.set("settings", s);
                        user.upload();
                   };
                   
                   // init
                   
                   // get user settings
                   settings.reset(user.get("settings"));
                   
                   // get available languages
                   transport.request("GetLanguages", {}, function(result){
                        options.set("lang", result);      
                   });
                   
                   return settingsUI;
           };    
        });