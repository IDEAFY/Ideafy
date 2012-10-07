define("SubMenu", ["Olives/OObject", "Olives/Model-plugin", "Amy/Control-plugin"],
        function(Widget, Model, Control){
                
                function SubMenuConstructor($store, $setView){
                        
                        this.plugins.addAll({
                                "option": new Model($store, {
                                        setImg : function(selected){
                                        }
                                }),
                                "menucontrol": new Control(this)
                        });
                        
                        this.template = '<div class="sub-menu" data-menucontrol="radio:a,selected,click,getSelectedView"><div class="left-caret"></div><ul class="menu-list" data-option="foreach"><li class="menu-item"><a class="library-item selected" data-option="bind: innerHTML, label; bind: name, name, bind: setImg, selected">My Ideas</a></li></ul></div>';
                        
                        this.getSelectedView = function(event){
                                // change background image
                                $setView(event.target.getAttribute("name"));
                        };        
                }
                
                return function SubMenuFactory($store, $setView){
                        SubMenuConstructor.prototype = new Widget();
                        return new SubMenuConstructor($store, $setView);
                };     
        });
