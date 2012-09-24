define("Library", ["Olives/OObject", "Map", "Olives/Event-plugin", "Olives/Model-plugin", "Config", "Stack", "Store", "Observable", "Ideas", "Decks", "Sessions", "CouchDBStore"],
	function(OObject, Map, EventPlugin, ModelPlugin, Config, Stack, Store, Observable, Ideas, Decks, Sessions, CouchDBStore){
		
		return function LibraryConstructor() {
			
			var  library = new OObject(),
			     libraryObserver = new Observable(),
			     libraryInit = new Observable(),
			     image = "",
			     contentMenu = new Store([
                                {name: "ideas", label: "Ideas"},
                                {name: "decks", label: "Decks"},
                                {name: "sessions", label: "Sessions"}
                                ]),
                             avatar = new Store({"image": ""}),
                             uid;		
						
			library.plugins.addAll({
				"event" : new EventPlugin(library),
				"headerleft" : new ModelPlugin(Config.get("user"), {
					notify: function(array){
						// if there are no notifications
						if (!array || array.length === 0) {
						        this.innerHTML = "You have no unread messages";
						        }
						else {
							// loop through messages and count unread ones
							var unread = 0;
							for (i=0, l=array.length; i<l; i++){
								if (array[i].status === "unread") {
								        unread+=1;
								}
							}
							if (unread === 0) {
							        this.innerHTML = "You have no unread messages";
							}
							else {
								if (unread === 1) {
								        this.innerHTML = "You have <b>1</b> unread message";
								        }
								 else {
								         this.innerHTML = "You have <b>"+unread+"</b> unread messages";
								 }
							}	
						}
					}
				}),
				"avatar": new ModelPlugin(avatar),
				"menu" : new ModelPlugin(contentMenu)
			});
			
			library.start = function(event, node) {
				Config.get("observer").notify("select-screen", node.getAttribute("name"));
				Config.set("previousScreen", "library");
			};
			
			library.display = function(event, node) {
				libraryObserver.notify("select-content", node.getAttribute("name"));
			};
			
			library.profile = function(event, node){
			        Config.get("observer").notify("select-screen", "dashboard");
			        Config.get("observer").notify("display-profile");
			        Config.set("previousScreen", "library");
			};
			
			library.mailbox = function(event, node){
			        Config.get("observer").notify("select-screen", "connect");
                                Config.get("observer").notify("display-mailbox");
                                Config.set("previousScreen", "library");
			};
							
			library.alive(Map.get("library"));
			
			
			// a function to build the library content
			var initLibrary = function(){
			        
				// creeate a stack of contenut UIs
				var contentStack = Stack(Map.get("libraryContent"));
			
				contentStack.addAll({"ideas": Ideas(libraryInit), "decks" : Decks(libraryInit), "sessions" : Sessions(libraryInit)});
				
				// initialize library content components
				libraryInit.notify("startLibraryContent");
				
				// initialize with ideas
				contentStack.show("ideas");
				
				// monitor content
				libraryObserver.watch("select-content", function(name){
					contentStack.show(name);	
					//do something with css class to identify which button is currently pushed
				});
				
				// get avatar && avatar changes
				uid = Config.get("user").get("_id");
                                image = Config.get("avatars").get(uid);
                                if (image){
                                        avatar.set("image", image);
                                }
                                else {
                                        avatar.set("image", "images/userpics/deedee0.png");
                                }
                                
                                Config.get("avatars").watchValue(uid, function(){
                                        console.log("new picture", Config.get("avatars").get(uid));
                                        avatar.set("image", Config.get("avatars").get(uid))
                                })
                        
				
			};
			
			// check if user is logged in prior to building the content UI
			Config.get("observer").watch("login-completed", function(){
				initLibrary();
				});
		        	
			return library;
		};
	}
);