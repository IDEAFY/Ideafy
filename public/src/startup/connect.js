define("Connect", ["Olives/OObject", "Map", "Olives/Event-plugin", "Config", "Store", "Olives/Model-plugin", "Observable", "Stack", "Contacts", "Messages", "Twocents", "SyncUtils"],
	function(OObject, Map, EventPlugin, Config, Store, ModelPlugin, Observable, Stack, Contacts, Messages, Twocents, SyncUtils){
		
		return function ConnectConstructor() {
			
			var  connect = new OObject(),
			     contentMenu = new Store([
				{name: "contacts", label: "Connections"},
				{name: "messages", label: "Messages"},
				{name: "twocents", label: "Two Cents"}
			     ]),
			     connectStack = new Stack(Map.get("socialcontent")),
			     cObserver = new Observable();
			
			connect.plugins.addAll({
			"menu" : new ModelPlugin(contentMenu),	
			"event": new EventPlugin(connect)
			});
			
			connect.display = function(event, node){
				connectStack.show(node.getAttribute("name"));
			};
			
			connect.exit = function(event, node) {
				Config.get("observer").notify("select-screen", Config.get("previousScreen"));
				Config.set("previousScreen", "connect");
			};
			
			// send message from a contact
			cObserver.watch("message-contact", function(){connectStack.show("messages");});
			
			/**
			 * Global Events
			 */
			//initialization
			Config.get("observer").watch("login-completed", function(){
				// build the UIs in the stack
				connectStack.addAll({"contacts": Contacts(cObserver), "messages": Messages(cObserver), "twocents": Twocents(cObserver)});
				// init UIs
				cObserver.notify("init-contacts");
				cObserver.notify("init-messages");
				// show connections as the default
				connectStack.show("contacts");
				
			});
			
			// in case of a share-idea event switch stack to contacts
                        Config.get("observer").watch("select-share", function(){
                                connectStack.show("contacts");
                        });
			
			Config.get("observer").watch("display-mailbox", function(){
			        connectStack.show("messages");
			})
			
			connect.alive(Map.get("connect"));
			
			return connect;
		};
	}
);