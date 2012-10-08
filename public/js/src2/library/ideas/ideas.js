define("Ideafy/Library/Ideas", ["Olives/OObject", "Map"],
        function(OObject, Map){
                
           return function MyIdeasContructor(){
              
              // declaration     
              var _widget = new Widget();
              
              // setup
              _widget.alive(Map.get("ideas"));
              
              // return
              return _widget;
                   
           } ;    
                
        });
