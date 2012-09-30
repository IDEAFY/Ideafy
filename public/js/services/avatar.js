define("Ideafy/Avatar", ["Olives/OObject", "Olives/Model-plugin", "Ideafy/Utils", "Store"], 
        function (OObject, ModelPlugin, Utils, Store){
                
                return function AvatarConstructor(uid, dom){
                        
                        var avatar = new OObject(),
                            store = new Store();
                        
                        avatar.template="<div data-avatar='bind: setAvatar, img'></div>";    
                        
                        avatar.plugins.add("avatar", new ModelPlugin(store, {
                                setAvatar : function(img){
                                        this.setAttribute("style", "background: url('"+img+"')no-repeat center center; background-size: cover;");
                                }
                        }));
                        
                        Utils.getUserAvatar(uid, store);
                        
                        avatar.place(dom);
                        
                        return avatar;
                        
                };
                
        });
