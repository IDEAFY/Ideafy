define("Ideafy/Library/Sessions", ["Olives/OObject", "Map"],
        function(Widget, Map){
                
           return function MySessionsContructor(){
              
              // declaration     
              var _widget = new Widget();
              
              // setup
              _widget.alive(Map.get("sessions"));
              
              // return
              return _widget;
                   
           } ;    
                
        });