define("WriteTwocent", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Ideafy/Utils"],
        function(Widget, Config, ModelPlugin, EventPlugin, Store, Utils){
                
                function WriteTwocentConstructor(){
                
                var user = Config.get("user"),
                    transport = Config.get("transport"),
                    twocent = new Store(),
                    currentIdea,
                    editTC = "new", // to distinguish between new and edit mode
                    position=0; // to know which position to update
                
                this.plugins.addAll({
                        "twocent": new ModelPlugin(twocent,{
                                setAvatar : function(author){
                                        this.setAttribute("style", "background: url('"+ Config.get("avatars").get(user.get("_id")) + "') no-repeat center center;");
                                },
                                date : function(date){
                                        if (date) {this.innerHTML = Utils.formatDate(date);}        
                                },
                                setVisible : function(date){
                                        (date) ? this.setAttribute("style", "display:block;") : this.setAttribute("style", "display: none");
                                }
                        }),
                        "labels": new ModelPlugin(Config.get("labels")),
                        "twocentevent": new EventPlugin(this)
                });        
                
                
                this.template = '<div class = "writeTwocent"><div class="userAvatar twocentAvatar" data-twocent="bind: setAvatar, author"></div><textarea class="twocentText" data-labels="bind: placeholder, addtwocentplaceholder" data-twocent="bind: value, message"></textarea><div class="writeFooter"><ul class="twocentContext"><li class="creadate"><span class="creadatelbl" data-labels="bind:innerHTML, twocentcreationdate"></span><span class="date" data-twocent="bind: date, date"></span></li><li class="moddate" data-twocent="bind: setVisible, datemod"><span class="moddatelbl" data-labels="bind: innerHTML, twocentmodificationdate"></span><span class="date" data-twocent="bind: date, datemod"></span></li></ul><div class="twocentCancel" data-labels="bind: innerHTML, cancellbl" data-twocentevent="listen: touchstart, press; listen: touchend, cancel">Cancel</div><div class="twocentPublish" data-labels="bind: innerHTML, publishlbl" data-twocentevent="listen: touchstart, press; listen: click, publish">Publish</div></div></div>';
                        
                
                this.reset = function($id, $twocent, $pos){
                        var now = new Date();
                            twocentTemplate = {"author": user.get("_id"), "message": "", "firstname": user.get("firstname"), "date": "", "datemod": "", "plusones": 0, "replies": []};
                        
                        if ($id) {
                                currentIdea = $id;
                                }
                        if ($twocent){
                                twocent.reset($twocent);
                                editTC = $twocent; // keeping original post before changes
                                position = $pos;
                                twocent.set("datemod", [now.getFullYear(), now.getMonth(), now.getDate()]); // setting modification date
                        }
                        else {
                                twocent.reset(twocentTemplate);
                                twocent.set("date", [now.getFullYear(), now.getMonth(), now.getDate()]);
                                editTC = "new";
                        }      
                };
                
                this.cancel = function(event, node){
                        node.setAttribute("style", "-webkit-box-shadow: none; background: #e69b73;");
                        (editTC === "new") ? this.reset(twocentTemplate) : this.reset(editTC);
                        // hide twocent writing interface
                        document.getElementById("writePublicTwocent").classList.add("invisible");  
                };
                
                this.publish = function(event, node){
                        node.setAttribute("style", "-webkit-box-shadow: none; background: #8cab68;");
                        // message should not be empty (or do nothing)
                        if (twocent.get("message")){
                                var     content = JSON.parse(twocent.toJSON());
                                        json = {docId: currentIdea, type: editTC, position: position, twocent: content};
                        
                                transport.request("WriteTwocent", json, function(result){
                                        if (result !== "ok"){
                                                alert(Config.get("labels").get("somethingwrong"));        
                                        }
                                        else{
                                                //need to reset store
                                                this.reset(currentIdea);
                                        }               
                                });
                        }
                };
                
                this.press = function(event, node){
                        node.setAttribute("style", "-webkit-box-shadow: inset 0 0 5px 1px rgba(0,0,0,0.6); background: #666666;");
                };
                
                }
                
                return function WriteTwocentFactory(){
                        WriteTwocentConstructor.prototype = new Widget;
                        return new WriteTwocentConstructor();
                };     
                
        });
