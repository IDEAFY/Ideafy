define("Ideafy/Whiteboard/Main", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Config" ],
        function(Widget, Model, Event, Config){
                
           return function WBMainConstructor($store, $tools, $select){
             
                var _widget = new Widget(),
                    _sid,
                    _readonly = false,
                    _transport = Config.get("transport");
                
                _widget.plugins.addAll({
                        "wbmain" : new Model($store, {
                                "displayPost" : function(type){
                                        var node =this,
                                            id = node.getAttribute("data-wbmain_id"),
                                            content = $store.get(id).content,
                                            style = $store.get(id).style,
                                            bg = $store.get(id).background,
                                            json;
                                        console.log($store.get(id));
                                        switch(type){
                                                case "postit":
                                                        node.classList.remove("photo");
                                                        node.classList.remove("drawing");
                                                        node.innerHTML = content;
                                                        node.setAttribute("style", "background:transparent; background:url('img/brainstorm/"+style.img+"'); color:"+style.marker+";");
                                                        break;
                                                case "import":
                                                        node.classList.add("photo");
                                                        node.classList.remove("drawing");
                                                        this.innerHTML="";
                                                        json = {"sid":_sid, "filename":content};
                                                        _transport.request("GetFile", json, function(data){
                                                                node.setAttribute("style", "background:white; background-image: url('"+data+"'); background-repeat: no-repeat; background-position: center center;");   
                                                        });
                                                        break;
                                                case "drawing":
                                                        node.classList.remove("photo");
                                                        node.classList.add("drawing");
                                                        this.innerHTML="";
                                                        json = {"sid":_sid, "filename":content};
                                                        _transport.request("GetFile", json, function(data){
                                                                node.setAttribute("style", "background:"+bg+"; background-image: url('"+data+"'); background-repeat: no-repeat; background-position: center center;");   
                                                        });
                                                        break;
                                                default:
                                                        break;
                                        }
                                }                              
                        }),
                        "wbevent" : new Event(_widget)
                });
                
                _widget.template = '<div class="wbmain"><ul class="wblist" data-wbmain="foreach"><li class="wb-item postit" data-wbmain="bind: displayPost, type" data-wbevent="listen: touchstart, edit"></li><ul><div>';
                
                
                _widget.edit = function(event, node){
                        var id = node.getAttribute("data-wbmain_id"),
                            type = $store.get(id).type;
                            
                        if (!_readonly){
                                $tools.set(type, "active");
                                $select(type, id);
                        }
                        else{
                                // in readonly mode allow the possibility to zoom in on pictures and drawings
                                if ($store.get(id).type !== "postit"){
                                        (node.classList.contains("enlarge"))?node.classList.remove("enlarge"):node.classList.add("enlarge");
                                }
                        }
                };
                
                _widget.setSessionId = function(sid){
                        _sid = sid;
                };
                
                _widget.setReadonly = function(bool){
                        _readonly = bool;
                }
                
                return _widget;      
                   
           };
                
        });