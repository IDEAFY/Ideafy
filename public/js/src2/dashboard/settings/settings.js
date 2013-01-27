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
                       options = new Store(),
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
                                   }
                           }),
                           "settings" : new Model(settings),
                           "settingsevent" : new Event(settingsUI)
                   });
                   
                   settingsUI.template = '<div id="dashboard-settings"><div class="header blue-dark"><span data-label="bind:innerHTML, settingslbl"></span></div><div class="settingscontent"><div class="settingmodule"><legend data-label="bind:innerHTML, userpref"></legend><ul><li><span>Language</span><select data-options="bind:setLang, lang" data-settingsevent="listen: change, updateLang"></select></li><li>Startup screen</li><li>Show tips at startup</li><li>Show notification popup</li><li>Set privacy level</li><li>Use as character</li></ul></div><div class="settingmodule"><legend data-label="bind:innerHTML, brainstormsettings"></legend><ul><li>Select deck</li><li>Set timers</li><li>Automatic card draws</li></ul></div></div></div>';
                   
                   settingsUI.place(Map.get("dashboard-settings"));
                   
                   settingsUI.updateLang = function updateLang(event, node){
                        if (node.value !== user.get("lang")){
                                Utils.updateLabels(node.value);
                                user.set("lang", node.value);
                                user.upload();
                        }        
                        
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