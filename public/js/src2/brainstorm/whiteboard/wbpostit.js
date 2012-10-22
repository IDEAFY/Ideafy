define("Ideafy/Whiteboard/Postit", ["Olives/OObject", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Config"],
        function(Widget, Store, Model, Event, Config){
                
           return function PostitConstructor($store, $exit){
             
                var _widget = new Widget(),
                    _labels = Config.get("labels"),
                    _marker = "#4D4D4D",
                    _colors = new Store([
                            {name: "blue", color: "#657B99",img: "postItBlue.png", selected: false},
                            {name: "azur", color: "#9AC9CD",img: "postItAzur.png", selected: false},
                            {name: "yellow", color: "#F2E520",img: "postItYellow.png", selected: true},
                            {name: "orange", color: "#F27B3D",img: "postItOrange.png", selected: false}
                            ]),
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
                
                _widget.template = '<div class="wbpostit"><div class="postit-cancel" data-postitevent="listen:touchstart,cancel"></div><textarea class="postit" data-postit="bind: value, content; bind: setStyle, style"></textarea><span class="choosecolorlbl" data-labels="bind:innerHTML, choosecolorlbl"></span><ul class="postitcolors" data-colors="foreach"><li class="postitcolor" data-postitevent="listen:touchstart,choose" data-colors="bind:setBg, color;bind:setSelected, selected"></li></ul><div name="post" class = "postpostit" data-postitevent="listen: touchstart, press; listen:touchend, post"></div><div class = "delpostit" name="del" data-postitevent="listen:touchstart, press;listen:touchend, del"></div></div>';
                
                
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
                        $store.alter("push", JSON.parse(_postit.toJSON()));
                        node.classList.remove("pressed");
                        $exit("postit");  
                        // reset postit
                        _widget.reset();   
                };
                
                _widget.reset = function reset($pos){
                        if (!$pos && $pos !== 0){
                                _postit.reset({"type": "postit", "content":"", "style":{"postit": "yellow", "img": "postItYellow.png", "marker": "#4D4D4D"}});
                        }
                        else{
                               _postit.reset($content.get($pos)); 
                        }
                };
                
                _widget.del = function(event, node){
                        
                };
                
                return _widget;      
                   
           };
                
        });