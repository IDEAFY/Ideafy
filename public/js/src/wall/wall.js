define("Ideafy/Wall", ["Map", "Config", "Ideafy/Utils", "CouchDBStore", 
	"Olives/OObject", "Olives/Model-plugin", "Store", "Ideafy/Avatar"],
	function(Map, Config, Utils, CouchDBStore, Widget, ModelPlugin, Store, Avatar){
		return function WallConstructor(){

		//definition
			var wall = new Widget(),
				dom = Map.get("wall"),
				avatars = new Store(),
				store = new CouchDBStore();

		//setup
			store.setTransport(Config.get("transport"));
                        // the number of ideas to fetch from database in this veiw could be a user-defined parameter - perf related
			store.sync("ideafy", "library", "_view/publicideas", {
				descending : true,
				limit : 30
			});

			wall.plugins.addAll({
				"wall" : new ModelPlugin(store, {
					date : function date(date){
						this.innerHTML = Utils.formatDate(date);
					},

					setRating : function setRating(rating){
						this.innerHTMl = Utils.setRating(this, rating);
					},
					setAvatar : function setAvatar(authors){
                                           //check if more than one author and if so display mutli-deedee avatar
                                           if (authors.length>1){
                                                   this.setAttribute("style", "background:url('../img/userpics/deedee6.png') no-repeat center center; background-size: cover;");
                                           }
                                           else {
                                                   if (authors[0] === Config.get("user").get("_id") && Config.get("avatars").get(authors[0])){
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
                                "label" : new ModelPlugin(Config.get("labels"))
			});

			wall.getData = function(id){
				return store.get(id);
			};


		//init
		
			wall.alive(dom);

			return wall;
		};
	}
);