define("Messages", ["Olives/OObject", "Map", "Stack", "NoMessage", "MessageDetails", "Compose", "MessageBox"],
	function(OObject, Map, Stack, NoMessage, MessageDetails, Compose, MessageBox, Config, SyncUtils){
		
		return function MessagesConstructor(cObserver){
			
			var Messages = new OObject();
			var contentStack = new Stack(Map.get("messagecontentbox"))
			
			// build stack
			contentStack.addAll({"nomsgselected" : NoMessage(cObserver), "messagedetails" : MessageDetails(cObserver), "compose" : Compose(cObserver)});
			
			// handle events
			cObserver.watch("display-message", function(){
				contentStack.show("messagedetails");
			});
			
			cObserver.watch("compose-message", function(){
				contentStack.show("compose");
			});
			
			cObserver.watch("message-contact", function(){
			        contentStack.show("compose");     
			});
			
			cObserver.watch("no-message", function(){
				contentStack.show("nomsgselected");
			});
			
			// initialize
			cObserver.watch("init-messages", function(){
				// init left box
				MessageBox(cObserver);
				// display no message selected
				contentStack.show("nomsgselected");
			});
			
			Messages.alive(Map.get("msgcenter"));
			
			return Messages;
			
		};
	})
