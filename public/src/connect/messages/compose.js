define("Compose", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "Config", "CouchDBStore"], function(OObject, Map, Store, ModelPlugin, EventPlugin, Config, CouchDBStore) {

        return function ComposeConstructor(cObserver) {

                var Compose = new OObject(), newMessage = new Store(), info = new Store({
                        "message" : "",
                        "type" : "",
                        "field" : ""
                }), contactList = [],
                
                parseSendResult = function(res){
                  
                  var   sentOk = false,
                        errors = [],
                        result = JSON.parse(res);
                  
                  for (i=0, l=result.length; i<l; i++){
                      if (result[i].res !== "ok") {
                              errors.push(result[i].id);
                      }      
                  }
                  if (!errors.length) {sentOk = true;}
                  
                  return {"result": sentOk, "errors":errors};
                        
                },
                
                /**
                 * A function to check whether message recipients exist in the database and formatting "to:" field
                 * @param {string} toField the string of intended recipients
                 * @returns {array} the list of intended recipients (should be a contact name or an email address)
                 */
                parseToField = function(value) {

                        var recipients = [], trim = /^\s+|\s+$/g, toCDB = new CouchDBStore(), a, b;
                        if (value !== "") {
                                recipients = value.toLowerCase().split(",");
                                // if there is more than one recipient, trim white spaces at beginning/end of each entry
                                for ( i = 0, l = recipients.length; i < l; i++) {
                                        recipients[i] = recipients[i].replace(trim, "");
                                        // if recipient looks like 'username<userid>' extract userid
                                        a = recipients[i].search("<");
                                        b = recipients[i].search(">");
                                        if (a > -1 && b > -1) {
                                                recipients[i] = recipients[i].substring(a+1, b);
                                        }
                                }
                        }
                        return recipients;
                },
                sendNewMessage = function() {
                        var now = new Date(),
                            json = {
                                dest : newMessage.get("toList"),
                                type : "MSG",
                                status : "unread",
                                date : [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()],
                                author : newMessage.get("author"),
                                object : newMessage.get("object"),
                                body : newMessage.get("body"),
                                picture_file : newMessage.get("picture_file")
                        };
                        
                        Config.get("Transport").request("Notify", json, function onRes(result) {
                                var sentOk = parseSendResult(result);
                                if (sentOk.result){
                                        info.set("message", "Your message has ben sent");
                                        var exit = function(){
                                                newMessage.reset({
                                                        "author" : Config.get("user").get("_id"),
                                                        "toList" : [],
                                                        "recipients" : "",
                                                        "object" : "",
                                                        "body" : "",
                                                        "picture_file" : ""
                                                });
                                                cObserver.notify("no-message");
                                        };
                                        setTimeout(exit, 1500);
                                }
                                else{
                                        info.set("message", "Message partially sent, unable to reach"+sentOk.errors.join());
                                }
                        });

                };

                Compose.plugins.addAll({
                        "newmsg" : new ModelPlugin(newMessage, {
                                setPlaceHolder : function(object) {
                                        if (object === "") {
                                                this.setAttribute("placeholder", "Message from " + Config.get("user").get("username"));
                                        }
                                }
                        }),
                        "info" : new ModelPlugin(info, {
                                setStyle : function(type) {
                                        if (type === "error") {
                                                this.setAttribute("style", "font-weight:bold; background: lightsalmon;");
                                        } else {
                                                this.setAttribute("style", "font-weight: normal; background: white");
                                        }
                                }
                        }),
                        "newmsgevent" : new EventPlugin(Compose)
                });

                /**
                 * A function that looks up user contacts and suggests autocompletion
                 * @param {Event} event
                 * @param {Node} node
                 */
                Compose.autoCompleteToField = function(event, node) {

                        // clear error message
                        if (info.get("type") === "error" && info.get("field") === "to") {
                                info.reset({
                                        "message" : "",
                                        "type" : "",
                                        "field" : ""
                                });
                        }

                        // watch for character inputs in to field and try to autocomplete with contacts first names
                };

                Compose.send = function(event, node) {

                        // reset info field
                        info.reset({
                                "message" : "",
                                "type" : "",
                                "field" : ""
                        });
                        
                        // parse to: field : it cannot be empty and needs to be converted into an array
                        newMessage.set("toList", parseToField(newMessage.get("recipients")));

                        // if 'to' field is empty
                        if (!newMessage.get("recipients").length) {
                                info.set("type", "error");
                                info.set("field", "to");
                                info.set("message", "Please specify a recipient");
                                document.getElementById("tofield").setAttribute("style", "background: lightsalmon;");
                        }

                        // if both object and body fields are empty
                        if (!newMessage.get("object") && !newMessage.get("body")) {
                                info.set("type", "error");
                                info.set("field", "object");
                                info.set("message", "You can not send an empty message, please specify at least an object");
                        }

                        // if only object is empty replace it with default value
                        if (!newMessage.get("object") && newMessage.get("body")) {
                                newMessage.set("object", "Message from " + Config.get("user").get("username"));
                        }

                        // if there is no error so far, request server to check the list and if ok send message else display error
                        var json = {
                                list : newMessage.get("toList")
                        };
                        Config.get("Transport").request("CheckEmailList", json, function onRes(result) {
                                if (result.check === "Ok") {
                                        // format results
                                        var arr1 = [], // an array with all user ids
                                        arr2 = [];
                                        // an array of formatted recipients : 'username <userid>'
                                        for ( i = 0, l = result.output.length; i < l; i++) {
                                                arr1.push(result.output[i].userid);
                                                arr2.push(" " + result.output[i].username + " <" + result.output[i].userid + ">");
                                        }
                                        newMessage.set("toList", arr1);
                                        newMessage.set("recipients", arr2.join());

                                        // and finally send the message
                                        sendNewMessage();

                                } else {
                                        info.set("type", "error");
                                        info.set("field", "to");
                                        info.set("message", "Could not find " + result.missing.join() + " on Ideafy");
                                }

                        }, this);

                };

                cObserver.watch("compose-message", function(obj) {
                        
                        // pattern to remove html tags from body
                        var pattern = /<(.|\n)*?>/g;
                        
                        // refresh contactList
                        var arr1, arr2;
                        (Config.get("user").get("connections")) ? arr1 = Config.get("user").get("connections").concat() : arr1 = [];
                        (Config.get("user").get("groups")) ? arr2 = Config.get("user").get("groups").concat() : arr2 = [];
                        contactList = arr1.concat(arr2);

                        // reset all fields
                        newMessage.reset({
                                "author" : Config.get("user").get("_id"),
                                "toList" : [],
                                "recipients" : "",
                                "object" : "",
                                "body" : "",
                                "picture_file" : Config.get("user").get("picture_file")
                        });

                        info.reset({
                                "message" : "",
                                "type" : ""
                        });

                        // check if there is a user-defined avatar or put a dee-dee in there
                        if (!Config.get("user").get("picture_file")){
                                newMessage.set("picture_file", 0);
                        }
                        if (obj && obj.type == "RSP") {
                                obj.body = obj.body.replace(pattern, "");
                                newMessage.set("recipients", obj.author);
                                newMessage.set("object", "Re: "+obj.object);
                                newMessage.set("body", "\n_____\n\n"+obj.author+" wrote:\n\n"+obj.body);
                        }
                        if (obj && obj.type == "FWD") {
                                obj.body = obj.body.replace(pattern, "");
                                newMessage.set("object", "Fwd: "+obj.object);
                                newMessage.set("body", "\n_____\n\n"+obj.author+" wrote:\n\n"+obj.body);
                        };
                });
                
                cObserver.watch("message-contact", function(id, username){
                        // reset all fields
                        console.log(id, username);
                        newMessage.reset({
                                "author" : Config.get("user").get("_id"),
                                "toList" : [id],
                                "recipients" : username +"<"+id+">",
                                "object" : "",
                                "body" : "",
                                "picture_file" : Config.get("user").get("picture_file")
                        });

                        info.reset({
                                "message" : "",
                                "type" : ""
                        });
                });

                Compose.alive(Map.get("compose"));

                return Compose;

        };

})
