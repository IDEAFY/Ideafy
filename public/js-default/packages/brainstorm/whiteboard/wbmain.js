/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Bind.plugin", "Event.plugin", "service/config", "Store" ],
        function(Widget, Model, Event, Config, Store){
                
           return function WBMainConstructor($store, $tools, $select){
             
                var _widget = new Widget(),
                    _sid,
                    _edit = true,
                    _readonly = false,
                    _transport = Config.get("transport"),
                    _page = new Store([]),
                    _pageSize = 8,
                    _pagination = new Store({currentPage:1, nbPages: 1});
                
                _widget.plugins.addAll({
                        "pagination" : new Model(_pagination,{
                                setPage : function(currentPage){
                                    var nb = currentPage;
                                    if (_pagination.get("nbPages") > 1){
                                            this.innerHTML = labels.get("page") + nb + " / " + _pagination.get("nbPages");
                                    }
                                    else this.innerHTML = "";
                                },
                                setNbPages : function(nbPages){
                                    var nb = _pagination.get("currentPage");
                                    if (nbPages>1){
                                                 this.innerHTML = labels.get("page") + nb + " / " + _pagination.get("nbPages");
                                    }
                                    else this.innerHTML = "";
                                },
                                setLeft : function(currentPage){
                                    (currentPage > 1)? this.classList.remove("invisible"):this.classList.add("invisible");
                                },
                                setRight : function(currentPage){
                                        (currentPage < _pagination.get("nbPages"))? this.classList.remove("invisible"):this.classList.add("invisible");
                                }
                        }),
                        "wbmain" : new Model(_page, {
                                "displayPost" : function(type){
                                        var node =this,
                                            id = node.getAttribute("data-wbmain_id"),
                                            content = $store.get(id).content,
                                            style = $store.get(id).style,
                                            bg = $store.get(id).background,
                                            dir,
                                            json;
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
                                                        this.innerHTML="";
                                                        dir = "sessions/"+_sid;
                                                        json = {"dir":dir, "filename":content};
                                                        _transport.request("GetFile", json, function(data){
                                                                node.setAttribute("style", "background:white; background-image: url('"+data+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;");   
                                                        });
                                                        break;
                                                case "drawing":
                                                        node.classList.remove("photo");
                                                        node.classList.add("drawing");
                                                        this.innerHTML="";
                                                        dir = "sessions/"+_sid;
                                                        json = {"dir":dir, "filename":content};
                                                        _transport.request("GetFile", json, function(data){
                                                                node.setAttribute("style", "background:"+bg+"; background-image: url('"+data+"'); background-repeat: no-repeat; background-position: center center; background-size:contain;");   
                                                        });
                                                        break;
                                                default:
                                                        break;
                                        }
                                }                              
                        }),
                        "wbevent" : new Event(_widget)
                });
                
                _widget.template = '<div class="wbmain"><div class="pagenb"><div class="leftcaret" data-pagination="bind: setLeft, currentPage" data-wbevent="listen:mousedown, push; listen:mouseup, previousPage"></div><span data-pagination="bind: setPage, currentPage; bind:setNbPages, nbPages"></span><div class = "rightcaret" data-pagination="bind: setRight, currentPage" data-wbevent="listen:mousedown, push; listen:mouseup, nextPage"></div></div><ul class="wblist" data-wbmain="foreach"><li class="wb-item postit" data-wbmain="bind: displayPost, type" data-wbevent="listen: mouseup, edit; listen:dblclick, cancelEdit"></li><ul><div>';
                
                 _widget.push = function(event,node){
                        node.classList.add("invisible");
                };
       
                _widget.previousPage = function(evetn, node){
                        _widget.displayPage("previous");
                };
       
                _widget.nextPage = function(event, node){
                        _widget.displayPage("next");
                };
                
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
                        event.stopPropagation();
                        _edit = false;        
                };
                
                _widget.setSessionId = function(sid){
                        _sid = sid;
                };
                
                _widget.setReadonly = function(bool){
                        _readonly = bool;
                };
                
                _widget.displayPage = function(target){
                    var currentPage = _pagination.get("currentPage"), cp, i, j;
                     console.log(target, cp);
                    switch(target){
                        case "next":
                            cp = currentPage;
                            _pagination.set("currentPage", cp+1);
                            break;
                        case "previous":
                            cp = currentPage - 2;
                            _pagination.set("currentPage", cp+1);
                            break;
                        default:
                            cp = currentPage - 1;
                            break;
                    }
       
                    console.log(_pagination.get("currentPage"));
                    _page.reset([]);
                    for (i=0; i<_pageSize; i++){
       
                        j = cp*_pageSize + i;
                        if ($store.get(j)) {
                            _page.alter("push", $store.get(j));
                        }
                        else {
                            break;
                        }
                    }
                    console.log(_page.toJSON());
                };
       
                _widget.getNbPages = function(){
                    var total = $store.getNbItems(),
                        div = total/_pageSize,
                        r = total%_pageSize;
                    if (r>0) return parseInt(div)+1;
                    if (div === 0) return 1;
                    else return div;
                };
       
                _widget.init = function(type){
                    _pagination.set("nbPages", _widget.getNbPages());
                    _widget.displayPage("current");
                    // display right caret if there is more than one page
                    if (_pagination.get("nbPages")>1) _widget.dom.querySelector(".rightcaret").classList.remove("invisible");
       
                    // watch for changes in $store
                    $store.watch("added", function(idx){
                                 var nb = _widget.getNbPages();
                                 _pagination.set("nbPages", nb);
                                 if (_page.getNbItems() === _pageSize && $store.get(idx).author === Config.get("user").get("_id")){
                                    _widget.displayPage("next");
                                 }
                                 else{
                                    _widget.displayPage("current");
                                 }
                    });
       
                    $store.watch("deleted", function(item){
                                 _pagination.set("nbPages", _widget.getNbPages());
                                 if (_page.getNbItems() === 1 && _pagination.get("currentPage") === _pagination.get("nbPages")){
                                 _widget.displayPage("previous");
                                 }
                                 else{
                                 _widget.displayPage("current");
                                 }
                    });
       
                    $store.watch("updated", function(){
                                 _widget.displayPage("current");
                    });
                };
                
                return _widget;      
                   
           };
        });