define("Ideafy/Public", ["Map", "Config","Ideafy/Wall", "Ideafy/Idea", "Olives/OObject", "Amy/Control-plugin", "Olives/Model-plugin"],
	function(Map, Config, Wall, Idea, Widget, ControlPlugin, ModelPlugin){
		return function PublicConstructor(){
			var publicIdeas = new Widget(),
				wall = new Wall(),
				idea = new Idea(),
				dom = Map.get("publicIdeas");

			publicIdeas.plugins.addAll({
			        "public": new ControlPlugin(publicIdeas),
			        "label" : new ModelPlugin(Config.get("labels"))
			     });

			publicIdeas.expand = function(){
				Map.get("wall").classList.toggle("expand");
				Map.get("idea").classList.toggle("expand");
			};

			publicIdeas.select = function(event, target){
				idea.reset(wall.getData(target.getAttribute("data-wall_id")));

			};

			publicIdeas.alive(dom);


		};
	}
);