/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["Olives/OObject", "service/map", "service/config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Promise", "service/utils"],
        function(Widget, Map, Config, Model, Event, Store, Promise, Utils){
                
           return function DrawingConstructor($store, $exit){
             
                var _widget = new Widget(),
                    _pos = null,
                    _lines = [],
                    _pencil = new Store({color: "#4D4D4D", size:"1", cap:"round", bg: "white", mode:"pencil"}),
                    _colors = new Store([
                            {color: "#4D4D4D", active: true},
                            {color: "#657B99", active: false},
                            {color: "#9AC9CD", active: false},
                            {color: "#F2E520", active: false},
                            {color: "#F27B3D", active: false},
                            {color: "#BD262C", active: false},
                            {color: "#5F8F28", active: false},
                            {color: "white", active: false}
                    ]),
                    _bgcolors = new Store([
                            {color: "white", active: true},
                            {color: "#657B99", active: false},
                            {color: "#9AC9CD", active: false},
                            {color: "#F2E520", active: false},
                            {color: "#F27B3D", active: false},
                            {color: "#BD262C", active: false},
                            {color: "#5F8F28", active: false},
                            {color: "#4D4D4D", active: false}
                    ]),
                    _labels = Config.get("labels"),
                    _progress = new Store({"status": null}),
                    _postit = new Store({"type": "drawing", "content":"", "background":""}),
                    _uploadCanvas = function(filename){
                            var _promise = new Promise(),
                                _url = '/upload',
                                _fd = new FormData(),
                                _type = "postit",
                                _canvas = document.getElementById("drawarea"),
                                _dataURL = _canvas.toDataURL("image/png"),
                                _now=new Date(),
                                _filename = filename || Config.get("user").get("_id")+'_'+_now.getTime();
                            _fd.append("type", _type);
                            _fd.append("sid", _sid);
                            _fd.append("filename", _filename);
                            _fd.append("dataString", _dataURL);
                            Utils.uploadFile(_url, _fd, _progress, function(result){
                                _postit.set("content", _filename);
                                _postit.set("background", _pencil.get("bg"));
                                _promise.resolve();
                            });
                            return _promise;
                    },
                    _sid;
                
                _widget.plugins.addAll({
                        "labels": new Model(_labels),
                        "color": new Model(_colors, {
                                "setColor" : function(color){
                                        this.setAttribute("style", "background:"+color+";");        
                                },
                                "setActive" : function(active){
                                        (active) ? this.innerHTML="&#10003;":this.innerHTML="";        
                                },
                        }),
                        "pencil": new Model(_pencil, {
                                "setSize" : function(d){
                                        this.setAttribute("r", Math.round(d/2));        
                                },
                                "setColor" : function(color){
                                        this.setAttribute("style", "background:"+color+";");        
                                },
                                "togglebgfill" : function(color){
                                        this.setAttribute("fill", color);  
                                },
                                "togglemode" : function(mode){
                                        (mode === "pencil") ? this.setAttribute("fill", _pencil.get("bg")) : this.setAttribute("fill", "#CCCCCC");  
                                },
                                "togglepencil" : function(color){
                                        (_pencil.get("mode") === "pencil") ? this.setAttribute("fill", color) : this.setAttribute("fill", _pencil.get("bg"));            
                                },
                                "toggleselected" : function(mode){
                                        (this.classList.contains(mode)) ?this.classList.add("selected"):this.classList.remove("selected");               
                                }
                        }),
                        "bgcolor": new Model(_bgcolors, {
                                "setColor" : function(color){
                                        this.setAttribute("style", "background:"+color+";");        
                                },
                                "setActive" : function(active){
                                        (active) ? this.innerHTML="&#10003;":this.innerHTML="";        
                                }
                        }),
                        "uploadprogress" : new Model(_progress, {
                                "showProgress" : function(status){
                                        (status)?this.innerHTML = status+'%':this.innerHTML="";
                                }
                        }),
                        "drawing" : new Model(_postit, {
                                "draw" : function(content){
                                        var _transport = Config.get("transport"), node=this, json;
                                        if (content){
                                                json = {"sid":_sid, "filename":content};
                                                _transport.request("GetFile", json, function(data){
                                                        var _img = new Image(),
                                                            _ctx = node.getContext('2d');
                                                        _img.src = data;
                                                        /*node.width=_img.width;
                                                        node.height=_img.height;*/
                                                        _ctx.drawImage(_img,0,0);   
                                                });       
                                        }
                                }        
                        }),
                        "drawingevent" : new Event(_widget)
                });
                
                _widget.template = '<div class = "wbdrawing"><div class="drawingtools"><div class="pencil selected" data-pencil="bind:toggleselected, mode" data-drawingevent="listen:mousedown, drawactive"><span></span></div><div class="erase" data-drawingevent="listen:mousedown, erase" data-pencil="bind:toggleselected, mode"><span></span></div><div class="clear" data-drawingevent="listen:mousedown, select; listen:mouseup,clear"><span data-labels="bind:innerHTML, cleardrawinglbl">Clear</span></div><p name="pencilsize" data-drawingevent="listen:mousedown, expand"><svg width="60" height="54"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><circle class="stroke" cx="30" cy="36" r="18" stroke-width="1" data-pencil="bind:togglebgfill,bg; bind:togglemode,mode"/><circle class="fill" cx="30" cy="36" r="18" data-pencil="bind:setSize,size; bind:togglepencil,color"/></svg><div class="drawinglabel" data-labels="bind:innerHTML, pencilsizelbl">size</div></p><input id="pencilsize" class="vertical invisible" type="range" min="1" max="36" data-pencil="bind:value,size" data-drawingevent="listen:mousedown, stop; listen:touchmove,stop; listen:mouseup,hide"><div name="pencilcolors" id="pencilcolor" data-drawingevent="listen:mousedown, expand"><ul id="pencilcolors"  class="invisible" data-color="foreach"><li class="color-item" data-drawingevent="listen:mousedown, getColor"><div data-color="bind:setColor, color; bind:setActive, active"></div></li></ul><div class="pencilpreview" data-pencil="bind:setColor, color"></div><div class="drawinglabel" data-labels="bind:innerHTML, pencilcolorlbl">Color</div></div><div name="pencilbgcolors" id="pencilbgcolor" data-drawingevent="listen:mousedown, expand"><ul id="pencilbgcolors"  class="invisible" data-bgcolor="foreach"><li class="color-item" data-drawingevent="listen:mousedown, getBgColor"><div data-bgcolor="bind:setColor, color; bind:setActive, active"></div></li></ul><div class="bgpreview" data-pencil="bind:setColor, bg"></div><div class="drawinglabel" data-labels="bind:innerHTML, drawbgcolorlbl">Background</div></div><div class="canceldrawing" data-drawingevent="listen:mousedown, select; listen:mouseup,cancel"></div><div class="deletedrawing" data-drawingevent="listen:mousedown,select;listen:mouseup,deletedrawing"></div><div class="savedrawing" data-drawingevent="listen:mousedown, post" data-uploadprogress="bind:showProgress,status" ></div></div><canvas id="drawarea" class="drawingcanvas" width=652 height=438 data-pencil="bind:setColor, bg" data-drawingevent="listen:mousedown,start;listen:touchmove,move;listen:mouseup,end;" data-drawing="bind:draw, content"></canvas></div>';
                
                
                _widget.setSessionId = function(sid){
                        _sid = sid;
                };
                
                _widget.clear = function(event, node){
                        var _canvas = document.getElementById("drawarea"),
                            _ctx = _canvas.getContext("2d");
                        
                        _ctx.clearRect(0,0,_canvas.width, _canvas.height);
                        node.classList.remove("selected");       
                };
                
                _widget.resetColors = function(){
                        _pencil.reset({color: "#4D4D4D", size:"1", cap:"round", bg: "white", mode:"pencil"});
                        _colors.reset([
                            {color: "#4D4D4D", active: true},
                            {color: "#657B99", active: false},
                            {color: "#9AC9CD", active: false},
                            {color: "#F2E520", active: false},
                            {color: "#F27B3D", active: false},
                            {color: "#BD262C", active: false},
                            {color: "#5F8F28", active: false},
                            {color: "white", active: false}
                        ]);
                        _bgcolors.reset([
                            {color: "white", active: true},
                            {color: "#657B99", active: false},
                            {color: "#9AC9CD", active: false},
                            {color: "#F2E520", active: false},
                            {color: "#F27B3D", active: false},
                            {color: "#BD262C", active: false},
                            {color: "#5F8F28", active: false},
                            {color: "#4D4D4D", active: false}
                        ]);       
                };
                
                _widget.erase = function(event, node){
                        _pencil.set("mode", "erase");
                        _pencil.set("color", _pencil.get("bg"));        
                };
                
                _widget.drawactive = function(event, node){
                        _pencil.set("mode", "pencil");
                        _colors.loop(function(v,i){
                                if (v.active) _pencil.set("color", v.color);
                        })
                };
                
                _widget.expand = function(event, node){
                        var name=node.getAttribute("name"),
                            _ui = document.getElementById(name);;
                        
                        _ui.classList.contains("invisible") ? _ui.classList.remove("invisible") : _ui.classList.add("invisible");
                        
                };
                
                _widget.stop = function(event, node){
                        event.stopPropagation();        
                };
                
                _widget.hide = function(event, node){
                        event.stopPropagation();
                        node.classList.add("invisible");        
                };
                
                _widget.select = function(event, node){
                        node.classList.add("selected");
                };
                
                _widget.getColor = function(event, node){
                        var id = node.getAttribute("data-color_id");
                        event.stopPropagation();
                        _colors.loop(function(v,i){
                                (i === parseInt(id)) ? _colors.update(i, "active", true) : _colors.update(i, "active", false);
                        });
                        _pencil.set("color", _colors.get(id).color);
                        _pencil.set("mode", "pencil");
                        node.parentNode.classList.add("invisible");      
                };
                
                _widget.getBgColor = function(event, node){
                        var id = node.getAttribute("data-bgcolor_id");
                        event.stopPropagation();
                        _bgcolors.loop(function(v,i){
                                (i === parseInt(id)) ? _bgcolors.update(i, "active", true) : _bgcolors.update(i, "active", false);
                        });
                        _pencil.set("bg", _bgcolors.get(id).color);
                        node.parentNode.classList.add("invisible");      
                };
                
                _widget.cancel = function(event, node){
                        _widget.clear(event, node);
                        _widget.resetColors();
                        _postit.reset({"type": "drawing", "content":"", "background":""});
                        node.classList.remove("selected");
                        $exit("drawing");       
                };
                
                _widget.deletedrawing = function(event, node){
                        // delete == cancel if it's a new drawing
                        if (_pos || _pos === 0) $store.del(_pos);
                        _widget.cancel(event, node);      
                };
                
                _widget.post = function(event, node){
                        node.classList.add("selected");
                        // upload canvas to the server
                        _uploadCanvas(_postit.get("content")).then(function(){
                                // add new post or replace previous one with new content
                                if (!_pos && _pos !== 0){
                                        $store.alter("push", JSON.parse(_postit.toJSON()));
                                }
                                else {
                                        $store.update(_pos, "content", _postit.get("content"));
                                        $store.update(_pos, "background", _postit.get("background"));
                                }
                                node.classList.remove("selected"); 
                                // reset progress & clear canvas
                                _widget.cancel(event,node);
                                _progress.reset({status:""});
                        });      
                };
                
                _widget.reset = function reset($pos){
                        _pos = $pos;
                        _widget.resetColors();
                        _lines = [];
                        if (!_pos && _pos !== 0){
                                _postit.reset({"type": "drawing", "content":"", "background":""});
                        }
                        else{
                               _postit.reset($store.get($pos));
                               _pencil.set("bg", _postit.get("background"));
                               _bgcolors.loop(function(v,i){
                                       (v.color === _postit.get("background")) ? _bgcolors.update(i, "active", true) : _bgcolors.update(i, "active", false);
                               }); 
                        }
                };
                
                _widget.start = function(event, node){
                                var touches = event.touches;
                                
                                for(i = 0, l = touches.length; i < l; i++) {
                                        var touch = touches[i];
                                        _lines[touch.identifier] = {
                                                x : touch.pageX - node.offsetLeft,
                                                y : touch.pageY - node.offsetTop
                                        };
                                }
                                event.preventDefault();
                        };

                _widget.end = function(event, node){
                };

                _widget.move = function(event, node){
                        var touches = event.touches;
                        for(i = 0, l = touches.length; i < l; i++){
                                var touch = touches[i],
                                    id = touch.identifier,
                                    moveX = touch.pageX - node.offsetLeft - _lines[id].x,
                                    moveY = touch.pageY - node.offsetTop - _lines[id].y,
                                    ret = _widget.draw(node, id, moveX, moveY);
                                _lines[id] = {
                                        x : ret.x,
                                        y : ret.y
                                };
                        }
                        event.preventDefault();
                };

                _widget.draw = function(canvas, i, changeX, changeY){
                        var _ctx = canvas.getContext("2d");
                                
                        _ctx.lineWidth = _pencil.get("size");
                        _ctx.strokeStyle = _pencil.get("color");
                        _ctx.lineCap = _pencil.get("cap");
                                
                        _ctx.beginPath();
                        _ctx.moveTo(_lines[i].x,_lines[i].y);
                        _ctx.lineTo(_lines[i].x+changeX,_lines[i].y+changeY);
                        _ctx.stroke();
                        _ctx.closePath();
                        return{
                                x:_lines[i].x+changeX,
                                y:_lines[i].y+changeY
                        };
                };
                
                return _widget;      
                   
           };
        });