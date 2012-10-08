define("Ideafy/Library/Ideas", ["Olives/OObject", "Map"],
        function(Widget, Map){
                
           return function MyIdeasConstructor(){
              
              // declaration     
              var _widget = new Widget();
              
              // setup
              _widget.alive(Map.get("ideas"));
              
              // return
              return _widget;
                   
           } ;    
                
        });
