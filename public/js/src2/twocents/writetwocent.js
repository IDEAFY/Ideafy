define("WriteTwocent", ["Olives/OObject", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Ideafy/Utils"],
        function(Widget, Config, ModelPlugin, EventPlugin, Store, Utils){
                
                function WriteTwocentConstructor(){
                
                var user = Config.get("user"),
                    transport = Config.get("transport"),
                    now = new Date(),
                    twocent = new Store({"author": user.get("_id"), "message": "", "firstname": user.get("firstname"), "date": [now.getFullYear(), now.getMonth(), now.getDate()], "datemod": "", "plusones": 0, "replies": []}),
                    currentIdea,
                    cancel,
                    editTC = "new", // to distinguish between new and edit mode
                    position=0; // to know which position to update
                
                this.plugins.addAll({
                        "twocent": new ModelPlugin(twocent,{
                                setAvatar : function(author){
                                        this.setAttribute("style", "background: url('"+ Config.get("avatar") + "') no-repeat center center;");
                                },
                                date : function(date){
                                        if (date) {this.innerHTML = Utils.formatDate(date);}        
                                },
                                setVisible : function(date){
                                        (date) ? this.classList.remove("invisible") : this.classList.add("invisible");
                                }
                        }),
                        "labels": new ModelPlugin(Config.get("labels")),
                        "twocentevent": new EventPlugin(this)
                });        
                
                
                this.template = '<div class = "writeTwocent"><div class="userAvatar twocentAvatar" data-twocent="bind: setAvatar, author"></div><textarea class="twocentText" data-labels="bind: placeholder, addtwocentplaceholder" data-twocent="bind: value, message"></textarea><div class="writeFooter"><ul class="twocentContext"><li class="creadate"><span class="creadatelbl" data-labels="bind:innerHTML, twocentcreationdate"></span><span class="date" data-twocent="bind: date, date"></span></li><li class="moddate invisible" data-twocent="bind: setVisible, datemod"><span class="moddatelbl" data-labels="bind: innerHTML, twocentmodificationdate"></span><span class="date" data-twocent="bind: date, datemod"></span></li></ul><div class="twocentCancel" data-labels="bind: innerHTML, cancellbl" data-twocentevent="listen: touchstart, press; listen: touchend, cancel">Cancel</div><div class="twocentPublish" data-labels="bind: innerHTML, publishlbl" data-twocentevent="listen: touchstart, press; listen: touchend, publish">Publish</div></div></div>';
                        
                
                this.reset = function reset($id, $twocent, $pos, $cancel){
                        var now = new Date(),
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
                        cancel = $cancel;     
                };
                
                this.cancel = function(event, node){
                        node.setAttribute("style", "-webkit-box-shadow: none; background: #e69b73;");
                        // hide twocent writing interface -- currently does not work if it is in edit mode
                        (cancel)?cancel():document.getElementById("public-writetwocents").classList.add("invisible");
                };
                
                this.publish = function(event, node){
                        node.setAttribute("style", "-webkit-box-shadow: none; background: #8cab68;");
                        // message should not be empty (or do nothing)
                        if (twocent.get("message")){
                                var     content = JSON.parse(twocent.toJSON()), json, type;
                                        
                                (editTC === "new") ? type = editTC : type = "edit";
                                json = {docId: currentIdea, type: type, position: position, twocent: content};
                                transport.request("WriteTwocent", json, function(result){
                                        if (result !== "ok"){
                                                alert(Config.get("labels").get("somethingwrong"));        
                                        }
                                        else{
                                                //need to reset store
                                                this.reset(currentIdea);
                                                // hide write interface
                                                document.getElementById("public-writetwocents").classList.add("invisible");
                                        }               
                                }, this);
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
