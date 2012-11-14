define("Ideafy/Whiteboard/Drawing", ["Olives/OObject", "Map"],
        function(Widget, Map){
                
           return function DrawingConstructor($store, $exit){
             
                var _widget = new Widget(),
                    _sid;
                
                _widget.template = '<div class = "wbdrawing"><div class="drawingtools" data-event="selector:.erase,mousedown,erase;selector:.pencil,mousedown,pencil"><div class="pencil selected"><span>pencil</span></div><div class="erase"><span>erase</span></div><p><svg data-svgevent="selector:circle,mousedown,down;selector:circle,mouseup,up" data-stroke="bind:toggleClass,className" width="60" height="100"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><circle class="stroke" cx="30" cy="50" r="25" fill="rgba(0,0,0,0.4)" stroke-width="1" /><circle class="fill" cx="30" cy="50" r="25" data-stroke="bind:r,stroke"/></svg><span style="color:white;">size</span></p><input class="vertical" type="range" min="1" max="25" data-stroke="bind:value,stroke"><div class="canceldrawing"><span>cancel</span></div><div class="savedrawing"><span>publish</span></div></div><canvas class="canvas" data-event="listen:mousedown,start;listen:mousemove,move;listen:mouseup,end;"></canvas></div>';
                
                
                _widget.setSessionId = function(sid){
                        _sid = sid;
                };
                
                return _widget;      
                   
           };
                
        });