define("Sessions", ["Config", "Map", "Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "Utils"], 
	function(Config, Map, OObject, ModelPlugin, EventPlugin, CouchDBStore, Utils){
	
		return function SessionsConstructor(libraryInit){
			
			var sessions = new OObject();
			var sessionCDB = new CouchDBStore([]);
			sessionCDB.setTransport(Config.get("Transport"));
			
			sessions.plugins.addAll({
				"session": new ModelPlugin(sessionCDB,{
					setBG : function(id){
						(this.getAttribute("data-session_id")%2) ? this.setAttribute("style", "background:lavender;") : this.setAttribute("style", "background:lavenderblush");
					},
					formatDate : function(date){
						this.innerHTML = new Date(date[0], date[1], date[2]).toDateString();
					},
					formatMode : function(mode){
						switch(mode){
							case "quick":
								this.innerHTML = "Quick Brainstorming";
								break;
							default:
								this.innerHTML = "Ideation";
								break;
						}
					},
					formatInitiator : function(id){
						this.setAttribute("style", "font-weight: bold;");
						if (id) Utils.authorsToUserNames(this, [id]);
					},
					formatParticipants : function(participants){
						var arr;
						if (participants) {
						        arr = participants.concat();
						        } 
						if (arr && arr.length>0){
							var list;
							for (i=0,l=arr.length; i<l; i++){
									list = list+arr[i].username+"<br/>";
								};
							this.innerHTML = list;
						}
						else {
						        this.innerHTML="";
						}
					},
					formatIdeas : function(ideas){
						var list="";
						if (ideas && ideas.length>0){
							var arr = ideas.concat();
							if (arr && arr.length>0){
								for (i=0, l=arr.length; i<l; i++){
									list = list+arr[i].title+"<br/>"
								};
							};
						};
						this.innerHTML = list;
					},
					formatScore : function(score){
						if (score){
							this.innerHTML = score;
							// change style of score depending on value : e.g. green if excellent score, gray if low
						}
						else this.innerHTML = "N/A";
					},
					formatStatus : function(status){
						if (status == "in progress" || status == "ongoing") this.setAttribute("style", "font-style:italic;")
						else this.setAttribute("style", "font-variant: small-caps;");
						this.innerHTML = status;
					}
				}),
				"event": new EventPlugin(sessions)
			});
			
			sessionCDB.sync("taiaut", "library", "_view/sessions", {
				key: Config.get("uid"),
				descending: true
			});	
			
			sessions.deleteSession = function(event, node){
				var removeSessionCDB = new CouchDBStore({});
				removeSessionCDB.setTransport(Config.get("Transport"));
				
				var _id = sessionCDB.get(node.getAttribute("data-session_id")).value._id;
				
				alert("this will remove the session from the database");
				
				var sip = Config.get("user").get("sessionInProgress");
				console.log("Before test", "sip: ", sip, "to delete: ", _id);
				// check if this was last session in progress
				if (sip && _id == Config.get("user").get("sessionInProgress").id) {
					console.log("I am here", "sip: ", Config.get("user").get("sessionInProgress"), "to delete: ", _id);
					Config.get("observer").notify("delete-sip");
				}
				
				removeSessionCDB.sync("taiaut", _id).then(function(){
					removeSessionCDB.remove();
				});
			};
			
			sessions.playSession = function(event, node){
				// notify brainstorming app of session id 
				// if session is complete just display it (wrapup screen); if session was not finished then continue were it was left
				// and update session in progress
				var idx = node.getAttribute("data-session_id");
				// notify brainstorm app of session id and type
				Config.get("observer").notify("replay-session", sessionCDB.get(idx).value.mode, sessionCDB.get(idx).value._id);
				// switch to brainstorm app
				Config.get("observer").notify("select-screen", "brainstorm");
				Config.set("previousScreen", "library");
			};
			
			sessions.alive(Map.get("sessions"));
			
			return sessions;	
		};
});
