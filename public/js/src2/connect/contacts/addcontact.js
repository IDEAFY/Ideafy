define("Ideafy/Connect/AddContact", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore"],
        function(Widget, Config, Model, Event, CouchDBStore){
                
           return function AddContactConstructor(){
                   
             var addContactUI = new Widget(),
                 count = new CouchDBStore(),
                 transport = Config.get("transport"),
                 labels = Config.get("labels");
             
             
             addContactUI.plugins.addAll({
                     "label" : new Model(labels),
                     "count" : new Model(count)
             });
             
             addContactUI.template = '<div id="addcontact"><div class="header blue-dark"><span class="newcontactlbl" data-label="bind:innerHTML, newcontactlbl"></span></div><div class = "detail-contents"><div class="doctor-deedee"></div><div class="addcontactform"><p class="half"><span data-label="bind:innerHTML, beforecount"></span><strong><span data-count="bind:innerHTML, 0.value"></span></strong><span data-label="bind:innerHTML, aftercount"></span></p><p class="half" data-label="bind: innerHTML, addcontactrightintro"></p><legend data-label="bind:innerHTML, addcontactnow"></legend><input class="search" type="text" data-label="bind:placeholder, searchcontactplaceholder"><legend data-label="bind:innerHTML, lookup"></legend><div class="searchcontact"><input type="text" class="search half" data-label="bind:placeholder, firstnameplaceholder"><input class="search half right" type="text" data-label="bind: placeholder, lastnameplaceholder"></div><p class="searchresult"></p></div></div></div>';
             
             addContactUI.init = function init(){
                count.setTransport(transport);
                count.sync("ideafy", "users", "_view/count").then(function(){console.log(count.toJSON())});        
             };
             
             addContactUI.init();
             
             return addContactUI;
                   
           };   
        });
