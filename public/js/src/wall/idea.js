define("Ideafy/Idea", ["Map", "Config", "Ideafy/Utils","Store", "Olives/OObject", "Olives/Model-plugin", "Olives/UI-plugin", "Olives/Event-plugin", "CouchDBStore", "TwocentList", "WriteTwocent"],
	function(Map, Config, Utils, Store,  Widget, ModelPlugin, UIPlugin, EventPlugin, CouchDBStore, TwocentList, WriteTwocent){
		return function IdeaConstructor(obj){

		//definition
			var idea = new Widget(),
		            dom = Map.get("idea"),
		            domWrite = Map.get("writePublicTwocent"),
		            user = Config.get("user"),
		            transport = Config.get("transport"),
			    store = new Store(),
			    vote = new Store([{active: false},{active: false}, {active: false}, {active: false}, {active: false}]),
			    voted = false,
			    ideaCDB = new CouchDBStore(),
			    avatars = Config.get("publicAvatars"),
			    writeUI = new WriteTwocent();

		//setup;
                        ideaCDB.setTransport(Config.get("transport"));

			idea.plugins.addAll({
				"idea" :new ModelPlugin(store, {
				        toggleRateEdit : function(authors){
				            if (authors.indexOf(user.get("_id"))>-1) {
				                    this.setAttribute("name", "editIdea");
				                    this.setAttribute("style", "background:url('../img/wall/headerModifyYourIdea.png') no-repeat center center;")
				            }
				            else{
				                    this.setAttribute("name", "rateIdea");
				                    this.setAttribute("style", "background:url('../img/wall/vote.png') no-repeat center center;")
				            }       
				        },
				        toggleTwocentShare : function(authors){
                                            if (authors.indexOf(user.get("_id"))>-1) {
                                                    this.setAttribute("name", "shareIdea");
                                                    this.setAttribute("style", "background:url('../img/wall/25shareActive.png') no-repeat center center;background-size: 25px 25px;")
                                            }
                                            else{
                                                    this.setAttribute("name", "commentIdea");
                                                    this.setAttribute("style", "background:url('../img/wall/2cents.png') no-repeat center center; background-size: 15px 15px;")
                                            }       
                                        },
				        displayWriteTwocent : function(authors){
				            if (authors.indexOf(user.get("_id"))<0){
				                    this.classList.remove("invisible");        
				            }
				            else {
				                  this.classList.add("invisible");  
				            }      
				        },
					date : function date(date){
						this.innerHTML = Utils.formatDate(date);
					},
					setRating : function setRating(rating){
                                                this.innerHTMl = Utils.setRating(this, rating);
                                        },
                                        setNames : function(authornames){
                                                (authornames ===  user.get("username")) ? this.innerHTML="You" : this.innerHTML = authornames;        
                                        },
                                        toggleVoteButton : function(votes){
                                                var idea = store.get("id"),
                                                    authors = store.get("value").doc.authors;  
                                                // check if user has already voted on this idea or if user is author
                                                if (user.get("rated_ideas").indexOf(idea)<0 && authors.indexOf(user.get("_id"))<0 && !voted)
                                                {
                                                        this.setAttribute("name", "vote");
                                                        this.innerHTML = Config.get("labels").get("votebuttonlbl");
                                                        this.classList.remove("votes");
                                                        this.classList.add("publicButton");
                                                }
                                                else{
                                                        this.classList.remove("publicButton");
                                                        this.setAttribute("name", "voted");
                                                        voted = true;
                                                        if (votes === 0){
                                                                this.innerHTML = "("+Config.get("labels").get("novotesyet")+")";
                                                        }
                                                        else if (votes === 1){
                                                                this.innerHTML = "("+ Config.get("labels").get("onevote")+")";
                                                        }
                                                        else{
                                                                this.innerHTML = "("+votes + " "+Config.get("labels").get("votes")+")";
                                                        }
                                                        this.classList.add("votes");
                                                }               
                                        },
					setAvatar : function setAvatar(authors){
                                           //check if more than one author and if so display mutli-deedee avatar
                                           if (authors.length>1){
                                                   this.setAttribute("style", "background:url('../img/userpics/deedee0.png');")
                                           }
                                           else {
                                                   if (authors[0] === user.get("_id")){
                                                        this.setAttribute("style", "background:url('"+Config.get("avatars").get(authors[0])+"') no-repeat center center; background-size: cover;");        
                                                   }
                                                   else{
                                                        if (avatars.get(authors[0])){
                                                                this.setAttribute("style", "background:url('"+avatars.get(authors[0]).img+"') no-repeat center center; background-size: cover;");        
                                                        }
                                                        else{
                                                                Utils.getUserAvatar(authors[0], avatars);
                                                                avatars.watchValue(authors[0], function(value){
                                                                        if (value.status === "ready"){
                                                                                this.setAttribute("style", "background:url('"+value.img+"') no-repeat center center; background-size: cover;");
                                                                        }
                                                                });       
                                                        }
                                                   }
                                           }     
                                        }
				}),
				"details" : new ModelPlugin(ideaCDB, {
				        displayTwocents : function(twocents){
				                if (twocents && twocents.length){
				                    // hide twocent write interface    
				                    document.getElementById("writePublicTwocent").classList.add("invisible");
				                    var _UI = new TwocentList(twocents, ideaCDB.get("_id"), "public"),
				                        _frag = document.createDocumentFragment();
				                    _UI.render();
                                                    _UI.place(_frag);
                                                    if (this.hasChildNodes()){
                                                        this.replaceChild(_frag, this.firstChild);
                                                    }
                                                    else {
                                                        this.appendChild(_frag);
                                                    }    
				                }
				                else {
				                    // remove child if present
				                    if (this.hasChildNodes()){
				                            this.removeChild(this.firstChild);
				                    }       
				                }
				                
				        }
			
				}),
				"vote" : new ModelPlugin(vote, {
				        setIcon : function(active){
				                var styleActive = "background: url('../img/wall/ideaVoteActive.png') no-repeat center center;",
				                    styleInactive = "background: url('../img/wall/rateForList.png') no-repeat center center;";
				                
				            (active) ? this.setAttribute("style", styleActive) : this.setAttribute("style", styleInactive);
				        }
				}),
				"label" : new ModelPlugin(Config.get("labels")),
				"ideaevent" : new EventPlugin(idea)
			});
			

			idea.reset = function(obj){
			        var id = obj.id, cdbstore = obj.store, voted = false;
			        
			        // build idea header with data available from the wall view
				store.reset(cdbstore.get(id));
				// build twocent writing interface and pass the idea's id as paramater
				writeUI.reset(store.get("id"));
				// synchronize with idea document in couchDB to build twocents and ratings
				ideaCDB.unsync();
				ideaCDB.reset();
				ideaCDB.sync("ideafy", store.get("id"));
				
				// watch cdbstore for changes regarding this idea and update header accordingly
				cdbstore.watch("updated", function(idx, value){
				        console.log(idx, value, id);
				        if (idx === parseInt(id)){
				            store.reset(value);        
				        }
				});
			};
			
			idea.action = function(event, node){
			        var name = node.getAttribute("name");
			        switch(name){
			                
			                case "commentIdea":
			                     document.getElementById("writePublicTwocent").classList.remove("invisible");
			                     break;
			                
			                case "shareIdea":
			                     break;
			                
			                case "rateIdea":
			                     // should be added to favorites instead
			                     break;
			                     
			                case "editIdea":
			                     break;
			        }       
			};
			
			idea.vote = function(event, node){
			        if (node.getAttribute("name") === "vote"){
			                //display voting popup
			                document.getElementById("ratingPopup").classList.add("appear");
			        }
			};
			
			idea.previewVote = function(event, node){
			     var i=0, idx = node.getAttribute("data-vote_id");
			     
			     vote.loop(function(v,i){
			             (i<=idx) ? vote.update(i, "active", true):vote.update(i, "active",false);        
			     });            
			};
			
			idea.castVote = function(event, node){
			        var grade = parseInt(node.getAttribute("data-vote_id"))+1,
			            json = {id : store.get("id"), vote: grade, voter: user.get("_id")};
			        
			        // prevent multiple votes on the same idea -- if request fails 
			        voted = true;
			        transport.request("Vote", json, function(result){
                                        if (result!="ok"){
                                                console.log(result, "something went wrong, please try again later");
                                                voted = false;
                                        }
                                        else {
                                                alert(Config.get("labels").get("thankyou"));
                                                document.getElementById("ratingPopup").classList.remove("appear");
                                                node.classList.remove(popupButton);
                                                node.setAttribute("name", "voted");
                                                node.classList.add("votes");
                                        }
                                });
			};

		      //init
			idea.alive(dom);
			writeUI.place(domWrite);

			return idea;
		};
	}
);