define("IdeaListHeader", ["Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin", "Map", "Store"],
	function(OObject, ModelPlugin, EventPlugin, Map, Store){
		return function IdeaListHeaderConstructor(observer){
		
		var ideaListHeader = new OObject();
		var currentType = ""; // used to keep track of sorting type
		var currentView = ""; // used to keep track of current view (between user and public)
		var searchResult = new Store({"result": ""});
		var dom = Map.get("idealistheader");
		
		ideaListHeader.plugins.addAll({
			"result": new ModelPlugin(searchResult),
			"tools": new EventPlugin(ideaListHeader)
		});
		
		/*
		 * A function that handles clicks on the browse button
		 */
		ideaListHeader.browse = function (event){
			var view;
			if (currentView == "userIdeas") {
				view = "publicIdeas";
				dom.querySelector(".browseideas").setAttribute("style", "background-image: url('/images/library/browseuserbutton.png')");
			}
			else if (currentView == "publicIdeas") {
				view = "userIdeas";
				dom.querySelector(".browseideas").setAttribute("style", "background-image: url('/images/library/browsepublicbutton.png')");
			};
			currentView = view;
			
			// if there is already a query in the search field then take it into account
			var search = searchResult.get("search");
			(search)? observer.notify("search-ideas", search, currentType, currentView): observer.notify("displayList", currentType, currentView);
		};
		
		/*
		 * A function that handles full text searches - gets the text input and passes it along to the appropriate searchList constructor
		 */
		
		ideaListHeader.search = function(event, node){
			
			searchResult.reset({"result": ""});
			
			if (event.keyCode == 13) {
				searchResult.set("search", node.value);
				observer.notify("search-ideas", node.value, currentType, currentView);
			};
		};
		
		
		/*
		 * A function that handles clicks on the sort button
		 */
		ideaListHeader.sort = function (event){
			var type;
			
			if (currentType == "byDate") {
				type = "byName";
				dom.querySelector(".sortideas").setAttribute("style", "background-image: url('/images/library/sortbydate.png')");
			}
			else if (currentType == "byName") {
				type = "byDate";
				dom.querySelector(".sortideas").setAttribute("style", "background-image: url('/images/library/sortbyname.png')");
			};
			currentType = type;
			// if there is already a query in the search field then take it into account
			var search = searchResult.get("search");
			(search)? observer.notify("search-ideas", search, currentType, currentView): observer.notify("displayList", currentType, currentView);
		};
		
		/*
		 * A function that notifies the idea creation UI
		 */
		
		ideaListHeader.addidea = function (){
			observer.notify("display-new");
		};
		
		/*
		 * Get results of current search and display
		 */
		
		// initialization : we need to set currentType @ userByDate
		currentType = "byDate";
		currentView = "userIdeas";
		
		ideaListHeader.alive(dom);
		
		return ideaListHeader;
	}
});
