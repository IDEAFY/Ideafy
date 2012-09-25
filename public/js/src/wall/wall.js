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

			store.sync("ideafy", "library", "_view/publicideas", {
				descending : true,
				limit : 100
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
			wall.alive(dom);

			return wall;
		};
	}
);