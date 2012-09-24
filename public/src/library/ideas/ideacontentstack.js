define("IdeaContentStack", ["Stack", "Map", "NewIdea", "DisplayIdea", "EditIdea"],
	 function(Stack, Map, NewIdea, DisplayIdea, EditIdea){
	
	return function IdeaContentStackConstructor(observer){
		
		var ideaContentStack = new Stack(Map.get("ideacontentstack"));
		
		ideaContentStack.addAll({"newIdea": NewIdea(observer), "displayIdea": DisplayIdea(observer), "editIdea": EditIdea(observer)});
		
		observer.watch("display-idea", function(id){;
			ideaContentStack.show("displayIdea");
		})
		
		observer.watch("display-new", function(){
			ideaContentStack.show("newIdea");
		});
		
		observer.watch("edit-idea", function(){
			ideaContentStack.show("editIdea");
		});
		
		// initialize by showing the newIdea screen
		ideaContentStack.show("newIdea");
		
		return ideaContentStack;
		
	};
	
});
