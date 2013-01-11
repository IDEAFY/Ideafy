define("Ideafy/Dashboard/Settings", ["Olives/OObject", "Map", "Olives/Model-plugin", "Config"],
        function(Widget, Map, Model, Config){
                
           return function SettingsConstructor(){
                   
                   var settingsUI = new Widget(),
                       labels = Config.get("labels");
                   
                   settingsUI.plugins.addAll({
                           "label" : new Model(labels)
                   });
                   
                   settingsUI.template = '<div id="dashboard-settings"><div class="header blue-dark"><span data-label="bind:innerHTML, settingslbl"></span></div><div class="settingscontent"><div class="settingmodule"><legend data-label="bind:innerHTML, userpref"></legend></div><div class="settingmodule"><legend data-label="bind:innerHTML, brainstormsettings"></legend></div></div></div>';
                   
                   settingsUI.place(Map.get("dashboard-settings"));
                   
                   return settingsUI;
           };    
        });