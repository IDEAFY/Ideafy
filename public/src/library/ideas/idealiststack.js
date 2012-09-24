define("IdeaListStack", ["Stack", "Map", "UserByDate", "UserByName", "BrowseByDate", "BrowseByName", "SearchUserByName", "SearchUserByDate", "SearchPublicByName", "SearchPublicByDate"], 
	function(Stack, Map, UserByDate, UserByName, BrowseByDate, BrowseByName, SearchUserByName, SearchUserByDate, SearchPublicByName, SearchPublicByDate){
		
		return function IdeaListStackConstructor(observer){
			
			var ideaListStack = new Stack(Map.get("idealiststack"));
			
			ideaListStack.addAll({
				"userByDate": UserByDate(observer),
				"userByName": UserByName(observer),
				"browseByDate": BrowseByDate(observer),
				"browseByName": BrowseByName(observer),
				"searchUserByDate": SearchUserByDate(observer),
				"searchUserByName": SearchUserByName(observer),
				"searchPublicByDate": SearchPublicByDate(observer),
				"searchPublicByName": SearchPublicByName(observer)
				});
			
			observer.watch("displayList", function(type, view){
				if (view == "userIdeas") {
					(type == "byName") ? ideaListStack.show("userByName"): ideaListStack.show("userByDate");
				}
				if (view == "publicIdeas") {
					(type == "byName") ? ideaListStack.show("browseByName"): ideaListStack.show("browseByDate");
				}
			});
			
			observer.watch("search-ideas", function(searchText, type, view){
				console.log(searchText, type, view);
				if (searchText == "") observer.notify("displayList", type, view);
				else{
					if (view == "userIdeas") {
						if (type == "byName") { 
							observer.notify("searchuserbyname", searchText);
							ideaListStack.show("searchUserByName");
						} 
						else {
							observer.notify("searchuserbydate", searchText);
							ideaListStack.show("searchUserByDate");
						}
					};
					if (view == "publicIdeas") {
						if (type == "byName") {
							observer.notify("searchpublicbyname", searchText);
							ideaListStack.show("searchPublicByName");
						}
						else{
							observer.notify("searchpublicbydate", searchText);
							ideaListStack.show("searchPublicByDate");	
						} 
					};
				};
				
			});
			
			// initialization
			ideaListStack.show("userByDate");
			
			return ideaListStack;
			
		};
	});
