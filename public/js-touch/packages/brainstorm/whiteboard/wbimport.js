/**
 * https://github.com/TAIAUT/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent.weyl@taiaut.com>
 * Copyright (c) 2012-2013 TAIAUT
 */

define(["OObject", "service/map", "service/config", "Bind.plugin", "Event.plugin", "service/utils", "Store", "Promise", "cordova"],
        function(Widget, Map, Config, Model, Event, Utils, Store, Promise, cordova){
                
           return function ImportConstructor($store, $exit){
             
                var _widget = new Widget(),
                    Camera = cordova.require("cordova/plugin/Camera"),
                    _labels = Config.get("labels"),
                    _reader = new FileReader(),
                    _progress = new Store({"status": null}),
                    _pos = null, // the position of the postit
                    _postit = new Store({"type": "import", "content":""}),
                    _sid, // the current session id
                    MAX_WIDTH = 400,
                    MAX_HEIGHT = 300,
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
                    },
                    _uploadCanvas = function(filename){
                            var _promise = new Promise(),
                                _url = '/upload',
                                _fd = new FormData(),
                                _type = "postit",
                                _canvas = document.getElementById("preview"),
                                _dataURL = _canvas.toDataURL("image/png"),
                                _now=new Date(),
                                _filename = filename || Config.get("user").get("_id")+'_'+_now.getTime();
                            _fd.append("type", _type);
                            _fd.append("sid", _sid);
                            _fd.append("filename", _filename);
                            _fd.append("dataString", _dataURL);
                            Utils.uploadFile(_url, _fd, _progress, function(result){
                                _postit.set("content", _filename);
                                _promise.fulfill();
                            });
                            return _promise;
                    },
                    _clearCanvas = function(){
                            var _canvas = document.getElementById("preview"),
                                _ctx = _canvas.getContext("2d");
                            
                            _ctx.clearRect(0,0,_canvas.width, _canvas.height);
                    };
                
/*                _widget.template = '<div class="import"><span class="importbutton"><input type="file" enctype="multipart/form-data" accept = "image/\*" data-importevent="listen: touchstart, selectpress; listen:touchend, check; listen: change, preview"><div data-labels="bind:innerHTML, importlbl"></div></span><div id="postpic" class="wbpostit invisible" data-importmodel="bind:setVisibility, content"><div class="postit-cancel postit-close" data-importevent="listen:touchstart,cancel"></div><div class="picframe"><canvas id="preview" data-importmodel="bind:showPreview, content"></canvas></div><div name="post" class = "postpostit" data-importevent="listen: touchstart, press; listen:touchend, post"></div><div class = "delpostit" name="del" data-importevent="listen:touchstart, press;listen:touchend, del"></div><div class="uploadprogress" data-importprogress="bind:showProgress, status"></div></div>'; */
                // removed <div class="uploadprogress" data-importprogress="bind:innerHTML, status"></div> before the end
                
                _widget.template = '<div class="import"><ul><li class="importbutton" data-importevent="listen: touchstart, press; listen:touchend, picturePreview" data-labels="bind:innerHTML, importpiclbl"></li><li class="importbutton" data-importevent="listen: touchstart, press; listen:touchend, cameraPreview" data-labels="bind:innerHTML, importcameralbl"></li></ul><div id="postpic" class="wbpostit invisible" data-importmodel="bind:setVisibility, content"><div class="postit-cancel postit-close" data-importevent="listen:touchstart,cancel"></div><div class="picframe"><canvas id="preview" data-importmodel="bind:showPreview, content"></canvas></div><div name="post" class = "postpostit" data-importevent="listen: touchstart, press; listen:touchend, post"></div><div class = "delpostit" name="del" data-importevent="listen:touchstart, press;listen:touchend, del"></div><div class="uploadprogress" data-importprogress="bind:showProgress, status"></div></div>';
                
                _widget.plugins.addAll({
                        "labels" : new Model(_labels),
                        "importmodel" : new Model(_postit, {
                                "setVisibility" : function(content){
                                        (content) ? this.classList.remove("invisible") : this.classList.add("invisible");        
                                },
                                "showPreview" : function(content){
                                        var json, node=this, _transport=Config.get("transport");
                                        if (!content) this.innerHTML = ""
                                        else {
                                                json = {"sid":_sid, "filename":content};
                                                _transport.request("GetFile", json, function(data){
                                                        var _img = new Image(),
                                                            _ctx = node.getContext('2d');
                                                        _img.src = data;
                                                        node.width=_img.width;
                                                        node.height=_img.height;
                                                        _ctx.drawImage(_img,0,0);   
                                                });
                                        }       
                                }
                        }),
                        "importprogress" : new Model(_progress, {
                                "showProgress" : function(status){
                                        (status)?this.innerHTML = status+'%':this.innerHTML="";
                                }
                        }),
                        "importevent" : new Event(_widget)        
                });
                
                _widget.cancel = function(event,node){
                        node.parentNode.classList.add("invisible");
                        $exit("import");        
                };
                
                _widget.check = function(event, node){
                        node.classList.remove("pressed");
                        if (node.files.length) _widget.preview('change', node);
                };
                
                _widget.cameraPreview = function(event, node){ 
                        var _img = new Image(),
                            _options = {quality:50, correctOrientation: true};
                        
                        function onSuccess(imageData){
                               _img.src = imageData;
                                setTimeout(function(){
                                        _drawImage(_img);
                                        document.getElementById("postpic").classList.remove("invisible");
                                        node.classList.remove("pressed");
                                }, 1000);
                        };
                        
                        function onFail(message){
                                alert("error: "+message);
                        };
                        
                        navigator.camera.getPicture(onSuccess, onFail, _options);       
                };
                
                _widget.picturePreview = function(event, node){
                        var source = navigator.camera.PictureSourceType.PHOTOLIBRARY;
                        
                        var _img = new Image(),
                            _options = {quality:50, correctOrientation: true, sourceType: source};
                        
                        function onSuccess(imageData){
                               _img.src = imageData;
                                setTimeout(function(){
                                        _drawImage(_img);
                                        document.getElementById("postpic").classList.remove("invisible");
                                        node.classList.remove("pressed");
                                }, 1000);
                        };
                        
                        function onFail(message){
                                alert("error: "+message);
                        };
                        
                        navigator.camera.getPicture(onSuccess, onFail, _options);
                                
                };
                
/*                _widget.preview = function(event, node){
                        
                        var _img = new Image(),
                            _reader = new FileReader();
                        
                        // first read the file to memory, once loaded resize and display upload button
                        _reader.onloadend = function(e) {
                                _img.src = e.target.result;
                                // timeout is needed to render image and obtain its dimensions
                                setTimeout(function(){
                                        _drawImage(_img);
                                        document.getElementById("postpic").classList.remove("invisible");
                                        }, 300);
                        };
                        _reader.readAsDataURL(node.files[0]);
                }; */
                
                _widget.press = function(event, node){
                        node.classList.add("pressed");      
                };
                
                _widget.post = function(event, node){
                        // upload current picture to the server
                        _uploadCanvas(_postit.get("content")).then(function(){
                                // add new post or replace previous one with new content
                                if (!_pos && _pos !== 0){
                                        $store.alter("push", JSON.parse(_postit.toJSON()));
                                }
                                else {
                                        $store.update(_pos, "content", _postit.get("content"));
                                }
                                node.classList.remove("pressed"); 
                                // reset postit & clear canvas
                                _widget.reset();
                                _progress.reset({"status": ""});
                                _clearCanvas();
                                $exit("import");
                        });  
                };
                
                _widget.reset = function reset($pos){
                        _pos = $pos;
                        
                        if (!_pos && _pos !== 0){
                                _postit.reset({"type": "import", "content":""});
                        }
                        else{
                               _postit.reset($store.get($pos)); 
                        }
                };
                
                _widget.setSessionId = function(sid){
                        _sid = sid;
                };
                
                _widget.del = function(event,node){
                        // check if postit has been previously saved -- if it's a new one delete == cancel
                        if (_pos || _pos === 0){
                                $store.del(_pos);
                        }
                        node.classList.remove("pressed");
                        node.parentNode.classList.add("invisible");
                        _widget.reset();
                        _clearCanvas();
                        $exit("import");        
                };

                return _widget;      
                   
           };
                
        });