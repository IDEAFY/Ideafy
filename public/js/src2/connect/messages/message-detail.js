define("Ideafy/Connect/MessageDetail", ["Olives/OObject", "Map" , "Config"],
        function(Widget, Map, Config){
                
           return function MessageDetailConstructor(){
           
                var msgDetailUI = new Widget();
                
                msgDetailUI.template = '<div id="msgdetail"></div>';
                
                //init
                msgDetailUI.reset = function reset(msg){
                };
                
                return msgDetailUI;
            };      
        });
