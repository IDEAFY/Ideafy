define("Ideafy/Library/Sessions", ["Olives/OObject", "Map"],
        function(OObject, Map){
                
           return function MySessionsContructor(){
              
              // declaration     
              var _widget = new Widget();
              
              // setup
              _widget.alive(Map.get("ideas"));
              
              // return
              return _widget;
                   
           } ;    
                
        });