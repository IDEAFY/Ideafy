define("Ideafy/Whiteboard/Main", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Config" ],
        function(Widget, Model, Event, Config){
                
           return function WBMainConstructor($store, $tools, $select){
             
                var _widget = new Widget(),
                    _sid,
                    _transport = Config.get("transport");
                
                _widget.plugins.addAll({
                        "wbmain" : new Model($store, {
                                setType : function(type){
                                        switch(type){
                                                case "postit":
                                                        this.classList.remove("photo");
                                                        break;
                                                case "import":
                                                        this.classList.add("photo");
                                                default:
                                                        break;
                                        }
                                },
                                setContent : function(content){
                                        var id = this.getAttribute("data-wbmain_id"),
                                            node = this,
                                            json;
                                        if ($store.get(id).type === "postit") this.innerHTML = content;
                                        if ($store.get(id).type === "import") {
                                                this.innerHTML = "";
                                                json = {"sid":_sid, "filename":content};
                                                _transport.request("GetFile", json, function(data){
                                                        node.setAttribute("style", "background-image: url('"+data+"');");   
                                                });
                                        }     
                                },
                                setStyle : function(style){
                                        if (style){
                                                var color = style.marker, img = style.img;
                                                this.setAttribute("style", "background-image:url('img/brainstorm/"+img+"'); color:"+color+";");
                                        }
                                }
                        }),
                        "wbevent" : new Event(_widget)
                });
                
                _widget.template = '<div class="wbmain"><ul class="wblist" data-wbmain="foreach"><li class="wb-item postit" data-wbmain="bind: setType, type; bind: setContent, content; bind:setStyle, style" data-wbevent="listen: touchstart, edit"></li><ul><div>';
                
                
                _widget.edit = function(event, node){
                        var id = node.getAttribute("data-wbmain_id"),
                            type = $store.get(id).type;
                            
                        $tools.set(type, "active");
                        $select(type, id);
                };
                
                _widget.setSessionId = function(sid){
                        _sid = sid;
                };
                
                return _widget;      
                   
           };
                
        });