define("Ideafy/Whiteboard/Main", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin" ],
        function(Widget, Model, Event){
                
           return function WBMainConstructor($store){
             
                var _widget = new Widget();
                
                _widget.plugins.addAll({
                        "wbmain" : new Model($store),
                        "wbevent" : new Event(_widget)
                });
                
                _widget.template = '<div class="wbmain"><ul class="wblist" data-wbmain="foreach"><li class="wb-item" data-wbmain="bind: setText, text; bind:setImg, style" data-wbevent="listen: touchstart, edit"></li><ul><div>';
                
                
                _widget.edit = function(event, node){
                        var id = node.getAttribute("data-wbmain_id"),
                            type = $store.get(id).type;
                            
                        _tools.set(type, "active");
                }
                
                return _widget;      
                   
           };
                
        });