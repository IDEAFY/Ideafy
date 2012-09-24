define("AddContact", ["Olives/OObject", "Map", "CouchDBStore", "Olives/Transport", "Config", "Olives/Model-plugin", "Olives/Event-plugin", "Store", "Utils", "Promise"],
	function(OObject, Map, CouchDBStore, Transport, Config, ModelPlugin, EventPlugin, Store, Utils, Promise){
		
		return function AddContactConstructor(cObserver){
			
			var AddContact = new OObject(),
			     model = new Store({"size": null, "email": "", "firstname": "", "lastname": "", "action": "", "result": "", "searchResult": "", "searchId": ""}),
			     userCDB = new CouchDBStore(),
			     user = Config.get("user");
			     
			userCDB.setTransport(Config.get("Transport"));
			
			AddContact.plugins.addAll({
				"model": new ModelPlugin(model, {
					setVisible : function(bool){
						(bool) ? this.classList.remove("invisible") : this.classList.add("invisible");
					}
				}),
				"addcontactevent": new EventPlugin(AddContact)
			});
			
			
			var checkExisting = function(id){
				
				var list;
				(user.get("connections")) ? list = user.get("connections").concat() : list =[];
				var existing = false;
				for (i=0, l=list.length; i<l; i++){
					if (list[i].userid == id) existing = true;
				};
				return existing;
			};
			
			var checkInvited = function(id){
				// check if user has already invited this particular contact
				var invitedCDB = new CouchDBStore();
				invitedCDB.setTransport(Config.get("Transport"));
				invitedCDB.sync("invites", id).then(function(){});
				
			};
			
			
			/*
			 * A function to connect to an existing user in the database
			 */
			var connectContact = function(id){
				
				var userNameCDB = new CouchDBStore();
				userNameCDB.setTransport(Config.get("Transport"));
				
				if (checkExisting(id)){
					model.set("result", "You are already connected !");	
				}
				else{
					// send CxReq message to id --> to be added with notifications
					notifyCxRequest(id);
				
					// set result string
					userNameCDB.sync("taiaut", "users", "_view/short", {key: '"'+id+'"'}).then(function(){
						model.set("result", "A connection request has been sent to "+userNameCDB.get(0).value.username+".");
						model.set("action", "");
						model.set("email", "");
					});
				}
			};
			
			/*
			 * A function to send an invitation email to someone
			 */
			var inviteContact = function(id){
				var sentOK = false,
				    transport = Config.get("Transport"),
				    promise = new Promise();
				transport.request("SendMail", {"type": "invite", "sender": user.get("username"), "recipient": id}, 
					function(res){
						(res.sendmail == "ok") ? sentOk = "yes": sentOK="no";
						promise.resolve(sentOk);
					});
				
				promise.then(function(res){
					console.log("sent: ", res);
					if (res){
						model.set("result", "An email has been sent to "+email);
						model.set("action", "");
						model.set("email", "");
					}
					else {
						model.set("result", "There was an error, please try again later");
					};
				});
			};
			
			var notifyCxRequest = function(id){
				
				var now = new Date();
				var transport = Config.get("Transport");
				var json={};
				
				json.dest = id;
				json.type = "CXR";
				json.status = "unread";
				json.date = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
				json.author = user.get("_id");
				json.picture_file = user.get("picture_file");
				json.object = user.get("username")+" wants to be a connection";
				json.body = "";
				json.contactInfo = { "firstname": user.get("firstname"), "lastname": user.get("lastname"), "userid": json.author };
				
				transport.request("Notify", json, function(result){
				        var result = JSON.parse(result);
					if (result[0].res === "ok") model.set("result", "Your connection request has been sent");
					else {
					        model.set("result", "There was an error, please try again later");
					}
				});
				
			};
			
			AddContact.action = function(event, node){
				if (model.get("action") == "Connect") connectContact(model.get("email"));
				else if (model.get("action") == "Invite") inviteContact(model.get("email"));
			};
			
			AddContact.checkMail = function(event, node){
				
				var email = node.value.toLowerCase();
				var emailPattern = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
				
				var searchMailCDB = new CouchDBStore();
				searchMailCDB.setTransport(Config.get("Transport"));
				
				if (emailPattern.test(email)){
					searchMailCDB.sync("taiaut", "users", "_view/short", {
						key: '"'+email+'"'
					}).then(function(){
						(searchMailCDB.getNbItems()) ? model.set("action", "Connect") : model.set("action", "Invite");
					});
				}
				else model.set("action", "");
			};
			
			AddContact.connectSearch = function(event, node){
				// manage contact notification by the application
				notifyCxRequest(model.get("searchId"));
				model.set("searchResult", "Your connection request has been sent");
				model.set("searchId", "");
			};
			
			AddContact.resetAction = function(event, node){
				// clear previous result
				model.set("result", "");
				// if delete cross is clicked in search field remove action button
				if (node.value === "") model.set("action", "");
			};
			
			AddContact.resetSearchResult = function(event, node){
				model.set("searchResult", "");
			};
			
			AddContact.search = function(event, node){
				
				var fn = model.get("firstname"),
				    ln = model.get("lastname"),
				    userName = fn.toLowerCase()+" "+ln.toLowerCase(),
				    userDisplay = fn.substring(0,1).toUpperCase()+fn.substring(1).toLowerCase()+" "+ln.substring(0,1).toUpperCase()+ln.substring(1).toLowerCase(),
				    usernameCDB = new CouchDBStore();
				usernameCDB.setTransport(Config.get("Transport"));
				
				if (model.get("lastname") && model.get("firstname") === "") model.set("searchResult", "Please enter user's first name");
				else if (model.get("firstname") && model.get("lastname") === "") model.set("searchResult", "Please enter user's last name");
				else if (model.get("firstname") && model.get("lastname")){ 
					var query = '"'+userName+'"';
					// query view as several people may have the same name
					usernameCDB.sync("taiaut", "users", "_view/username", {
						key: query
					}).then(function(doc){
						if (!doc.getNbItems()) model.set("searchResult", "User "+userDisplay+" was not found in the database. Enter email address in the field above to invite "+userName+" to join Ideafy");
						else if (doc.getNbItems() > 1) model.set("searchResult", "More than one "+userDisplay+" was found in the database: please specify an email address in the field above");
						else {
							if (checkExisting(doc.get(0).id)) {
								model.set("searchResult", "You are already connected to "+userDisplay);
								// reset search field
								model.set("firstname", "");
								model.set("lastname", "");
								model.set("searchId", "");
							}
							else {
								model.set("searchResult", "Found "+userDisplay+ " in the Ideafy database. Click to connect");
								model.set("searchId", doc.get(0).id);
							}
						}
					});
				}
				
			};
			
			cObserver.watch("show-addcontact", function(){
					
					model.reset({"size": null, "email": "", "firstname": "", "lastname": "", "action": "", "result": "", "searchResult": "", "searchId": ""});
					
					userCDB.sync("taiaut", "users", "_view/short").then(function(){
						model.set("size", userCDB.getNbItems());
					});
					
				});
			
			AddContact.alive(Map.get("addcontact"));
			
			return AddContact;
			
		}
		
	})
