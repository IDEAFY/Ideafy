define("Ideafy/Idea", ["Map", "Config", "Ideafy/Utils","Store", "Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore", "Twocent"],
	function(Map, Config, Utils, Store,  Widget, ModelPlugin, EventPlugin, CouchDBStore, Twocent){
		return function IdeaConstructor($data){

		//definition
			var idea = new Widget(),
		            dom = Map.get("idea"),
		            domWrite = Map.get("writePublicTwocent"),
		            writeTwocent = new Twocent(domWrite),
			    store = new Store($data),
			    twocents = new Store([]),
			    avatars = new Store();

		//setup;


			idea.plugins.addAll({
				"idea" :new ModelPlugin(store, {
					date : function date(date){
						this.innerHTML = Utils.formatDate(date);
					},
					setRating : function setRating(rating){
                                                this.innerHTMl = Utils.setRating(this, rating);
                                        },
					setAvatar : function setAvatar(authors){
                                           var node = this;
                                           //check if more than one author and if so display mutli-deedee avatar
                                           if (authors.length>1){
                                                   node.setAttribute("style", "background:url('img/userpics/deedee4.png');")
                                           }
                                           else {
                                                   if (authors[0] === Config.get("user").get("_id")){
                                                        node.setAttribute("style", "background:url('"+Config.get("avatars").get(authors[0])+"') no-repeat center center; background-size: cover;");        
                                                   }
                                                   else{
                                                        if (avatars.get(authors[0])){
                                                                node.setAttribute("style", "background:url('"+avatars.get(authors[0]).img+"') no-repeat center center; background-size: cover;");        
                                                        }
                                                        else{
                                                                Utils.getUserAvatar(authors[0], avatars);
                                                                avatars.watchValue(authors[0], function(value){
                                                                        if (value.status === "ready"){
                                                                                node.setAttribute("style", "background:url('"+value.img+"') no-repeat center center; background-size: cover;");
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
                                        setAvatar : function setAvatar(author){
                                           var node = this;
                                               avatar = new Store({"uid": author, "img": "", "status": null});
                                           Utils.getUserAvatar(avatar);
                                           avatar.watchValue("status", function(value){
                                                if (value === "ready"){
                                                        node.setAttribute("style", "background:url('"+avatar.get("img")+"') no-repeat center center; background-size: cover;");
                                                }       
                                           });
                                         }
                                     }),
				"ideaevent" : new EventPlugin(idea)
			});
			

			idea.reset = function(data){
			        // build idea header with data available from the wall view
				store.reset(data);
				// reset avatars
				avatars.reset({});
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
			
			idea.addTwocent = function(){
			     alert('add twocent');        
			};

		      //init
			idea.alive(dom);

			return idea;
		};
	}
);