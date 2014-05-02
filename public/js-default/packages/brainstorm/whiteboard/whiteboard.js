/**
 * https://github.com/IDEAFY/Ideafy
 * Proprietary License - All rights reserved
 * Author: Vincent Weyl <vincent@ideafy.com>
 * Copyright (c) 2014 IDEAFY LLC
 */

define(["Amy/Stack-plugin", "./wbdefault", "./wbmain", "./wbpostit", "./wbimport", "./wbdrawing", "Store"],
        function(Stack, Default, Main, Postit, Import, Drawing, Store){
        
                function WhiteboardConstructor($type, $store, $tools, $mode){
                        
                        var _wbContent = new Store([]), // a store of whiteboard objects
                            _stack = this;
                            
                        this.selectScreen = function selectScreen(name, param){
                                var ui = _stack.getStack().get(name);
                                ui.reset && ui.reset(param);
                                _stack.getStack().show(name);
                        };
                        
                        this.exitScreen = function exitScreen(name){
                                ($store.getNbItems()) ? _stack.getStack().show("main") : _stack.getStack().show("default");
                                $tools.set(name, "inactive");      
                        };
                        
                        this.getContent = function getContent(){
                                return _wbContent;
                        };
                        
                        this.setSessionId = function(sid){
                                _stack.getStack().get("main").setSessionId(sid);
                                _stack.getStack().get("import").setSessionId(sid);
                                _stack.getStack().get("drawing").setSessionId(sid);
                        };
                        
                        this.setReadonly = function(bool){
                                _stack.getStack().get("main").setReadonly(bool);
                        };
                        
                        this.getStack().add("default", new Default($type, $mode));
                        this.getStack().add("main", new Main($store, $tools, this.selectScreen));
                        this.getStack().add("postit", new Postit($store, this.exitScreen));
                        this.getStack().add("import", new Import($store, this.exitScreen));
                        this.getStack().add("drawing", new Drawing($store, this.exitScreen));
                        
                        this.init = function(){
                                _stack.getStack().get("main").init($type);
                        };
                }
                
                return function WhiteboardFactory($type, $store, $tools, $mode){
                        WhiteboardConstructor.prototype = new Stack();
                        return new WhiteboardConstructor($type, $store, $tools, $mode);        
                };
        });
