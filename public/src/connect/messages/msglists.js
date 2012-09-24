define("AllMessages", ["Olives/OObject", "Map", "Store", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore"],
	function(OObject, Map, Store, Config, ModelPlugin, EventPlugin, CouchDBStore){
		
		return function AllMessagesConstructor(cObserver){
			
			var AllMessages = new OObject(),
			     messages = new Store([]);
			     userCDB = new CouchDBStore();
			
			AllMessages.plugins.addAll({
				"msgmodel": new ModelPlugin(messages, {
					setColor: function(type){
						switch(type){
							case "CXR":
								this.setAttribute("style", "background: #5D7877");
								break;
							case "MSG":
								this.setAttribute("style", "background: #FC5E20");
								break;
							case "IVT":
								this.setAttribute("style", "background: #8E9E8B");
								break;
							case "DOC":
								this.setAttribute("style", "background: #F1E5B7");
								break;
							default:
								this.setAttribute("style", "background: #292929");
								break;
						};
					},
					setStatus: function(status){
						(status && status == "read") ? this.setAttribute("style", "font-weight: normal;") : this.setAttribute("style", "font-weight: bold;");
					},
					formatDate: function(date){
						var now = new Date();
						if (date && date[0] === now.getFullYear() && date[1] === now.getMonth() && date[2] === now.getDate()){
							var hrs = date[3],
							    min = date[4],
							    sec = date[5];
							if (hrs<10) {hrs = "0" + hrs;}
							if (min<10) {min = "0" + min;}
							if (sec<10) {sec = "0" + sec;}
							this.innerHTML = hrs+":"+min+":"+sec;
						}
						else {
							this.innerHTML = new Date(date[0], date[1] , date[2], date[3], date[4]).toDateString(); //.toLocaleDateString();
						};
					},
					formatAuthor: function(author){
						if (author === "IDEAFY" || author === "Taiaut") {
						        this.innerHTML = "IDEAFY";
						        }
						else {   
						        var cdb = new CouchDBStore(),
						            node = this;
						        cdb.setTransport(Config.get("Transport"));
						        cdb.sync("taiaut", "users", "_view/short", {key: '"'+author+'"'}).then(function(doc){
                                                                node.innerHTML = doc.get(0).value.username;						        });
						}
					}
				}),
				"msgevent": new EventPlugin(AllMessages)
			});
			
			AllMessages.read = function(event, node){
				var id = node.getAttribute("data-msgmodel_id"),
				    arr = userCDB.get("notifications");
				
				// display message
				cObserver.notify("display-message", messages.get(id), id);
				//set status to read
				messages.update(id, "status", "read");
				arr[id].status = "read";
				// update user doc
				userCDB.set("notifications", arr);
				// upload to database
				userCDB.upload();
				
			};
			
			AllMessages.unread = function(event, node){
				var id = node.getAttribute("data-msgmodel_id"),
				    arr = userCDB.get("notifications");
				//set status to unread
				messages.update(id, "status", "unread");
				arr[id].status = "unread";
				// update user doc
				userCDB.set("notifications", arr);
				// upload to database
				userCDB.upload();
			};
			
			cObserver.watch("delete-message", function(id){
			        var arr = userCDB.get("notifications");
			        // delete from display
			        messages.del(id);
			        arr.splice(id, 1);
				// update user doc
				userCDB.set("notifications", arr);
				// and upload to database
				userCDB.upload();
			});
			
			// initialize
			userCDB = Config.get("user");
			messages.reset(userCDB.get("notifications"));
			       
		        // watch for new notifications
		        userCDB.watchValue("notifications", function(){
			            messages.reset(userCDB.get("notifications"));   
			       });	
			
			AllMessages.alive(Map.get("allmessages"));
			
			return AllMessages;
			
		};
	});

define("MPList", ["Olives/OObject", "Map", "Store", "Olives/Model-plugin"],
	function(OObject, Map, Store, ModelPlugin){
		
		return function MPListConstructor(cObserver){
			
			var MPList = new OObject();
			var coucou = new Store({"coucou": "coucou"});
			
			MPList.plugins.add("model", new ModelPlugin(coucou));
			
			MPList.alive(Map.get("mplist"));
			
			return MPList;
			
		};
	});

define("NotificationMSG", ["Olives/OObject", "Map"],
	function(OObject, Map){
		
		return function NotificationsMSGConstructor(cObserver){
			
			var NotificationMSG = new OObject();
			
			NotificationMSG.alive(Map.get("notifications"));
			
			return NotificationMSG;
			
		};		
	});
	
define("Unread", ["Olives/OObject", "Map"],
	function(OObject, Map){
		
		return function UnreadConstructor(cObserver){
			
			var Unread = new OObject();
			
			Unread.alive(Map.get("unread"));
			
			return Unread;
			
		};
	});
