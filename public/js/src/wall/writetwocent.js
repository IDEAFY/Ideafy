define("WriteTwocent", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store"],
        function(Widget, Config, ModelPlugin, EventPlugin, Store){
                
                function WriteTwocentConstructor(){
                
                var twocent = new Store(),
                    currentIdea,
                    user = Config.get("user"),
                    transport = Config.get("transport");
                
                this.plugins.addAll({
                        "twocent": new ModelPlugin(twocent),
                        "labels": new ModelPlugin(Config.get("labels")),
                        "twocentevent": new EventPlugin(this)
                });        
                
                
                this.template = '<div class = "writeTwocent"><div class="userAvatar twocentAvatar" data-twocent="bind: setAvatar, author"></div><textarea class="twocentText" data-labels="bind: placeholder, addtwocentplaceholder" data-twocent="bind: value, message"></textarea><div class="writeFooter"><ul class="twocentContext"><li class="creadate"><span class="creadatelbl" data-labels="bind:innerHTML, twocentcreationdate"></span><span data-twocent="bind: date, date"></span></li><li class="moddate"><span class="moddatelbl" data-labels="bind: innerHTML, twocentmodificationdate" data-twocent="bind: setVisible, datemod"></span><span data-twocent="bind: date, datemod"></span></li></ul><div class="twocentCancel" data-labels="bind: innerHTML, cancellbl">Cancel</div><div class="twocentPublish" data-labels="bind: innerHTML, publishlbl">Publish</div></div></div>';
                        
                
                this.reset = function($id, $twocent){
                        console.log($id);
                        if ($id) {
                                currentIdea = $id;
                                }
                        if ($twocent){
                                twocent.reset($twocent);
                        }
                        else {
                                twocent.reset({"author": user.get("_id"), "message": "", "firstname": user.get("firstname"), "datemod": ""});
                        }      
                };
                
                }
                
                return function WriteTwocentFactory(){
                        WriteTwocentConstructor.prototype = new Widget;
                        return new WriteTwocentConstructor();
                };     
                
        });
