define("Ideafy/Connect/Twocents", ["Olives/OObject", "Map"],
        function(Widget, Map){
                
                return function TwocentsConstructor(){
                        
                        var twocentUI = new Widget();
                        
                        twocentUI.template = '<div id="connect-twocents">Two cents</div>';
                        
                        twocentUI.place(Map.get("connct-twocents"));
                        
                        return twocentUI;
                };
        });
