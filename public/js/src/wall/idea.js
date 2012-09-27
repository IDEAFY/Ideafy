define("Ideafy/Idea", ["Map", "Config", "Ideafy/Utils","Store", "Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "CouchDBStore"],
	function(Map, Config, Utils, Store,  Widget, ModelPlugin, EventPlugin, CouchDBStore){
		return function IdeaConstructor($data){

		//definition
			var idea = new Widget(),
		            dom = Map.get("idea"),
			    store = new Store($data),
			    twocents = new Store();

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
                                                   var avatar = new Store({"uid": authors[0], "img": "", "status": null});
                                                   Utils.getUserAvatar(avatar);
                                                   avatar.watchValue("status", function(value){
                                                           if (value === "ready"){
                                                                   node.setAttribute("style", "background:url('"+avatar.get("img")+"') no-repeat center center; background-size: cover;");
                                                           }       
                                                   });
                                           }     
                                        }
				}),
				"label" : new ModelPlugin(Config.get("labels")),
				"twocents" : new ModelPlugin(twocents),
				"ideaevent" : new EventPlugin(idea)
			});
			

			idea.reset = function(data){
			        // build idea header with data available from the wall view
				store.reset(data);
				
				// synchronize with idea document in couchDB to build twocents and ratings
				var ideaCDB = new CouchDBStore();
				ideaCDB.setTransport(Config.get("transport"));
				ideaCDB.sync("ideafy", data.get()).then(function(){
				        twocents.reset(ideaCDB.get("twocents"));
				})
			};

		//init
			idea.alive(dom);

			return idea;
		};
	}
);