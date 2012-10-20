define("Ideafy/Whiteboard/Import", ["Olives/OObject", "Map"],
        function(Widget, Map){
                
           return function ImportConstructor(){
             
                var _widget = new Widget();
                
                _widget.template = '<div class="import"></div>'
                
                return _widget;      
                   
           };
                
        });