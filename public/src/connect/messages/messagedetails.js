define("NoMessage", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin"],
	function(OObject, Map, Store, ModelPlugin){
		
		return function NoMessageConstructor(cObserver){
			
			var NoMessage = new OObject();
			var nomsg = new Store({});
			
			NoMessage.plugins.add("nomsg", new ModelPlugin(nomsg));
			
			nomsg.set("url", "/images/social/nomsgselected.png");
			nomsg.set("msg", "No message selected");
			
			NoMessage.alive(Map.get("nomsgselected"));
			
			return NoMessage;
			
		};
	});


define("MessageDetails", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "Config", "Utils"],
	function(OObject, Map, Store, ModelPlugin, EventPlugin, CouchDBStore, Config, Utils){
		
		return function MessageDetailsConstructor(cObserver){
			
			var MessageDetails = new OObject(),
			     message = new Store(),
			     avatar = new Store({"image": "images/userpics/deedee0.png"}),
			     msgactions = new Store([]),
			     user = Config.get("user");
			
			
			MessageDetails.plugins.addAll({
				"message": new ModelPlugin(message, {
					formatDate: function(date){
						var now = new Date();
						if (date[0] === now.getFullYear() && date[1] === now.getMonth() && date[2] === now.getDate()){
							var hrs = date[3],
							    min = date[4],
							    sec = date[5];
							if (hrs<10) hrs = "0" + hrs;
							if (min<10) min = "0" + min;
							if (sec<10) sec = "0" + sec;
							this.innerHTML = hrs+":"+min+":"+sec;
						}
						else {
							this.innerHTML = new Date(date[0], date[1] , date[2], date[3], date[4]).toDateString(); //.toLocaleDateString();
						};
					},
					formatBody: function(body){
					  // parse message body and look for "_____"
                                         var pattern= /_____/g;
                                         if (pattern.test(body)) {body =  body.replace(pattern, "<br/><br/>_____<br/><i>")+"</i>";}
                                         this.innerHTML = body;   
					},
					formatAuthor: function(author){
						if (author === "IDEAFY" || author === "Taiaut") {
                                                        this.innerHTML = "IDEAFY";
                                                        }
                                                else {   
                                                        var cdb = new CouchDBStore(),
                                                            node = this.innerHTML;
                                                        cdb.setTransport(Config.get("Transport"));
                                                        cdb.sync("taiaut", "users", "_view/short", {key: '"'+author+'"'}).then(function(doc){
                                                                node.innerHTML = doc.get(0).value.username; 
                                                        });
                                                }
					}
				}),
				"avatar" : new ModelPlugin(avatar),
				"msgaction": new ModelPlugin(msgactions),
				"messageevent": new EventPlugin(MessageDetails)
			});
			
			var answerCXR = function(resp){
				
				var now = new Date(),
				    transport = Config.get("Transport"),
				    json={};
				
				// send response to sender
				json.dest = message.get("author");
				json.type = "INFO";
				json.resp = resp;
				json.date = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
				json.author = user.get("_id");
				json.username = user.get("username");
				json.status = "unread";
				(resp === "yes") ? json.object = "Your connection request was accepted" : json.object="Your connection request was denied";
				(resp === "yes") ? json.body = "You are now connected to " + user.get("username") : json.body = user.get("username")+" turned down your connection request";
				
				transport.request("Notify", json, function(result){
				        var result = JSON.parse(result);
					if (result[0].res !== "ok") {
					        alert("there was an error, please try again later");
					        }
					else {
					        // if contact is accepted then both user documents must be updated (connections update)
						if (resp === "yes") {
						          // add contact to user connections
                                                        cObserver.notify("contactreq-ok", message.get("contactInfo"));
                                        
                                                        // add on the other end as well
                                                        json.type = "INFO";
                                                        json.contactInfo = {
                                                                "userid": user.get("_id"),
                                                                "firstname": user.get("firstname"),
                                                                "lastname": user.get("lastname")     
                                                         };
                                                         console.log(json);
                                                         transport.request("CxEvent", json, function(result){
                                                                if (result !== "ok") {
                                                                        alert("there was an error adding the contact on the other end");
                                                                }
                                                                else {
                                                                        alert("You are now connected");
                                                                }   
                                                        });
                                                }
					}
				});
				
				// in both cases once the message is answered it should be deleted
				cObserver.notify("delete-message", message.get("msgid"));
				// switch display to no-message
                                cObserver.notify("no-message");
			};
			
			MessageDetails.action = function(event, node){
				
				var id = node.getAttribute("data-msgaction_id"),
				    action = msgactions.get(id).action;
				
				switch(action){
					case "delete":
						// switch display to no-message
						cObserver.notify("no-message");
						// notify list to delete this item
						cObserver.notify("delete-message", message.get("msgid"));
						// reset stores;
						message.reset();
						msgactions.reset([]);
						break;
					
					case "accept":
						// respond to sender
						answerCXR("yes");
						break;
					
					case "deny":
						// respond to sender
						answerCXR("no");
						break;
						
					case "reply":
					        var obj = {};
					        obj.type = "RSP";
					        obj.author = message.get("author");
					        obj.object = message.get("object");
					        obj.body = message.get("body");
					        cObserver.notify("compose-message", obj);
					        break;
					
					case "forward":
					        var obj = {};
                                                obj.type = "FWD";
                                                obj.author = message.get("author");
                                                obj.object = message.get("object");
                                                obj.body = message.get("body");
                                                cObserver.notify("compose-message", obj);
					        break;
				};
				
			};
			
			MessageDetails.popup = function(event,node){
			// if message is of type doc, then clicking on its body shows a zoom popup of the doc
			
			     if (message.get("type") === "DOC"){
			             Config.get("observer").notify("display-popup","connect", message.get("docType"), message.get("docId"));        
			     }
			        
			};
	
			cObserver.watch("display-message", function(msg, id){
				
				
				// reset message & avatar
				message.reset(msg);
				avatar.reset({"image": "images/userpics/deedee0.png"});
				message.set("msgid", id);
				console.log(msg);
				
				// get sender's avatar
                                // check if image is already stored locally
                                if (!Config.get("avatars").get(msg.author)){
                                        Utils.getAvatar(msg.author, msg.picture_file);
                                }
                                avatar.set("image", Config.get("avatars").get(msg.author));
                                // check for avatar changes
                                Config.get("observer").watch("avatar-loaded", function(uid){
                                        if (uid === msg.author){
                                                avatar.set("image", Config.get("avatars").get(uid));
                                        }      
                                });
                                
				// reset action list
				msgactions.reset([]);
				
				if (message.get("type") == "CXR"){
					msgactions.alter("push", {"label": "Accept", "action": "accept"});
					msgactions.alter("push", {"label": "Deny", "action": "deny"});
				};
				
				if (message.get("type") == "MSG"){
					if (message.get("author") != "IDEAFY") msgactions.alter("push", {"label": "Reply", "action": "reply"});
					if (message.get("author") != "IDEAFY") msgactions.alter("push", {"label": "Forward", "action": "forward"});
					if (message.get("author") != "IDEAFY") msgactions.alter("push", {"label": "Transfer", "action": "transfer"});
					msgactions.alter("push", {"label": "Delete", "action": "delete"});
				};
				
				if (message.get("type") == "DOC"){
					msgactions.alter("push", {"label": "View", "action": "view"});
					msgactions.alter("push", {"label": "Delete", "action": "delete"});
				};
				
				if (message.get("type") == "INFO"){
					msgactions.alter("push", {"label": "Delete", "action": "delete"});
				};
				
			});
		
			
			MessageDetails.alive(Map.get("messagedetails"));
			
			return MessageDetails;
			
		};
		
	});