define("Ideafy/Whiteboard", ["Amy/Stack-plugin", "Ideafy/Whiteboard/Default", "Ideafy/Whiteboard/Main", "Ideafy/Whiteboard/Postit", "Ideafy/Whiteboard/Import", "Ideafy/Whiteboard/Drawing", "Store"],
        function(Stack, Default, Main, Postit, Import, Drawing, Store){
        
                function WhiteboardConstructor($type, $store, $tools, $sid){
                        
                        var _wbContent = new Store([]), // a store of whiteboard objects
                            _stack = this;
                            
                        this.selectScreen = function selectScreen(name, param){
                                if (param){
                                        _stack.getStack().get(name).reset(param);
                                }
                                _stack.getStack().show(name);
                        };
                        
                        this.exitScreen = function exitScreen(name){
                                ($store.getNbItems()) ? _stack.getStack().show("main") : _stack.getStack().show("default");
                                $tools.set(name, "inactive");      
                        };
                        
                        this.getContent = function getContent(){
                                return _wbContent;
                        };
                        
                        
                        this.getStack().add("default", new Default($type));
                        this.getStack().add("main", new Main($store, $tools, this.selectScreen));
                        this.getStack().add("postit", new Postit($store, this.exitScreen));
                        this.getStack().add("import", new Import($store, $sid, this.exitScreen));
                        this.getStack().add("drawing", new Drawing($store, $sid, this.exitScreen));
                        
                        
                }
                
                return function WhiteboardFactory($type, $store, $tools, $sid){
                        WhiteboardConstructor.prototype = new Stack();
                        return new WhiteboardConstructor($type, $store, $tools, $sid);        
                };
        
        
        
        })
