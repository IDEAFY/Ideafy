/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "Store", "Bind.plugin", "Event.plugin", "service/config"],
        function(Widget, Store, Model, Event, Config){
                
           return function PostitConstructor($store, $exit){
             
                var _widget = new Widget(),
                    _labels = Config.get("labels"),
                    _marker = "#4D4D4D",
                    _initColors = [
                            {name: "blue", color: "#657B99",img: "postItBlue.png", selected: false},
                            {name: "azur", color: "#9AC9CD",img: "postItAzur.png", selected: false},
                            {name: "yellow", color: "#F2E520",img: "postItYellow.png", selected: true},
                            {name: "orange", color: "#F27B3D",img: "postItOrange.png", selected: false}
                            ],
                    _colors = new Store(_initColors),
                    _lines = 0,
                   _pos = null, // the position of the postit
                   _postit = new Store({"type": "postit", "content":"", "style":{"postit": "yellow", "img": "postItYellow.png","marker": "#4D4D4D"}});
                   
                   _widget.plugins.addAll({
                           "labels": new Model(_labels),
                           "postit": new Model(_postit,{
                                   setStyle: function(style){
                                           var color = style.marker, img = style.img;
                                           this.setAttribute("style", "background-image:url('img/brainstorm/"+img+"'); color:"+color+";");
                                   }
                           }),
                           "colors": new Model(_colors,{
                                   setBg : function(color){
                                           this.setAttribute("style", "background:"+color+";");
                                   },
                                   setSelected : function(selected){
                                           (selected) ? this.innerHTML = "&#10003;" : this.innerHTML="";
                                   }
                           }),
                           "postitevent": new Event(_widget)
                   });
                
                _widget.template = '<div class="wbpostit"><div class="postit-cancel postit-close" data-postitevent="listen:touchstart,cancel"></div><div class="postit" data-postit="bind:setStyle, style"><textarea data-postit="bind: value, content" maxlength=140 data-postitevent="listen:keypress, checkLimit"></textarea></div><span class="choosecolorlbl" data-labels="bind:innerHTML, choosecolorlbl"></span><ul class="postitcolors" data-colors="foreach"><li class="postitcolor" data-postitevent="listen:touchstart,choose" data-colors="bind:setBg, color;bind:setSelected, selected"></li></ul><div name="post" class = "postpostit" data-postitevent="listen: touchstart, press; listen:touchend, post"></div><div class = "delpostit" name="del" data-postitevent="listen:touchstart, press;listen:touchend, del"></div></div>';
                
                
                _widget.cancel = function(event,node){
                        $exit("postit");        
                };
                
                _widget.choose = function(event, node){
                        var id = node.getAttribute("data-colors_id");;
                        
                        // set new color selection
                        _colors.loop(function(v,i){
                                (i === parseInt(id,10)) ? _colors.update(i, "selected", true) : _colors.update(i, "selected", false);
                        });
                        
                        // apply postit color
                        _postit.set("style", {"postit": _colors.get(id).name, "marker": _marker, "img": _colors.get(id).img}); 
                };
                
                _widget.press = function(event, node){
                        node.classList.add("pressed");
                                
                };
                
                _widget.post = function(event, node){
                        // add new post or replace previous one with new content
                        if (!_pos && _pos !== 0){
                                $store.alter("push", JSON.parse(_postit.toJSON()));
                        }
                        else {
                                $store.update(_pos, "content", _postit.get("content"));
                                $store.update(_pos, "style", _postit.get("style"));
                        }
                        node.classList.remove("pressed");
                        $exit("postit");  
                        // reset postit
                        _widget.reset(null);   
                };
                
                _widget.checkLimit = function(event, node){
                        var length = node.value.length;
                        if (event.keyCode === 8) {node.setAttribute("maxlegnth", 140);}
                        if (node.value.length === node.getAttribute("maxlength")) {alert("maximum size reached: keep your sticker notes short");}
                        if (node.value.split("\n").length === 5 && event.keyCode === 13){
                                alert("maximum number of lines reached: keep your sticker notes short");
                                node.value.slice(0, -1);
                                node.setAttribute("maxlength", node.value.length);        
                        }
                };
                
                _widget.reset = function reset(pos){
                        if (!pos && pos !== 0){
                                _postit.reset({"type": "postit", "content":"", "style":{"postit": "yellow", "img": "postItYellow.png", "marker": "#4D4D4D"}});
                                _colors.reset(_initColors);
                        }
                        else{
                               _postit.reset($store.get(pos));
                        }
                };
                
                _widget.del = function(event, node){
                        // check if postit has been previously saved -- if it's a new one delete == cancel
                        if (_pos){
                                $store.del(_pos);
                        }
                        node.classList.remove("pressed");
                        // reset postit
                        _widget.reset();
                        $exit("postit");        
                };
                
                return _widget;      
                   
           };
        });