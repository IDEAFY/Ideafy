define("DisplayIdea", ["Olives/OObject", "Map", "Store", "CouchDBStore", "Olives/Transport", "Config","Olives/Model-plugin", "Olives/Event-plugin"],
	function(OObject, Map, Store, CouchDBStore, Transport, Config, ModelPlugin, EventPlugin){
		
		return function DisplayIdeaConstructor(observer){
			
			var displayIdea = new OObject(),
			
			     buttonList = new Store([
				{"name": "edit", "style": "background-image: url('/images/library/editbutton.png')"},
				{"name": "requesttwocents", "style": "background-image: url('/images/library/request2cts.png');"},
				{"name": "sendtwocents", "style": "background-image: url('/images/library/send2cts.png');"},
				{"name": "share", "style": "background-image: url('/images/library/sharebutton.png');"},
				{"name": "mail", "style": "background-image: url('/images/library/mailbutton.png');"},
				{"name": "facebook", "style": "background-image: url('/images/library/facebookbutton.png');"},
				{"name": "twitter", "style": "background-image: url('/images/library/twitterbutton.png');"},
				{"name": "print", "style": "background-image: url('/images/library/printbutton.png');"},
				{"name": "delete", "style": "background-image: url('/images/library/deletebutton.png');"}
				]),
			     ideaButtons = new Store([]),
			     ideaRating = new Store([]),
			     shareLog = new Store([]),
			     ideaCDB = new CouchDBStore([]),
			
			
			     // a function that gets idea contents from database
			     syncIdea = function(id){
				ideaCDB.sync("taiaut", "ideas", "_view/all", {
				        key: '"'+id+'"',
				        include_docs: true
				});
			     },
			
			     // a function that displays the appropriate buttons
			     buildButtons = function(doc){
				var uid = Config.get("user").get("_id"),
				    authorIds = [],
				    sharedIds = [];
				// reset store first
				ideaButtons.reset([]);
				
				// get list of authors from cdbstore
				authorIds = doc.authors.concat();
				sharedIds = doc.sharedwith.concat();
				
				//1. Check if user is one of the authors of the idea
				if (authorIds.indexOf(uid)>-1) {
					// if user is the sole author of the idea he can edit it
					if(authorIds.length === 1) {ideaButtons.alter("push", buttonList.get(0));}
					ideaButtons.alter("push", buttonList.get(1));
					ideaButtons.alter("push", buttonList.get(3));
					ideaButtons.alter("push", buttonList.get(4));
					// check if user has a facebook profile
					if (Config.get("user").get("facebook") !== "") {ideaButtons.alter("push", buttonList.get(5));}
					// check if user has a twitter account
					if (Config.get("user").get("twitter") !== "") {ideaButtons.alter("push", buttonList.get(6));}
				}
				else {
					// 2. user can only send 2cts to its author(s)
					ideaButtons.alter("push", buttonList.get(2));
				}
				// always add a print button
				ideaButtons.alter("push", buttonList.get(7));
				
				// add a delete button if user is allowed to delete the idea
				// user can delete an idea from the database if he is the sole author
				// user can also delete an idea from his view if it has previously been shared with him
				if (((authorIds.indexOf(uid)>-1) && (authorIds.length === 1)) || (sharedIds.indexOf(uid)>-1)) {
					ideaButtons.alter("push", buttonList.get(8));
				}
			     },
			
			     // a function that initializes the model store for the rating UI
			     buildIdeaRating = function(rating){
				
				ideaRating.loop(function(value, idx){
					
					if (idx < Math.floor(rating)) {ideaRating.update(idx, "state", 1);}
					else if (idx === Math.floor(rating) && Math.round(rating-Math.floor(rating))) {ideaRating.update(idx, "state", 0.5);}
					else {ideaRating.update(idx, "state", 0);}
				});
			     },
			
			     // a function handling notofication of shared documents
			     notifyDocShared = function(dest, docId, docType, docTitle){
				
				var now = new Date(),
				    json={},
				    log= {};
				
				json.dest = dest;
				json.type = "DOC";
				json.docId = docId;
				json.docType = docType;
				json.status = "unread";
				json.date = [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
				json.author = Config.get("user").get("_id");
				json.picture_file = Config.get("user").get("picture_file");
				json.object = Config.get("user").get("username")+" has shared an idea with you";
				json.body = Config.get("user").get("username")+" has shared this idea with you : <b>"+docTitle+"</b>. Click on the title to view the idea content or access it from your library";
				
				log.date = json.date;
				log.doc = docId;
				log.dest =  dest;
				// need a popup to notify user of sharing result
				Config.get("Transport").request("Notify", json, function(result){
				        var res = parseShareResult(result);
					if (res.result) {log.result = true;}
					else { log.result = res.errors;}
					shareLog.alter("push", log);
				});
				
			     },
			     
			     // a function to parse sharing results
			     parseShareResult = function(res){
                  
                                var   shareOk = false,
                                      errors = [],
                                      result = JSON.parse(res);
                  
                                for (i=0, l=result.length; i<l; i++){
                                        if (result[i].res !== "ok") {
                                        errors.push(result[i].id);
                                        }      
                                }
                                 if (!errors.length) {shareOk = true;}
                  
                                return {"result": shareOk, "errors":errors};
                             },
			     
			     // a function that checks if a user can vote on the displayed idea
			     ratingAllowed = function(id){
				
				var allowed = false,
				    ia= [], // list of the authors of current idea
				    ri = [], //array of ideas rated by this user
				    uid = Config.get("user").get("_id");
				
				if (ideaCDB.get(0).doc.authors) {ia = ideaCDB.get(0).doc.authors;}
				if (Config.get("user").get("rated_ideas")) {ri = Config.get("user").get("rated_ideas");}
				// user is allowed to vote if : 1). Not an author 2). Not already cast a vote on this idea
				if (ia.indexOf(uid) < 0 && ri.indexOf(id)<0) {allowed = true;}
				return allowed;
			     },
			
			     // a function that tells server side to update idea document in database
			     updateIdeaRating = function(json){
				Config.get("Transport").request("Vote", json, function(result){
					if (result!="ok"){
						console.log("communication problem with the database, please try again later");
					}
					else {
					        console.log(result, "yes!!!");
					}
				})
			     };
                        
                        // adding plugins to OObject
                        
                        displayIdea.plugins.addAll({
                                "idea": new ModelPlugin(ideaCDB, {
                                                formatDate: function(creadate){
                                                        if (creadate) {this.innerHTML = new Date(creadate[0], creadate[1], creadate[2]).toDateString();}
                                                },
                                                setRatingDisplay: function(rating){
                                                        if(rating !== undefined){
                                                                var bool = ratingAllowed(ideaCDB.get(0).id),
                                                                v = ideaCDB.get(0).value.nbVotes;
                                                        
                                                                if (bool) {this.innerHTML= "Rate this idea:";}
                                                                else { 
                                                                        if (!v) {this.innerHTML = "No rating yet";}
                                                                        else if (v===1) {this.innerHTML = "Rating: <i>(1 vote)</i>";}
                                                                        else {this.innerHTML = "Rating: <i>("+v+" votes)</i>";} 
                                                                }
                                                                buildIdeaRating(rating);
                                                                buildButtons(ideaCDB.get(0).doc);
                                                        }
                                                }
                                }),
                                "buttons": new ModelPlugin(ideaButtons, {
                                        setstyle: function(style){
                                                this.setAttribute("style", style);
                                        }
                                }),
                                "idearating": new ModelPlugin(ideaRating, {
                                        setSrc: function(value){
                                                if (!value) {this.setAttribute("src", "/images/library/icon-gland-empty.png");}
                                                else if (value === 1) {this.setAttribute("src","/images/library/icon-gland-full.png");}
                                                else {this.setAttribute("src","/images/library/icon-gland-half.png");}
                                                this.setAttribute("draggable", false);
                                        }
                                }),
                                "action": new EventPlugin(displayIdea),
                        });

			// a method that triggers the actions associated with the various buttons
			displayIdea.action = function(event, node){
				var name = node.getAttribute("name"),
				    uid = Config.get("user").get("_id"),
				    doc = ideaCDB.get(0).doc;
				    currentIdea = ideaCDB.get(0).id;
				
				switch(name) {
					
					case "delete":
						/*
                                                * Deleting an idea from the list
                                                * Behavior is the following:
                                                * if user is sole author of the document the document will be deleted from the database
                                                * if user is one of several authors --> will need to be resolved later, for the time being deletion is impossible
                                                * if user is an allowed viewer (ie. sharedwith) and asks to delete the idea he will be removed from the sharedwith list
                                                * After deletion the display should revert to new idea and no item should be highlighted in the list
                                                */
                                                var removeIdeaCDB = new CouchDBStore({});
						removeIdeaCDB.setTransport(Config.get("Transport"));
						
						// check if user is the sole author of the idea then remove from database
						if ((doc.authors.length === 1) && (doc.authors[0] === uid)) {
							removeIdeaCDB.sync("taiaut", currentIdea).then(function(){
								removeIdeaCDB.remove();
								});
						}
						else {
							var pos = doc.sharedwith.indexOf(uid),
							    update = doc.sharedwith.splice(pos, 1);
							removeIdeaCDB.set("sharedwith", update);
							removeIdeaCDB.sync("taiaut", currentIdea).then(function(){
							        removeIdeaCDB.upload();
							});
						};
						
						observer.notify("display-new");
						break;
					
					case "edit":
							if ((doc.authors.length === 1) && (doc.authors[0] === uid)){
							         observer.notify("edit-idea", currentIdea);
							 }
							break;
							
					case "share":
							// start by displaying the contact selection screen -- need to pass existing sharedwith as parameter to avoid duplicate
							var title = doc.title,
							    sharedWith = doc.sharedwith.concat(),
							    authors = doc.authors.concat();
							    
							Config.get("observer").notify("select-share", currentIdea, title, sharedWith, authors);
							Config.get("observer").notify("select-screen", "connect");
							
							break;
					
				}
			};
						
			displayIdea.highlightGrade = function (event, node){
				if (ratingAllowed(ideaCDB.get(0).id)){
					ideaRating.loop(function(value, idx){
						 (idx<=node.getAttribute("data-idearating_id")) ? ideaRating.update(idx, "state", 1): ideaRating.update(idx, "state", 0)
					});
				}
			};
			
			/*
			 * A function that handles the rating
			 */
			displayIdea.rate = function(event, node){
				
				var grade = parseInt(node.getAttribute("data-idearating_id"))+1,
                                            idea = ideaCDB.get(0).id,
                                            arr = Config.get("user").get("rated_ideas") || [];
                                            json = {id : idea, vote: grade}; 
				
				if (ratingAllowed(idea)){
				        updateIdeaRating(json);
				        arr.unshift(idea);
				        Config.get("user").set("rated_ideas", arr);
				        Config.get("user").upload();
				}
				
			};
			
			
			/*
			 * A function used to enable horizontal scroll when the list of authors is too long to fit
			 */
			
			displayIdea.showAll = function(event, node){
				
				// need to find an other solution as this is very rigid -- width hardcoded
				if (node.offsetWidth > 298){
					node.parentElement.classList.remove("displayauthors");
					node.parentElement.setAttribute("style", "width: 390px; white-space:nowrap; overflow-x:scroll;");
				}
				
			};
			
			/* watch for idea display events -- either when selecting an idea from the list on the left
			 * or right after a new idea has been created
			 */
			
			observer.watch("display-idea", function(id){
				ideaCDB.unsync();
				ideaCDB.reset();
				// ideaRating.reset
                                ideaRating.reset([]);
                                for (i=0; i<5; i++) {ideaRating.alter("push", {"state": 0});}
                                // button reset
                                ideaButtons.reset([]);
                                
				syncIdea(id);	
			});
			
			/*
			 * watch for contact lists in case of "share" events
			 */
			Config.get("observer").watch("share-list", function(idea, title, idlist){
				// update sharedwith field 
				var cdb = new CouchDBStore();
				cdb.setTransport(Config.get("Transport"));
				console.log(idea);
				cdb.sync("taiaut", idea).then(function(){
					var arr=[];
					if (cdb.get("sharedwith") && cdb.get("sharedwith").length){
                                                arr = cdb.get("sharedwith");
                                        }
					arr = arr.concat(idlist);
					cdb.set("sharedwith", arr);
					cdb.upload();
					alert("Your idea has been shared successfully");
				}, function(){console.log("error not syncing with couchDB");});
				test1 = cdb;
				
				// notify users that they received a new document
				for (i=0, l=idlist.length; i<l; i++){
					notifyDocShared(idlist[i], idea, "idea", title);
				}
				
			});
			
			//init --> set couchDBStore transport
			ideaCDB.setTransport(Config.get("Transport"));
			
			displayIdea.alive(Map.get("displayidea"));
			
			return displayIdea;
			
		};
		
	});
