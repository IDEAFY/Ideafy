define("Ideafy/SubMenu", ["Olives/OObject", "Olives/Model-plugin", "Config"],
        function(Widget, Model, Config){
                
                function SubMenuConstructor($dom){

                        // setup
                        this.plugins.addAll({
                                "label" : new Model(Config.get("labels"))
                        });
                        
                        this.show = function show(){
                                $dom.setAttribute("style", "display : block;");        
                        };
                        
                        this.hide = function hide(){
                                $dom.setAttribute("style", "display : none;");        
                        };
                        
                        this.alive($dom);     
                }
                
                return function SubMenuFactory($dom){
                        SubMenuConstructor.prototype = new Widget();
                        return new SubMenuConstructor($dom);
                };     
        });
