/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "service/config", "lib/spin.min" ],
        function(Widget, Model, Event, Config, Spinner){
                
           return function WBMainConstructor($store, $tools, $select){
             
                var _widget = new Widget(),
                    _sid,
                    _edit = true,
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
                                            dir, json,
                                            spinner;
                                        switch(type){
                                                case "postit":
                                                        node.classList.remove("photo");
                                                        node.classList.remove("drawing");
                                                        node.innerHTML = '<div class="inner-postit">'+content.replace(/\n/g, "<br>")+"</div>";
                                                        node.setAttribute("style", "background:url('img/brainstorm/"+style.img+"') no-repeat center center; background-size: contain; color:"+style.marker+";");
                                                        break;
                                                case "import":
                                                        node.classList.add("photo");
                                                        node.classList.remove("drawing");
                                                        spinner = new Spinner().spin(node);
                                                        this.innerHTML="";
                                                        dir = "sessions/"+_sid;
                                                        json = {"dir":dir, "filename":content};
                                                        _transport.request("GetFile", json, function(data){
                                                                node.setAttribute("style", "background:white; background-image: url('"+data+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;"); 
                                                                spinner.stop();  
                                                        });
                                                        break;
                                                case "drawing":
                                                        node.classList.remove("photo");
                                                        node.classList.add("drawing");
                                                        spinner = new Spinner().spin(node);
                                                        this.innerHTML="";
                                                        dir = "sessions/"+_sid;
                                                        json = {"dir":dir, "filename":content};
                                                        _transport.request("GetFile", json, function(data){
                                                                node.setAttribute("style", "background:"+bg+"; background-image: url('"+data+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;");
                                                                spinner.stop();   
                                                        });
                                                        break;
                                                default:
                                                        break;
                                        }
                                }                              
                        }),
                        "wbevent" : new Event(_widget)
                });
                
                _widget.template = '<div class="wbmain"><ul class="wblist" data-wbmain="foreach"><li class="wb-item postit" data-wbmain="bind: displayPost, type" data-wbevent="listen: touchend, edit; listen:touchmove, cancelEdit"></li><ul><div>';
                
                
                _widget.edit = function(event, node){
                        var id = node.getAttribute("data-wbmain_id"),
                            type = $store.get(id).type;
                        
                        if (_edit){    
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
                        }
                        else _edit = true;
                };
                
                _widget.cancelEdit = function(event,node){
                        _edit = false;        
                };
                
                _widget.setSessionId = function(sid){
                        _sid = sid;
                };
                
                _widget.setReadonly = function(bool){
                        _readonly = bool;
                };
                
                return _widget;      
                   
           };
        });