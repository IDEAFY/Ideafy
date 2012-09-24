define("MessageBox", ["Olives/OObject", "Map", "Stack", "Store", "Olives/Model-plugin", "Olives/Event-plugin", "AllMessages", "MPList", "NotificationMSG", "Unread"],
	function(OObject, Map, Stack, Store, ModelPlugin, EventPlugin, AllMessages, MPList, NotificationMSG, Unread){
		
		return function MessageBoxConstructor(cObserver){
		
		var MessageBox = new OObject();
		var options = new Store([{"label": "All", "view": "allmessages","selected": true, "visible": true},
								{"label": "Notifications", "view": "notifications", "selected": false, "visible": true},
								{"label": "Messages", "view": "mplist", "selected": false, "visible": true},
								{"label": "Unread", "view": "unread", "selected": false, "visible": true}
								]);
								
		var msgListStack = new Stack(Map.get("msgliststack"));
		
		msgListStack.addAll({
			"allmessages": AllMessages(cObserver),
			"mplist": MPList(cObserver),
			"notifications": NotificationMSG(cObserver),
			"unread": Unread(cObserver)
			});
		
		MessageBox.plugins.addAll({
			"options": new ModelPlugin(options, {
				setSelected : function (selected){
					(selected) ? this.setAttribute("style", "background: #F1E5B7; color: #292929; font-weight:bold"): this.setAttribute("style", "background: #8E9E8B; color: white; font-weight:normal");
				}
			}),
			"filterevent": new EventPlugin(MessageBox)
		});
		
		MessageBox.compose = function(event, node){
			cObserver.notify("compose-message");
		};
		
		MessageBox.filter = function(event, node){	
			
			var id = node.getAttribute("data-options_id");
			
			options.loop(function(value, idx){
				(idx == id) ? options.update(idx, "selected", true): options.update(idx, "selected", false);
			});
			
			msgListStack.show(options.get(id).view);
			
		};
		
		//Initialize -> show all messages
		msgListStack.show("allmessages");
		
		MessageBox.alive(Map.get("messagebox"));
		
		return MessageBox;	
			
		};
		
	});
