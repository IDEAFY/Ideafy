define("Ideafy/Public", ["Map", "Ideafy/Wall", "Ideafy/Idea", "Olives/OObject", "Amy/Control-plugin"],
	function(Map, Wall, Idea, Widget, ControlPlugin){
		return function PublicConstructor(){
			var publicIdeas = new Widget(),
				wall = new Wall(),
				idea = new Idea(),
				dom = Map.get("publicIdeas");

			publicIdeas.plugins.add("public", new ControlPlugin(publicIdeas));

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