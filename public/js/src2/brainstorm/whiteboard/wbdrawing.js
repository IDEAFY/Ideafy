define("Ideafy/Whiteboard/Drawing", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store"],
        function(Widget, Map, Config, Model, Event, Store){
                
           return function DrawingConstructor($store, $exit){
             
                var _widget = new Widget(),
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
                            {color: "#white", active: false}
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
                    _transport = Config.get("transport"),
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
                                "togglebgfill" : function(mode){
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
                                },
                        }),
                        "drawingevent" : new Event(_widget)
                });
                
                _widget.template = '<div class = "wbdrawing"><div class="drawingtools"><div class="pencil selected" data-pencil="bind:toggleselected, mode" data-drawingevent="listen:touchstart, drawactive"><span></span></div><div class="erase" data-drawingevent="listen:touchstart, erase" data-pencil="bind:toggleselected, mode"><span></span></div><div class="clear" data-drawingevent="listen:touchstart, select; listen:touchend,clear"><span data-labels="bind:innerHTML, cleardrawinglbl">Clear</span></div><p name="pencilsize" data-drawingevent="listen:touchstart, expand"><svg width="60" height="54"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><circle class="stroke" cx="30" cy="36" r="18" stroke-width="1" data-pencil="bind:togglebgfill,mode"/><circle class="fill" cx="30" cy="36" r="18" data-pencil="bind:setSize,size; bind:togglepencil,color"/></svg><div class="drawinglabel" data-labels="bind:innerHTML, pencilsizelbl">size</div></p><input id="pencilsize" class="vertical invisible" type="range" min="1" max="36" data-pencil="bind:value,size" data-drawingevent="listen:touchstart, stop; listen:touchmove,stop; listen:touchend,hide"><div name="pencilcolors" id="pencilcolor" data-drawingevent="listen:touchstart, expand"><ul id="pencilcolors"  class="invisible" data-color="foreach"><li class="color-item" data-drawingevent="listen:touchstart, getColor"><div data-color="bind:setColor, color; bind:setActive, active"></div></li></ul><div class="pencilpreview" data-pencil="bind:setColor, color"></div><div class="drawinglabel" data-labels="bind:innerHTML, pencilcolorlbl">Color</div></div><div name="pencilbgcolors" id="pencilbgcolor" data-drawingevent="listen:touchstart, expand"><ul id="pencilbgcolors"  class="invisible" data-bgcolor="foreach"><li class="color-item" data-drawingevent="listen:touchstart, getBgColor"><div data-bgcolor="bind:setColor, color; bind:setActive, active"></div></li></ul><div class="bgpreview" data-pencil="bind:setColor, bg"></div><div class="drawinglabel" data-labels="bind:innerHTML, drawbgcolorlbl">Background</div></div><div class="canceldrawing" data-drawingevent="listen:touchstart, select; listen:touchend,cancel"></div><div class="deletedrawing" data-drawingevent="listen:touchstart,select;listen:touchend,deletedrawing"></div><div class="savedrawing" data-drawingevent="listen:touchstart, post"></div></div><canvas id="drawarea" class="drawingcanvas" width=652 height=438 data-pencil="bind:setColor, bg" data-drawingevent="listen:touchstart,start;listen:touchmove,move;listen:touchend,end;"></canvas></div>';
                
                
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
                        $exit("drawing");       
                };
                
                _widget.deletedrawing = function(event, node){
                        node.classList.remove("selected");        
                };
                
                _widget.post = function(event, node){
                        node.classList.add("selected");
                        // temporary
                        setTimeout(function(){node.classList.remove("selected");}, 300);        
                };
                
                _widget.reset = function reset($pos){
                        _pos = $pos;
                        if (!_pos && _pos !== 0){
                                _lines = [];
                                _pencil.reset({color: "#4D4D4D", size:"3", cap:"round"});
                        }
                        else{
                               _postit.reset($store.get($pos)); 
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