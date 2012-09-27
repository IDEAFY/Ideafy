define("Ideafy/Wall", ["Map", "Config", "Ideafy/Utils", "CouchDBStore", 
	"Olives/OObject", "Olives/Model-plugin", "Store"],
	function(Map, Config, Utils, CouchDBStore, Widget, ModelPlugin, Store){
		return function WallConstructor(){

		//definition
			var wall = new Widget(),
				dom = Map.get("wall"),
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
					                           node.setAttribute("style", "background:url('"+avatar.get("img")+"') no-repeat center center;");
					                   }       
					           });
					   }     
					}
				}),
                                "label" : new ModelPlugin(Config.get("labels"))
			});

			wall.getData = function(id){
				return store.get(id);
			};


		//init
		       // make sure all ideas in the database match the template
		       var ideaCDB =  new CouchDBStore(),
		           template = Config.get("ideaTemplate");
		       ideaCDB.setTransport(Config.get("transport"));
		       ideaCDB.sync("ideafy", "ideas", "_view/all").then(function(store){
                              
                              store.loop(function(v,i){
                                 var idea = new CouchDBStore();
                                 idea.setTransport(Config.get("transport")); 
                                 
                                 idea.sync("ideafy", v.id).then(function(){
                                         alert(template);
                                         for (property in template){
                                                if (!idea.get(property)){
                                                      idea.set(property, template[property]);
                                                }
                                         }
                                         idea.upload().then(function(){
                                                 alert("idea " + idea.get("_id") + " successfully updated");
                                         });  
                                 });
                              });                              
                      });
		
			wall.alive(dom);

			return wall;
		};
	}
);