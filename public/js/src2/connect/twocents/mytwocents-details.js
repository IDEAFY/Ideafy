define("Ideafy/Connect/MTCDetails", ["Olives/OObject", "Config"],
        function(Widget, Config){
                
                return function MTCDetailsConstructor($type){
                        //$type can be TC (twocents) or TQ (twoquestion)
                        
                        var mtcDetailUI = new Widget();
                        
                        mtcDetailUI.template = '<div class="comingsoon">Coming soon</div>';
                       
                        return mtcDetailUI;       
                };
        });
