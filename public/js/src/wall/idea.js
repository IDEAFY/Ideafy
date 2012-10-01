define("Ideafy/Idea", ["Map", "Config", "Ideafy/Utils","Store", "Olives/OObject", "Olives/Model-plugin", "Olives/UI-plugin", "Olives/Event-plugin", "CouchDBStore", "TwocentList", "WriteTwocent"],
	function(Map, Config, Utils, Store,  Widget, ModelPlugin, UIPlugin, EventPlugin, CouchDBStore, TwocentList, WriteTwocent){
		return function IdeaConstructor($data){

		//definition
			var idea = new Widget(),
		            dom = Map.get("idea"),
		            domWrite = Map.get("writePublicTwocent"),
		            user = Config.get("user"),
			    store = new Store($data),
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
				            console.log(this, writeUI);
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
				                    
				                    var UI = new TwocentList(twocents, "public"),
				                        frag = document.createDocumentFragment();
				                    UI.render();
                                                    UI.place(frag);
                                                    if (this.hasChildNodes()){
                                                        this.replaceChild(frag, this.firstChild);
                                                    }
                                                    else {
                                                        this.appendChild(frag);
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
				"label" : new ModelPlugin(Config.get("labels")),
				"ideaevent" : new EventPlugin(idea)
			});
			

			idea.reset = function(data){
			        // build idea header with data available from the wall view
				store.reset(data);
				// build twocent writing interface and pass the idea's id as paramater
				writeUI.reset(data.id);
				// synchronize with idea document in couchDB to build twocents and ratings
				ideaCDB.unsync();
				ideaCDB.reset();
				ideaCDB.sync("ideafy", data.id);
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
			writeUI.place(domWrite);

			return idea;
		};
	}
);