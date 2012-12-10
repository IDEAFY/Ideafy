define("Ideafy/Connect/MessageDetail", ["Olives/OObject", "Map", "Amy/Stack-plugin"],
        function(Widget, Map, Stack){
                
           return function MessageDetailConstructor(){
           
                var msgDetailUI = new Widget(),
                    defaultPage = new Widget(),
                    detailStack = new Stack();
                
                msgDetailUI.plugins.add("msgdetailstack", detailStack);
                
                msgDetailUI.alive(Map.get("msg-detail"));
                
                msgDetailUI.read = function read(msgId){
                        
                };
                
                msgDetailUI.write = function write(){
                        
                };
                
                defaultPage.template = '<div class="msgSplash"></div>';
                
                //init
                detailStack.getStack().add("#default", defaultPage);
                
                // show default page
                detailStack.getStack().show("#default");
                
                
                
                
                return msgDetailUI;
                   
           };      
        });
