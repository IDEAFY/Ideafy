define("Ideafy/Whiteboard/Main", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin" ],
        function(Widget, Model, Event){
                
           return function WBMainConstructor($store, $tools, $select){
             
                var _widget = new Widget();
                
                _widget.plugins.addAll({
                        "wbmain" : new Model($store, {
                                setType : function(type){
                                        var _class = "postit";
                                        switch(type){
                                                case "postit":
                                                        _class = "postit";
                                                        break;
                                                default:
                                                        break;
                                        }
                                        this.classList.add(_class);
                                },
                                setContent : function(content){
                                        var id = this.getAttribute("data-wbmain_id");
                                        if ($store.get(id).type === "postit") this.innerHTML = content;       
                                },
                                setStyle : function(style){
                                        var color = style.marker, img = style.img;
                                        this.setAttribute("style", "background-image:url('img/brainstorm/"+img+"'); color:"+color+";");
                                }
                        }),
                        "wbevent" : new Event(_widget)
                });
                
                _widget.template = '<div class="wbmain"><ul class="wblist" data-wbmain="foreach"><li class="wb-item" data-wbmain="bind: setType, type; bind: setContent, content; bind:setStyle, style" data-wbevent="listen: touchstart, edit"></li><ul><div>';
                
                
                _widget.edit = function(event, node){
                        var id = node.getAttribute("data-wbmain_id"),
                            type = $store.get(id).type;
                            
                        $tools.set(type, "active");
                        $select(type, id);
                };
                
                return _widget;      
                   
           };
                
        });