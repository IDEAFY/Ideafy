define("Ideafy/Whiteboard/Drawing", ["Olives/OObject", "Map"],
        function(Widget, Map){
                
           return function DrawingConstructor(){
             
                var _widget = new Widget();
                
                _widget.template = '<div class = "drawing"></div>';
                
                return _widget;      
                   
           };
                
        });