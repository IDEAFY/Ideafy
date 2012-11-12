define("Ideafy/Whiteboard/Import", ["Olives/OObject", "Map", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Ideafy/Utils", "Store"],
        function(Widget, Map, Config, Model, Event, Utils, Store){
                
           return function ImportConstructor($store, $sid, $exit){
             
                var _widget = new Widget(),
                    _labels = Config.get("labels"),
                    _reader = new FileReader(),
                    _progress = new Store({"status": null}),
                    _pos = null, // the position of the postit
                    _postit = new Store({"type": "import", "content":""}),
                    MAX_WIDTH = 186,
                    MAX_HEIGHT = 186,
                    _drawImage = function(img){
                            var _width, _height,
                                _canvas = document.getElementById("preview"),
                                _ctx = _canvas.getContext("2d");
                                
                            // resize image if needed
                            _width = img.width;
                            _height = img.height;
                            if (_width>_height){
                                if (_width > MAX_WIDTH) {
                                        _height *= MAX_WIDTH / _width;
                                        _width = MAX_WIDTH;
                                }
                            }
                            else {
                                if (_height > MAX_HEIGHT) {
                                        _width *= MAX_HEIGHT / _height;
                                        _height = MAX_HEIGHT;
                                }
                            }
                            _canvas.width = _width;
                            _canvas.height = _height;
                            // draw canva
                            _ctx.drawImage(img, 0, 0, _width, _height);
                            document.getElementById("postpic").classList.remove("invisible");
                    },
                    _uploadCanvas = function(){
                            var _url = '/upload',
                                _fd = new FormData(),
                                _type = "postit",
                                _canvas,
                                _dataURL;
                            console.log($sid);
                            _fd.append(_type, $sid, Config.get("user").get("_id"), _dataURL);
                            FD = _fd;
                            /*Utils.uploadFile(_url, _fd, _progress, function(result){
                                    
                            });*/
                    };
                
                _widget.template = '<div class="import"><input type="file" enctype="multipart/form-data" accept = "image/gif, image/jpeg, image/png" data-importevent="listen: change, preview"><div id="postpic" class="wbpostit invisible" data-importmodel="bind:setVisibility, content"><div class="postit-cancel" data-importevent="listen:touchstart,cancel"></div><div class="picframe"><canvas id="preview" data-importmodel="bind:showPreview, content"></canvas></div><div name="post" class = "postpostit" data-importevent="listen: touchstart, post"></div><div class = "delpostit" name="del" data-importevent="listen:touchstart, press;listen:touchend, del"></div><div class="uploadprogress"></div></div>';
                
                _widget.plugins.addAll({
                        "labels" : new Model(_labels),
                        "importmodel" : new Model(_postit, {
                                "setVisibility" : function(content){
                                        (content) ? this.classList.remove("invisible") : this.classList.add("invisible");        
                                },
                                "showPreview" : function(content){
                                        
                                }
                        }),
                        "importevent" : new Event(_widget)        
                });
                
                _widget.cancel = function(event,node){
                        $exit("postit");        
                };
                
                _widget.preview = function(event, node){
                        
                        var _img = document.createElement("img"),
                            _reader = new FileReader();
                        
                        // first read the file to memory, once loaded resize and display upload button
                        _reader.onload = function(e) {
                                _img.src = e.target.result;
                                // timeout is needed to render image and obtain its dimensions
                                setTimeout(_drawImage(_img), 500);
                        };
                        _reader.readAsDataURL(node.files[0]);
                };
                
                _widget.post = function(event, node){
                        // upload current picture to the server
                        _uploadCanvas();                        
                        // add new post or replace previous one with new content
                        if (!_pos && _pos !== 0){
                                $store.alter("push", JSON.parse(_postit.toJSON()));
                        }
                        else {
                                $store.update(_pos, "content", _postit.get("content"));
                        }
                        node.classList.remove("pressed");
                        $exit("postit");  
                        // reset postit
                        _widget.reset();   
                };
                
                _widget.reset = function reset($pos){
                        _pos = $pos;
                        
                        if (!_pos && _pos !== 0){
                                _postit.reset({"type": "postit", "content":""});
                        }
                        else{
                               _postit.reset($store.get($pos)); 
                        }
                };
               
                return _widget;      
                   
           };
                
        });