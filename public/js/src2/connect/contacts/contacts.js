define ("Ideafy/Connect/Contacts", ["Olives/OObject", "Map", "Config", "Amy/Stack-plugin"],
        function(Widget, Map, Config, Stack){
                
                return function ContactsConstructor(){
                        
                        var contactUI = new Widget();
                        
                        contactUI.template = '<div id="connect-contacts">Contacts</div>';
                        
                        contactUI.place(Map.get("connect-contacts"));
                        
                        return contactUI;    
                        
                }
        })
