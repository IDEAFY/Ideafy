define("Ideas", ["IdeaListHeader", "IdeaListStack", "IdeaContentStack", "Observable", "Olives/OObject", "Map"],
	function(IdeaListHeader, IdeaListStack, IdeaContentStack, Observable, OObject, Map){
		return function IdeasConstructor(libraryInit){
		
			/* ideas is a screen containing three main UIs
			 * a scrolling list on the left, a detail panel on the right and a popup for editing purposes
			 * more may be added in the future (e.g. additional popups)
			 */
			var ideas = new OObject();
			var observer = new Observable();
			
			ideas.alive(Map.get("ideas"));

			// initialize the UI when the library app is launched
			libraryInit.watch("startLibraryContent", function(){
				IdeaListHeader(observer);
				IdeaListStack(observer);
				IdeaContentStack(observer);
			});			

			return ideas;
						
		}
	});
