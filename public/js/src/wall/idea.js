define("Ideafy/Idea", ["Map", "Config", "Ideafy/Utils","Store", "Olives/OObject", "Olives/Model-plugin", "Olives/UI-plugin", "Olives/Event-plugin", "CouchDBStore", "TwocentReply", "Ideafy/Avatar"],
	function(Map, Config, Utils, Store,  Widget, ModelPlugin, UIPlugin, EventPlugin, CouchDBStore, TwocentReply, Avatar){
		return function IdeaConstructor($data){

		//definition
			var idea = new Widget(),
		            dom = Map.get("idea"),
		            domWrite = Map.get("writePublicTwocent"),
			    store = new Store($data),
			    twocents = new Store([]),
			    avatars = Config.get("publicAvatars");

		//setup;


			idea.plugins.addAll({
				"idea" :new ModelPlugin(store, {
				        toggleRateEdit : function(authors){
				            if (authors.indexOf(Config.get("user").get("_id"))>-1) {
				                    this.setAttribute("name", "editIdea");
				                    this.setAttribute("style", "background:url('../img/wall/headerModifyYourIdea.png') no-repeat center center;")
				            }
				            else{
				                    this.setAttribute("name", "rateIdea");
				                    this.setAttribute("style", "background:url('../img/wall/vote.png') no-repeat center center;")
				            }       
				        },
					date : function date(date){
						this.innerHTML = Utils.formatDate(date);
					},
					setRating : function setRating(rating){
                                                this.innerHTMl = Utils.setRating(this, rating);
                                        },
                                        setNames : function(authornames){
                                                (authornames ===  Config.get("user").get("username")) ? this.innerHTML="You" : this.innerHTML = authornames;        
                                        },
					setAvatar : function setAvatar(authors){
                                           //check if more than one author and if so display mutli-deedee avatar
                                           if (authors.length>1){
                                                   this.setAttribute("style", "background:url('../img/userpics/deedee0.png');")
                                           }
                                           else {
                                                   if (authors[0] === Config.get("user").get("_id")){
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
				"label" : new ModelPlugin(Config.get("labels")),
				"twocents" : new ModelPlugin(twocents, {
                                        date : function date(date){
                                                this.innerHTML = Utils.formatDate(date);
                                        },
                                        setFirstName : function(firstname){
                                                if (firstname !== Config.get("user").get("firstname")){
                                                        this.innerHTML = firstname;
                                                }
                                                else {
                                                        var id = this.getAttribute("data-twocents_id");
                                                        if (twocents.get(id).author === Config.get("user").get("_id")){
                                                                this.innerHTML = "You";
                                                        }
                                                        else{
                                                                this.innerHTML = firstname;
                                                        }
                                                }
                                        },
                                        displayReplies : function(replies){
                                                if (!replies || !replies.length){
                                                        this.classList.add("invisible");}
                                                else {
                                                        var ui = new TwocentReply(replies),
                                                            frag = document.createDocumentFragment(),
                                                            id = this.getAttribute("data-twocents_id");
                                                        ui.render();
                                                        ui.place(frag);
                                                        
                                                        if (this.hasChildNodes){
                                                                this.replaceChild(frag, this.firstChild);
                                                        }
                                                        else {
                                                                this.appendChild(frag);
                                                        }
                                                        this.classList.remove("invisible");
                                                }     
                                        },
                                        setAvatar : function setAvatar(author){
                                           
                                                if (author === Config.get("user").get("_id")){
                                                        this.setAttribute("style", "background:url('"+Config.get("avatars").get(author)+"') no-repeat center center; background-size: cover;");        
                                                }
                                                else{
                                                    if (avatars.get(author)){
                                                        this.setAttribute("style", "background:url('"+avatars.get(author).img+"') no-repeat center center; background-size: cover;");        
                                                    }
                                                    else{
                                                        Utils.getUserAvatar(author, avatars);
                                                        avatars.watchValue(author, function(value){
                                                                if (value.status === "ready"){
                                                                        this.setAttribute("style", "background:url('"+value.img+"') no-repeat center center; background-size: cover;");
                                                                }
                                                        });       
                                                    }
                                                }
                                         }
                                     }),
				"ideaevent" : new EventPlugin(idea)
			});
			

			idea.reset = function(data){
			        // build idea header with data available from the wall view
				store.reset(data);
				// synchronize with idea document in couchDB to build twocents and ratings
				var ideaCDB = new CouchDBStore();
				ideaCDB.setTransport(Config.get("transport"));
				ideaCDB.sync("ideafy", data.id).then(function(){
				        twocents.reset(ideaCDB.get("twocents"));
				        //if there are no existing twocents, toggle display twocents writingUI
				        if (!twocents.getNbItems()){
				                document.getElementById("writePublicTwocent").classList.remove("invisible");
				        }
				        else{
				                document.getElementById("writePublicTwocent").classList.add("invisible");
				        }
				});
			};
			
			idea.action = function(event, node){
			        var name = node.getAttribute("name");
			        alert(name);
			};
			
			idea.addTwocent = function(){
			     alert('add twocent');        
			};

		      //init
			idea.alive(dom);

			return idea;
		};
	}
);