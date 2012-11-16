define("Ideafy/Whiteboard/Main", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Config" ],
        function(Widget, Model, Event, Config){
                
           return function WBMainConstructor($store, $tools, $select){
             
                var _widget = new Widget(),
                    _sid,
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
                              /*  setType : function(type){
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
                                },
                                setBg : function(bg){
                                        if (bg){
                                                this.setAttribute("style", "background:"+bg+";");
                                        }
                                }*/
                        }),
                        "wbevent" : new Event(_widget)
                });
                
                _widget.template = '<div class="wbmain"><ul class="wblist" data-wbmain="foreach"><li class="wb-item postit" data-wbmain="bind: displayPost, type" data-wbevent="listen: touchstart, edit"></li><ul><div>';
                
                
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