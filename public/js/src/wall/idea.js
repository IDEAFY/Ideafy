define("Ideafy/Idea", ["Map", "Config", "Ideafy/Utils","Store", "Olives/OObject", "Olives/Model-plugin"],
	function(Map, Config, Utils, Store,  Widget, ModelPlugin){
		return function IdeaConstructor($data){

		//definition
			var idea = new Widget(),
				dom = Map.get("idea"),
				store = new Store($data);

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
				"label" : new ModelPlugin(Config.get("labels"))
			});
			

			idea.reset = function(data){
				store.reset(data);
			};

		//init
			idea.alive(dom);

			return idea;
		};
	}
);